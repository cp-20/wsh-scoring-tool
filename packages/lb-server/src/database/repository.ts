import { PrismaClient } from '@prisma/client';
import { getRanking as getRankingQuery } from '@prisma/client/sql';

const prisma = new PrismaClient();

export type GetRankingQuery = Partial<{
  after: Date;
  before: Date;
}>;

export type GetRankingResult = {
  name: string;
  url: string;
  score: number;
  disqualified: boolean;
}[];

export const getRanking = async (query: GetRankingQuery): Promise<GetRankingResult> => {
  const result = await prisma.$queryRawTyped(
    getRankingQuery(query.after ?? new Date(0), query.before ?? new Date())
  );
  return result.map((r) => ({
    name: r.userId,
    url: r.url,
    disqualified: r.disqualified !== 0,
    score: r.score ?? 0
  }));
};

export type GetTimelineResult = {
  name: string;
  score: number;
  createdAt: Date;
}[];

export const getTimeline = async (userIds: string[]): Promise<GetTimelineResult> => {
  const result = await prisma.submission.findMany({
    select: {
      userId: true,
      score: true,
      createdAt: true
    },
    where: {
      userId: {
        in: userIds
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return result.map((r) => ({
    name: r.userId,
    score: r.score,
    createdAt: r.createdAt
  }));
};

export type Submission = {
  name: string;
  score: number;
};

export const createSubmission = async (submission: Submission) => {
  await prisma.submission.create({
    data: {
      userId: submission.name,
      score: submission.score
    }
  });
};

export type CreateUserPayload = {
  name: string;
  url: string;
};

export const createUser = async (payload: CreateUserPayload) => {
  await prisma.user.create({
    data: {
      id: payload.name,
      url: payload.url
    }
  });
};

export type GetUserResult =
  | {
      id: string;
      url: string;
      createdAt: Date;
    }
  | undefined;

export const getUser = async (userId: string): Promise<GetUserResult> => {
  const result = await prisma.user.findFirst({
    select: {
      url: true,
      createdAt: true
    },
    where: {
      id: userId
    }
  });

  if (result === null) return undefined;

  return {
    id: userId,
    url: result.url,
    createdAt: result.createdAt
  };
};
