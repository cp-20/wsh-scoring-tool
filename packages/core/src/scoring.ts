import lighthouse, { startFlow } from 'lighthouse';
import type { Config, Flags } from 'lighthouse';
import { launch } from 'chrome-launcher';
import { z } from 'zod';
import puppeteer from 'puppeteer';
import type { Page } from 'puppeteer';

const chromePath = process.env.CHROME_PATH;
if (chromePath === undefined) {
  throw new Error('環境変数 CHROME_PATH が設定されていません');
}

const landingIndexesSchema = z.object({
  fcp: z.number(),
  si: z.number(),
  lcp: z.number(),
  tbt: z.number(),
  cls: z.number()
});

const lhCommonFlags = {
  logLevel: 'error',
  output: 'json',
  onlyCategories: ['performance'],
  screenEmulation: {
    mobile: false,
    width: 1920,
    height: 1080
  }
} satisfies Flags;

const lhLandingFlags = {
  ...lhCommonFlags,
  onlyAudits: [
    'first-contentful-paint',
    'speed-index',
    'largest-contentful-paint',
    'total-blocking-time',
    'cumulative-layout-shift'
  ]
} satisfies Flags;

const lhConfig = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop'
  }
} satisfies Config;

const getPage = async (port: number) => {
  const res = await fetch(`http://localhost:${port}/json/version`);
  const json = await res.json();
  const browser = await puppeteer.connect({
    browserWSEndpoint: json.webSocketDebuggerUrl
  });
  const page = await browser.newPage();
  return page;
};

export const measurePage = async (url: string, port: number) => {
  const result = await lighthouse(url, { ...lhLandingFlags, port }, lhConfig);

  if (result === undefined) {
    throw new Error('Lighthouse failed to run');
  }

  try {
    const indexes = landingIndexesSchema.parse({
      fcp: result.lhr.audits['first-contentful-paint'].score,
      si: result.lhr.audits['speed-index'].score,
      lcp: result.lhr.audits['largest-contentful-paint'].score,
      tbt: result.lhr.audits['total-blocking-time'].score,
      cls: result.lhr.audits['cumulative-layout-shift'].score
    });

    const score =
      indexes.fcp * 10 + indexes.si * 10 + indexes.lcp * 25 + indexes.tbt * 30 + indexes.cls * 25;

    return { indexes, score };
  } catch (err) {
    throw new Error(`Lighthouseの計測が失敗しました`);
  }
};

type CommonResult = {
  path: string;
  name: string;
  maxScore: number;
};
type SuccessResult = {
  success: true;
  score: number;
};
type FailedResult = {
  success: false;
  error: Error;
};
export type PageScoreResult = CommonResult & (SuccessResult | FailedResult);

type NavigationScenario = {
  name: string;
  type: 'navigation';
  path: string;
};
type UserFlowScenario = {
  name: string;
  type: 'user-flow';
  path: string;
  flow: (page: Page) => Promise<void>;
  setup?: (page: Page) => Promise<void>;
};
export type MeasureScenario = NavigationScenario | UserFlowScenario;

export const measure = async (
  entrypoint: string,
  scenarios: MeasureScenario[],
  callback: (result: PageScoreResult) => unknown
): Promise<PageScoreResult[]> => {
  const normalizedEntrypoint = entrypoint.endsWith('/') ? entrypoint.slice(0, -1) : entrypoint;

  const chrome = await launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
    chromePath,
    userDataDir: false
  });

  console.log(`Chrome running on ${chrome.port}`);

  const results: PageScoreResult[] = [];
  for (const scenario of scenarios) {
    const path = scenario.path;
    const name = scenario.name;
    const url = `${normalizedEntrypoint}${path}`;
    const maxScore = scenario.type === 'navigation' ? 100 : 50;
    const commonResult = { path, name, maxScore };
    try {
      if (scenario.type === 'navigation') {
        const result = await measurePage(url, chrome.port);
        console.log(`Measured ${url}: ${JSON.stringify(result)}`);
        const pageResult: PageScoreResult = {
          ...commonResult,
          success: true,
          ...result
        };
        results.push(pageResult);
        callback(pageResult);
      } else if (scenario.type === 'user-flow') {
        const result = await measureUserFlow(url, chrome.port, scenario.flow, scenario.setup);
        console.log(`Measured ${path}: ${JSON.stringify(result)}`);
        const pageResult: PageScoreResult = {
          ...commonResult,
          success: true,
          ...result
        };
        results.push(pageResult);
        callback(pageResult);
      } else {
        const _: never = scenario;
        throw new Error(`Unknown scenario type: ${scenario}`);
      }
    } catch (err) {
      console.error(`Error measuring ${path}: ${err}`);
      const pageResult: PageScoreResult = {
        ...commonResult,
        success: false,
        error: err as Error
      };
      results.push(pageResult);
      callback(pageResult);
    }
  }

  chrome.kill();
  chrome.process.kill();

  console.log('All done!');

  return results;
};

const userFlowIndexesSchema = z.object({
  tbt: z.number(),
  inp: z.number()
});

const lhUserFlowFlags = {
  ...lhCommonFlags,
  onlyAudits: ['total-blocking-time', 'interaction-to-next-paint']
} satisfies Flags;

export const measureUserFlow = async (
  url: string,
  port: number,
  flowFunc: (page: Page) => Promise<void>,
  setupFunc?: (page: Page) => Promise<void>
) => {
  const page = await getPage(port);
  await page.goto(url);

  const flow = await startFlow(page, {
    config: lhConfig,
    flags: lhUserFlowFlags
  });

  page.setDefaultNavigationTimeout(100 * 1000);
  page.setDefaultTimeout(100 * 1000);
  await setupFunc?.(page);
  await flow.startTimespan();
  await flowFunc(page);
  await flow.endTimespan();

  const result = (await flow.createFlowResult()).steps[0];

  try {
    const indexes = userFlowIndexesSchema.parse({
      tbt: result.lhr.audits['total-blocking-time'].score,
      inp: result.lhr.audits['interaction-to-next-paint'].score
    });

    const score = indexes.tbt * 25 + indexes.inp * 25;

    return { indexes, score };
  } catch (err) {
    console.log(result.lhr.audits['total-blocking-time']);
    console.log(result.lhr.audits['interaction-to-next-paint']);
    throw new Error(`Lighthouseの計測が失敗しました`);
  }
};
