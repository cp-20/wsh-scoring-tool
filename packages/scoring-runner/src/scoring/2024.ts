import { measure2024 } from '@wsh-scoring-tool/core';
import { updateComment } from '../github';

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

const template = (scores: (number | null)[], errors: { name: string; error: string }[]) => {
  const scoreTable = testCases
    .map((t, i) => {
      const score =
        scores[i] === null
          ? '計測できません'
          : scores[i] === undefined
            ? '未計測'
            : `${scores[i].toFixed(2)} / 100.00`;
      return `| ${t} | ${score} |`;
    })
    .join('\n');

  const totalScore = scores
    .filter((s) => s !== null)
    .reduce((acc, cur) => acc + cur, 0)
    .toFixed(2);

  const errorList = errors.map((e) => `- **${e.name}** | ${e.error}`).join('\n');

  const finished = scores.every((s) => s !== undefined);

  return `# 🚀 **模擬 Web Speed Hackathon へようこそ！**
### スコア

|テスト項目|スコア|
|---------|------|
${scoreTable}

**合計 ${totalScore} / 700.00**

### 計測できなかった原因
${errorList}${finished ? '\n\nℹ️ もう一度計測する場合は、 `/retry` とコメントしてください' : ''}`;
};

export const measure = async (entrypoint: string) => {
  const scores: (number | null)[] = [];
  const errors: { name: string; error: string }[] = [];
  await updateComment(template(scores, errors));
  const result = await measure2024(entrypoint, async (result) => {
    if (result.success) {
      scores.push(result.score);
    } else {
      scores.push(null);
      errors.push({ name: result.name, error: result.error.message });
    }
    await updateComment(template(scores, errors));
  });
  const score = result.map((r) => (r.success ? r.score : 0)).reduce((acc, cur) => acc + cur, 0);
  return score;
};
