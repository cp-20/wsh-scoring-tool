import type { Page } from 'puppeteer';
import type { MeasureScenario } from '../scoring';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitElementWithText = (page: Page, selector: string, text: string, arbitrary?: boolean) => {
  if (arbitrary) {
    return page.waitForFunction(
      ({ selector, text }) =>
        [...document.querySelectorAll(selector)].some((el) => el.textContent?.includes(text)),
      {},
      { selector, text }
    );
  }
  return page.waitForFunction(
    ({ selector, text }) =>
      [...document.querySelectorAll(selector)].some((el) => el.textContent === text),
    {},
    { selector, text }
  );
};

const initialize = async (entrypoint: string) => {
  try {
    await fetch(`${entrypoint}/api/v1/initialize`, { method: 'POST' });
  } catch (err) {
    throw new Error(`初期化に失敗しました`);
  }
};

const authorId = 'a16ea1c8-9584-4139-bbe6-03175e301491';
const bookId = 'ed941d18-6eb7-4e71-b7d0-dd2b4c870f39';
const episodeId = 'd74a4adb-3c4d-4a7b-bbd9-7bbf0a3c6a4b';
const searches = [
  {
    word: 'このあどけない',
    result: [
      '6a94cefd-e7dd-42a9-8c25-c2ff1a58950b',
      '1f9a03ce-7d8f-4aa4-a537-c8acf422d228',
      '4ab66e1b-658a-4c6c-966d-d652f6c657b9',
      '799a8956-a639-45ac-b0ca-f12df012b800',
      '602bae15-9636-43e1-9686-cf3de9bf2c07',
      '75464ed2-10da-49a5-836e-43206555793f',
      '463fa1bc-68d0-47c7-a3a6-1557f0d1c84f',
      '5c4a6f3d-7909-4431-86dd-8161e2b013bb',
      'e585d5f9-9db2-4486-8ec1-919162a1aa43',
      '0da6fb53-eb31-4ad1-a360-babde38273a3'
    ]
  },
  {
    word: '妹',
    result: [
      '30603155-dc21-46a2-9d7c-dc62221768f7',
      '56107d77-743f-47ef-aec1-770ade2f5d69',
      'af0a7540-e768-4023-a2d0-30d2cac53c42',
      '158f2b74-99e9-44b3-8667-8c7c505a1366',
      '39a959c7-d366-4207-8e1c-64be269f932a',
      '7dc1d260-1e7f-40cd-8657-9a134ea8dadd',
      'b6c1a792-245c-4f4d-b673-4e96f242409a',
      'd7d51241-8097-4bdc-90d7-9aa6d39f9375',
      'fa06122e-2752-40db-bfd8-96009c25fd54',
      '899623c2-9cf8-42b9-a69f-1ea2ae14ca75'
    ]
  },
  {
    word: '異世界',
    result: [
      'b1d0197b-d181-429c-90cd-e12a45fc2af3',
      '9768cbd6-c2d0-4db5-a41a-905d224137ad',
      '80172783-6712-4b22-8a5b-46fb001646be',
      '6b1918de-2b9b-4462-a74b-cb1d4a5cc4a3',
      '56107d77-743f-47ef-aec1-770ade2f5d69',
      '3a3d4974-70ef-4daa-a018-3e086f240712',
      'f881fff6-e419-485d-9662-0cf5f069ab64',
      '4d9cd7d2-9a88-463b-8419-91a7a6f04d51',
      'a11261b4-4100-4da0-be81-c14c3d761377',
      'dd3f0bd8-a745-463f-9305-8d48736dbf86'
    ]
  }
];

