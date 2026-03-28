import { prisma } from "@/lib/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export type SessionListQuery = {
  userId: string;
  skip: number;
  take: number;
  taskId?: string;
  startedFrom?: Date;
  completedTo?: Date;
};

export async function findSessionsByUserId(query: SessionListQuery, db: DbClient = prisma) {
  const where: Prisma.FocusSessionWhereInput = {
    userId: query.userId,
    ...(query.taskId ? { taskId: query.taskId } : {}),
    ...((query.startedFrom || query.completedTo)
      ? {
          startedAt: {
            ...(query.startedFrom ? { gte: query.startedFrom } : {}),
          },
          completedAt: {
            ...(query.completedTo ? { lte: query.completedTo } : {}),
          },
        }
      : {}),
  };

  return db.focusSession.findMany({
    where,
    orderBy: { completedAt: "desc" },
    skip: query.skip,
    take: query.take,
  });
}

export async function createSession(data: Prisma.FocusSessionUncheckedCreateInput, db: DbClient = prisma) {
  return db.focusSession.create({ data });
}
