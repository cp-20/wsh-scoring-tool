import type { AppType } from '@wsh-scoring-tool/lb-server';
import { hc } from 'hono/client';

const client = hc<AppType>('/');

export type RankingItemType = {
  rank: number;
  name: string;
  score: number;
  url: string;
  disqualified: boolean;
};

export const getRanking = async () => {
  const res = await client.api.ranking.$get({
    query: { after: '2024-09-21T10:00:00+09:00', before: '2024-09-22T17:30:00+09:00' }
  });
  if (res.status !== 200) {
    console.error('Failed to fetch ranking', res.status, res.statusText);
    return null;
  }
  const body = await res.json();

  const result: RankingItemType[] = body
    .filter((item) => !item.disqualified)
    .map((item, i) => ({ ...item, rank: i + 1 }))
    .concat(body.filter((item) => item.disqualified).map((item) => ({ ...item, rank: 0 })));

  return result;
};
