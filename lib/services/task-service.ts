import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  createTask,
  deleteTaskById,
  findTaskById,
  findTasksByUserId,
  type TaskListQuery,
  updateTaskById,
} from "@/lib/repositories/task-repository";
import { upsertUserByAuth } from "@/lib/repositories/user-repository";

export type AuthContext = {
  userId: string;
  email?: string;
};

export function serializeTask(task: {
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...task,
    startTime: task.startTime.toISOString(),
    endTime: task.endTime.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export type PaginationQuery = {
  page: number;
  pageSize: number;
};

export type TaskFilterQuery = PaginationQuery & {
  status?: string;
  priority?: string;
  category?: string;
  course?: string;
  search?: string;
  startFrom?: string;
  endTo?: string;
};

export function parsePagination(searchParams: URLSearchParams): PaginationQuery {
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const requestedPageSize = Math.max(1, Number(searchParams.get("pageSize") ?? "100"));
  const pageSize = Math.min(200, requestedPageSize);
  return { page, pageSize };
}

export function buildTaskFilterQuery(searchParams: URLSearchParams): TaskFilterQuery {
  const { page, pageSize } = parsePagination(searchParams);
  const status = searchParams.get("status") ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const course = searchParams.get("course") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const startFrom = searchParams.get("startFrom") ?? undefined;
  const endTo = searchParams.get("endTo") ?? undefined;

  return { page, pageSize, status, priority, category, course, search, startFrom, endTo };
}

export async function listTasksForUser(userId: string, filters: TaskFilterQuery) {
  const query: TaskListQuery = {
    userId,
    skip: (filters.page - 1) * filters.pageSize,
    take: filters.pageSize,
    status: filters.status,
    priority: filters.priority,
    category: filters.category,
    course: filters.course,
    search: filters.search,
    ...(filters.startFrom && !Number.isNaN(Date.parse(filters.startFrom))
      ? { startFrom: new Date(filters.startFrom) }
      : {}),
    ...(filters.endTo && !Number.isNaN(Date.parse(filters.endTo))
      ? { endTo: new Date(filters.endTo) }
      : {}),
  };

  return findTasksByUserId(query);
}

export async function createTaskForUser(auth: AuthContext, data: Prisma.TaskUncheckedCreateInput) {
  return prisma.$transaction(async (tx) => {
    await upsertUserByAuth(auth.userId, auth.email, tx);
    return createTask(data, tx);
  });
}

export async function findOwnedTask(userId: string, taskId: string) {
  const task = await findTaskById(taskId);
  if (!task) return { task: null, isOwner: false };
  return { task, isOwner: task.userId === userId };
}

export async function updateOwnedTask(taskId: string, data: Prisma.TaskUpdateInput) {
  return updateTaskById(taskId, data);
}

export async function deleteOwnedTask(taskId: string) {
  return deleteTaskById(taskId);
}
