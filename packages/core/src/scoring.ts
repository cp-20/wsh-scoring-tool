import lighthouse, { startFlow, startTimespan } from 'lighthouse';
import type { Config, Flags } from 'lighthouse';
import { launch } from 'chrome-launcher';
import { z } from 'zod';
import puppeteer from 'puppeteer';
import type { Page } from 'puppeteer';

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

type PageScoreResult =
  | {
      success: true;
      url: string;
      score: number;
    }
  | {
      success: false;
      url: string;
      error: unknown;
    };

export type MeasureScenario =
  | {
      name: string;
      type: 'navigation';
      path: string;
    }
  | {
      name: string;
      type: 'user-flow';
      path: string;
      flow: (page: Page) => Promise<void>;
      setup?: (page: Page) => Promise<void>;
    };

export const measure = async (entrypoint: string, scenarios: MeasureScenario[]) => {
  const normalizedEntrypoint = entrypoint.endsWith('/') ? entrypoint.slice(0, -1) : entrypoint;

  const chrome = await launch({
    chromeFlags: ['--headless', '--no-sandbox'],
    // chromeFlags: ["--no-sandbox"],
    chromePath: process.env.CHROME_PATH,
    userDataDir: false
  });

  console.log(`Chrome running on ${chrome.port}`);

  const results: PageScoreResult[] = [];
  for (const scenario of scenarios) {
    const url = `${normalizedEntrypoint}${scenario.path}`;
    try {
      if (scenario.type === 'navigation') {
        const result = await measurePage(url, chrome.port);
        console.log(`Measured ${url}: ${JSON.stringify(result)}`);
        results.push({
          success: true,
          url,
          ...result
        });
      } else if (scenario.type === 'user-flow') {
        const result = await measureUserFlow(url, chrome.port, scenario.flow, scenario.setup);
        console.log(`Measured ${url}: ${JSON.stringify(result)}`);
        results.push({
          success: true,
          url,
          ...result
        });
      } else {
        const _: never = scenario;
        throw new Error(`Unknown scenario type: ${scenario}`);
      }
    } catch (err) {
      console.error(`Error measuring ${url}: ${err}`);
      results.push({
        success: false,
        url,
        error: err
      });
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
    throw new Error(`Lighthouseの計測が失敗しました`);
  }
};
