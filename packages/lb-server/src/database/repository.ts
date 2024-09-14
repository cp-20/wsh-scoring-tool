import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type GetRankingResult = {
  name: string;
  score: number;
}[];

export const getRanking = async (): Promise<GetRankingResult> => {
  const result = await prisma.submission.groupBy({
    by: ["userId"],
    _max: {
      score: true,
    },
    orderBy: {
      _max: {
        score: "desc",
      },
    },
  });

  return result.map((r) => ({
    name: r.userId,
    score: r._max.score ?? 0,
  }));
};

export type GetTimelineResult = {
  name: string;
  score: number;
  createdAt: Date;
}[];

export const getTimeline = async (
  userIds: string[],
): Promise<GetTimelineResult> => {
  const result = await prisma.submission.findMany({
    select: {
      userId: true,
      score: true,
      createdAt: true,
    },
    where: {
      userId: {
        in: userIds,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return result.map((r) => ({
    name: r.userId,
    score: r.score,
    createdAt: r.createdAt,
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
      score: submission.score,
    },
  });
};
