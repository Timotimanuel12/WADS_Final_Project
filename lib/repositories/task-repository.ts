import { prisma } from "@/lib/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export type TaskListQuery = {
  userId: string;
  skip: number;
  take: number;
  status?: string;
  priority?: string;
  category?: string;
  course?: string;
  search?: string;
  startFrom?: Date;
  endTo?: Date;
};

export async function findTasksByUserId(query: TaskListQuery, db: DbClient = prisma) {
  const where: Prisma.TaskWhereInput = {
    userId: query.userId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.course ? { course: query.course } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { description: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...((query.startFrom || query.endTo)
      ? {
          startTime: {
            ...(query.startFrom ? { gte: query.startFrom } : {}),
            ...(query.endTo ? { lte: query.endTo } : {}),
          },
        }
      : {}),
  };

  return db.task.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: query.skip,
    take: query.take,
  });
}

export async function findTaskById(id: string, db: DbClient = prisma) {
  return db.task.findUnique({ where: { id } });
}

export async function createTask(data: Prisma.TaskUncheckedCreateInput, db: DbClient = prisma) {
  return db.task.create({ data });
}

export async function updateTaskById(id: string, data: Prisma.TaskUpdateInput, db: DbClient = prisma) {
  return db.task.update({
    where: { id },
    data,
  });
}

export async function deleteTaskById(id: string, db: DbClient = prisma) {
  return db.task.delete({ where: { id } });
}
