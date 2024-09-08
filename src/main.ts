import type { Page } from "puppeteer";
import { measure, measureUserFlow } from "./scoring";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const entrypoint = "https://web-speed-hackathon-2024-sor4chi.fly.dev/";
const paths = [
  "/",
  // "/authors/fd3471c6-03ec-47a4-ab09-ad72a6a76a48",
  // "/books/259c948d-d216-4e53-9b14-3462e59c09e8",
];

const authorId = "a16ea1c8-9584-4139-bbe6-03175e301491";
const bookId = "ed941d18-6eb7-4e71-b7d0-dd2b4c870f39";
const episodeId = "d74a4adb-3c4d-4a7b-bbd9-7bbf0a3c6a4b";
const keywords = [
  "この",
  "あどけ",
  "ない",
  "恋愛",
  "に",
  "日常",
  "を",
];

await measure(entrypoint, [
  // [App] ホームを開く
  // { type: "navigation", path: "/" },

  // [App] 作者詳細を開く
  // { type: "navigation", path: `/authors/${authorId}` },

  // [App] 作品詳細を開く
  // { type: "navigation", path: `/books/${bookId}` },

  // [App] エピソード詳細を開く
  // { type: "navigation", path: `/books/${bookId}/episodes/${episodeId}` },

  // [App] 作品を検索する
  {
    type: "user-flow",
    path: "/search",
    flow: async (page) => {
      for (const keyword of keywords) {
        await page.type('input[placeholder="作品名を入力"]', keyword);
      }
    },
  },

  // [App] 漫画をスクロールして読む
  {
    type: "user-flow",
    path: `/books/${bookId}/episodes/${episodeId}`,
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
          await page.mouse.move(
            box.x + box.width / 8 * 7,
            box.y + box.height / 2,
            { steps: 10 },
          );
          await page.mouse.up();
          await sleep(1000);
        }
      } catch (err) {
        throw new Error(`漫画がスクロールできませんでした`);
      }
    },
  },

  // [App] 利用規約を開く
  {
    type: "user-flow",
    path: "/",
    flow: async (page) => {
      try {
        await page.locator("button")
          .filter((button) => button.textContent === "利用規約")
          .click();
      } catch (err) {
        throw new Error(`「利用規約」ボタンが見つかりませんでした`);
      }
      try {
        await page.locator("p")
          .filter((el) => el.innerText.includes("罪と罰"))
          .wait();
      } catch (err) {
        throw new Error(`利用規約が表示されませんでした`);
      }
    },
  },

  // [Admin] ログインする
  {
    type: "user-flow",
    path: "/admin",
    flow: async (page) => {
      try {
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', "administrator@example.com");
      } catch (err) {
        throw new Error(`メールアドレスの入力欄が見つかりませんでした`);
      }
      try {
        await page.waitForSelector('input[name="password"]');
        await page.type('input[name="password"]', "pa5sW0rd!");
      } catch (err) {
        throw new Error(`パスワードの入力欄が見つかりませんでした`);
      }
      try {
        await page.click('button[type="submit"]');
        await page.locator('button[type="submit"]')
          .filter((el) => el.innerText === "ログアウト")
          .wait();
      } catch (err) {
        throw new Error(`ログインできませんでした`);
      }
    },
    setup: async (page) => {
      await page.deleteCookie({
        name: "userId",
        domain: new URL(entrypoint).hostname,
      });
    },
  },

  // [Admin] 作品の情報を編集する
  {
    type: "user-flow",
    path: "/admin/books",
    flow: async (page) => {
      try {
        await page
          .locator(
            'section[aria-label="検索セクション"] div > label:nth-of-type(2)',
          ).click();
      } catch (err) {
        throw new Error(`検索フィルターが見つかりませんでした`);
      }
      try {
        await page.waitForSelector('input[name="query"]');
      } catch (err) {
        throw new Error(`検索欄が見つかりませんでした`);
      }
      try {
        for (const keyword of keywords) {
          await page.type('input[name="query"]', keyword);
          await sleep(1000);
        }
      } catch (err) {
        throw new Error(`作品の検索できませんでした`);
      }
      try {
        await page
          .locator("tbody button:first-of-type")
          .click();
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
          .filter((el) => el.textContent === "編集")
          .click();
      } catch (err) {
        throw new Error(`編集ボタンが押せませんでした`);
      }
      try {
        await page.waitForSelector('textarea[name="description"]');
      } catch (err) {
        throw new Error(`編集画面が開けませんでした`);
      }
      try {
        await page.type('textarea[name="description"]', "編集済み");
      } catch (err) {
        throw new Error(`説明文が編集できませんでした`);
      }
      try {
        await page
          .locator('button[type="submit"]')
          .click();
        await page.locator('section[aria-label="作品詳細"] > div > div > p')
          .filter((el) => el.innerText.includes("編集済み"))
          .wait();
      } catch (err) {
        throw new Error(`編集内容が保存できませんでした`);
      }
    },
  },

  // [Admin] 作品に新しいエピソードを追加する
  {
    type: "user-flow",
    path: "/admin/books",
    flow: async (page) => {
      try {
        await page
          .locator("tbody button:first-of-type")
          .click();
      } catch (err) {
        throw new Error(`作品が見つかりませんでした`);
      }
      try {
        await page.waitForSelector('section[aria-label="作品詳細"]');
      } catch (err) {
        throw new Error(`作品の詳細が開けませんでした`);
      }
      try {
        await page.locator("a")
          .filter((el) => el.textContent === "エピソードを追加")
          .click();
      } catch (err) {
        throw new Error(`エピソード追加ボタンが見つかりませんでした`);
      }
      try {
        await page.waitForSelector('input[name="title"]');
      } catch (err) {
        throw new Error(`エピソードタイトルの入力欄が見つかりませんでした`);
      }
      try {
        await page.type('input[name="title"]', "追加エピソード");
      } catch (err) {
        throw new Error(`エピソードタイトルが入力できませんでした`);
      }
      try {
        await page.type(
          'textarea[name="nameRuby"]',
          "ついかえぴそーど",
        );
      } catch (err) {
        throw new Error(`エピソードのふりがなが入力できませんでした`);
      }
      try {
        await page.type(
          'textarea[name="description"]',
          "追加のエピソード",
        );
      } catch (err) {
        throw new Error(`エピソードの説明文が入力できませんでした`);
      }
      try {
        await page.type('input[name="chapter"]', "100");
      } catch (err) {
        throw new Error(`エピソードの章が入力できませんでした`);
      }
      try {
        const imageInput = await page.locator('input[name="image"]')
          .waitHandle();
        await imageInput.uploadFile("src/assets/sample-thumbnail.png");
      } catch (err) {
        throw new Error(`エピソードのサムネイルがアップロードできませんでした`);
      }
      try {
        await page
          .locator('button[type="submit"]')
          .filter((el) => el.textContent === "作成")
          .click();
      } catch (err) {
        throw new Error(`エピソードが作成できませんでした`);
      }
      try {
        await page.waitForSelector('section[aria-label="作品詳細"]');
      } catch (err) {
        throw new Error(`エピソードが作成されませんでした`);
      }
      await sleep(10000);
    },
  },
]);
