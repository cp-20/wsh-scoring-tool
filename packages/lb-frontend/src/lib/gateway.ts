import type { AppType } from '@wsh-scoring-tool/lb-server';
import { hc } from 'hono/client';

const client = hc<AppType>('/api');

export type RankingItemType = {
  rank: number;
  name: string;
  score: number;
  url: string;
  disqualified: boolean;
};

export const getRanking = async () => {
  const res = await client.ranking.$get();
  if (res.status !== 200) {
    console.error('Failed to fetch ranking', res.status, res.statusText);
    return null;
  }
  const body = await res.json();

  const result: RankingItemType[] = body.map((item, i) => ({
    rank: i + 1,
    name: item.name,
    score: item.score,
    url: item.url,
    disqualified: item.disqualified
  }));

  return result;
};