export const generateScenarios = (entrypoint: string): MeasureScenario[] => [
  {
    name: '[App] ホームを開く',
    type: 'navigation',
    path: '/'
  },
  {
    name: '[App] 作者詳細を開く',
    type: 'navigation',
    path: `/authors/${authorId}`
  },
  {
    name: '[App] 作品詳細を開く',
    type: 'navigation',
    path: `/books/${bookId}`
  },
  {
    name: '[App] エピソード詳細を開く',
    type: 'navigation',
    path: `/books/${bookId}/episodes/${episodeId}`
  },
  {
    name: '[App] 作品を検索する',
    type: 'user-flow',
    path: '/search',
    setup: async () => {
      await initialize(entrypoint);
    },
    flow: async (page) => {
      for (const s of searches) {
        await page.locator('input[placeholder="作品名を入力"]').fill(s.word);
        try {
          await page.waitForFunction(
            (expect) => {
              const actual = Array.from(document.querySelectorAll<HTMLAnchorElement>('ul > li > a'))
                .filter((_, i) => i < 10)
                .map((el) => new URL(el.href).pathname);

              if (actual.length !== expect.length) return false;
              if (!actual.every((href, i) => href === `/books/${expect[i]}`)) {
                return false;
              }
              return true;
            },
            {},
            s.result
          );
        } catch (err) {
          throw new Error(`検索結果が正しくありません`);
        }
      }
      await page.locator('ul > li:first-child > a').click();
      await page.waitForNavigation();
    }
  },
  {
    name: '[App] 漫画をスクロールして読む',
    type: 'user-flow',
    path: `/books/${bookId}/episodes/${episodeId}`,
    setup: async () => {
      await initialize(entrypoint);
    },
    flow: async (page) => {
      const container = await page
        .locator('section[aria-label="漫画ビューアー"] > div > div > div > div')
        .waitHandle();
      const box = await container.boundingBox();
      if (!box) {
        throw new Error(`漫画ビューワーが見つかりませんでした`);
      }
      await sleep(300);

      try {
        for (let i = 0; i < 3; i++) {
          await page.mouse.move(box.x + box.width / 8, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + (box.width / 8) * 7, box.y + box.height / 2, { steps: 10 });
          await page.mouse.up();
          await sleep(1000);
          // TODO: 漫画がスクロールできているかのチェック
        }
      } catch (err) {
        throw new Error(`漫画がスクロールできませんでした`);
      }
    }
  },
  {
    name: '[App] 利用規約を開く',
    type: 'user-flow',
    path: '/',
    flow: async (page) => {
      try {
        await page
          .locator('button')
          .filter((button) => button.textContent === '利用規約')
          .click();
      } catch (err) {
        throw new Error(`「利用規約」ボタンが見つかりませんでした`);
      }
      try {
        await waitElementWithText(page, 'section[role="dialog"] p', '罪と罰', true);
      } catch (err) {
        console.log(await page.content());
        throw new Error(`利用規約が表示されませんでした`);
      }
    }
  },
  {
    name: '[Admin] ログインする',
    type: 'user-flow',
    path: '/admin',
    setup: async (page) => {
      await initialize(entrypoint);
      try {
        await page.deleteCookie({
          name: 'userId',
          domain: new URL(entrypoint).hostname
        });
      } catch (err) {
        throw new Error(`初期化に失敗しました`);
      }
    },
    flow: async (page) => {
      try {
        await page.locator('input[name="email"]').fill('administrator@example.com');
      } catch (err) {
        throw new Error(`メールアドレスの入力欄が見つかりませんでした`);
      }
      try {
        await page.locator('input[name="password"]').fill('pa5sW0rd!');
      } catch (err) {
        throw new Error(`パスワードの入力欄が見つかりませんでした`);
      }
      try {
        await page.click('button[type="submit"]');
        await waitElementWithText(page, 'button', 'ログアウト');
      } catch (err) {
        throw new Error(`ログインできませんでした`);
      }
    }
  },
  {
    name: '[Admin] 作品の情報を編集する',
    type: 'user-flow',
    path: '/admin/books',
    setup: async (page) => {
      await initialize(entrypoint);
      try {
        if (new URL(page.url()).pathname === `/admin`) {
          await page.locator('input[name="email"]').fill('administrator@example.com');
          await page.locator('input[name="password"]').fill('pa5sW0rd!');
          await page.click('button[type="submit"]');
          await waitElementWithText(page, 'button', 'ログアウト');
        }
      } catch (err) {
        throw new Error(`ログインに失敗しました`);
      }
    },
    flow: async (page) => {
      try {
        await page
          .locator('section[aria-label="検索セクション"] div > label:nth-of-type(2)')
          .click();
      } catch (err) {
        throw new Error(`検索フィルターが見つかりませんでした`);
      }
      try {
        await page.waitForSelector('input[name="query"]');
      } catch (err) {
        throw new Error(`検索欄が見つかりませんでした`);
      }
      for (const s of searches) {
        await page.locator('input[name="query"]').fill(s.word);
        await page.waitForFunction(
          (expect) => {
            const actual = Array.from(
              document.querySelectorAll('tbody tr td:nth-of-type(2) p:nth-of-type(2)')
            )
              .filter((_, i) => i < 10)
              .map((el) => el.innerHTML);

            if (actual.length !== expect.length) return false;
            if (!actual.every((href, i) => href === expect[i])) return false;
            return true;
          },
          {},
          s.result
        );
      }
      try {
        await page.locator('tbody button:first-of-type').click();
      } catch (err) {
        throw new Error(`作品が見つかりませんでした`);
      }
      try {
        await page.waitForSelector('section[aria-label="作品詳細"]');
      } catch (err) {
        throw new Error(`作品の詳細が開けませんでした`);
      }
      try {
        await page
          .locator('section[aria-label="作品詳細"] button')
          .filter((el) => el.textContent === '編集')
          .click();
      } catch (err) {
        throw new Error(`編集ボタンが押せませんでした`);
      }
      try {
        await page.locator('textarea[name="description"]').fill('編集済み');
      } catch (err) {
        throw new Error(`説明文が編集できませんでした`);
      }
      try {
        await page.locator('button[type="submit"]').click();
        await waitElementWithText(page, 'section[aria-label="作品詳細"] p', '編集済み', true);
      } catch (err) {
        throw new Error(`編集内容が保存できませんでした`);
      }
    }
  },
  {
    name: '[Admin] 作品に新しいエピソードを追加する',
    type: 'user-flow',
    path: '/admin/books',
    setup: async (page) => {
      await initialize(entrypoint);
      try {
        if (new URL(page.url()).pathname === `/admin`) {
          await page.locator('input[name="email"]').fill('administrator@example.com');
          await page.locator('input[name="password"]').fill('pa5sW0rd!');
          await page.click('button[type="submit"]');
          await waitElementWithText(page, 'button', 'ログアウト');
        }
      } catch (err) {
        throw new Error(`ログインに失敗しました`);
      }
    },
    flow: async (page) => {
      try {
        await page.locator('tbody button:first-of-type').click();
      } catch (err) {
        throw new Error(`作品が見つかりませんでした`);
      }
      try {
        await page.waitForSelector('section[aria-label="作品詳細"]');
      } catch (err) {
        throw new Error(`作品の詳細が開けませんでした`);
      }
      try {
        await page
          .locator('section[role="dialog"] > div > div:nth-child(4) > a')
          .filter((el) => el.textContent === 'エピソードを追加')
          .click();
      } catch (err) {
        throw new Error(`エピソード追加ボタンが見つかりませんでした`);
      }
      try {
        await page.waitForSelector('form[aria-label="エピソード情報"]');
      } catch (err) {
        throw new Error('エピソード追加タブが開けませんでした');
      }
      try {
        await page.locator('input[name="name"]').fill('追加エピソード');
      } catch (err) {
        throw new Error(`エピソード名が入力できませんでした`);
      }
      try {
        await page.locator('input[name="nameRuby"]').fill('ついかえぴそーど');
      } catch (err) {
        throw new Error(`エピソードのふりがなが入力できませんでした`);
      }
      try {
        await page.locator('textarea[name="description"]').fill('追加のエピソード');
      } catch (err) {
        throw new Error(`エピソードの説明文が入力できませんでした`);
      }
      try {
        await page.locator('input[name="chapter"]').fill('100');
      } catch (err) {
        throw new Error(`エピソードの章が入力できませんでした`);
      }
      try {
        const imageInput = await page.locator('input[name="image"]').waitHandle();
        await imageInput.uploadFile('src/assets/sample-thumbnail.png');
      } catch (err) {
        throw new Error(`エピソードのサムネイルがアップロードできませんでした`);
      }
      try {
        await page
          .locator('button[type="submit"]')
          .filter((el) => el.textContent === '作成')
          .click();
      } catch (err) {
        throw new Error(`エピソードが作成できませんでした`);
      }
      try {
        await page.waitForResponse(
          (res) => res.request().method() === 'POST' && res.url().endsWith('/api/v1/episodes')
        );
      } catch (err) {
        throw new Error(`エピソードが作成されませんでした`);
      }
      await sleep(1000);
    }
  }
];
