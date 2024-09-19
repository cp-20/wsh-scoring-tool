import { updateComment } from '../github';
import type { PageScoreResult } from '@wsh-scoring-tool/core/src/scoring';

const template = (
  scores: { value: number | null; max: number }[],
  errors: { name: string; error: string }[],
  testCases: string[]
) => {
  const scoreTable = testCases
    .map((t, i) => {
      const score =
        scores[i] === undefined
          ? '未計測'
          : scores[i].value === null
            ? '計測できません'
            : `${scores[i].value.toFixed(2)} / ${scores[i].max.toFixed(2)}`;
      return `| ${t} | ${score} |`;
    })
    .join('\n');

  const totalScore = scores
    .map((s) => s.value)
    .filter((s) => s !== null)
    .reduce((acc, cur) => acc + cur, 0)
    .toFixed(2);
  const totalMaxScore = scores
    .map((s) => s.max)
    .reduce((acc, cur) => acc + cur, 0)
    .toFixed(2);

  const errorList = errors.map((e) => `- **${e.name}** | ${e.error}`).join('\n');

  const finished = scores.every((s) => s !== undefined);

  return `# 🚀 **模擬 Web Speed Hackathon へようこそ！**
### スコア

|テスト項目|スコア|
|---------|------|
${scoreTable}

**合計 ${totalScore} / ${totalMaxScore}**

### 計測できなかった原因
${errorList}${
    finished ? '\n\n---\n\nℹ️ もう一度計測する場合は、 `/retry` とコメントしてください' : ''
  }`;
};

export const measure = async (
  entrypoint: string,
  measureDI: (
    entrypoint: string,
    callback: (result: PageScoreResult) => unknown
  ) => Promise<PageScoreResult[]>,
  testCases: string[]
) => {
  const scores: { value: number | null; max: number }[] = [];
  const errors: { name: string; error: string }[] = [];
  await updateComment(template(scores, errors, testCases));
  const result = await measureDI(entrypoint, async (result) => {
    if (result.success) {
      scores.push({
        value: result.score,
        max: result.maxScore
      });
    } else {
      scores.push({
        value: null,
        max: result.maxScore
      });
      errors.push({ name: result.name, error: result.error.message });
    }
    await updateComment(template(scores, errors, testCases));
  });
  const score = result.map((r) => (r.success ? r.score : 0)).reduce((acc, cur) => acc + cur, 0);
  return score;
};
