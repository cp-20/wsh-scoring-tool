import { measure2024 as measure2024Core } from '@wsh-scoring-tool/core';
import { measure } from '.';

const testCases = [
  '[App] ホームを開く',
  '[App] 作者詳細を開く',
  '[App] 作品詳細を開く',
  '[App] エピソード詳細を開く',
  '[App] 作品を検索する',
  '[App] 漫画をスクロールして読む',
  '[App] 利用規約を開く',
  '[Admin] ログインする',
  '[Admin] 作品の情報を編集する',
  '[Admin] 作品に新しいエピソードを追加する'
];

export const measure2024 = (entrypoint: string) => measure(entrypoint, measure2024Core, testCases);
