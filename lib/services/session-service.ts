import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  findSessionsByUserId,
  type SessionListQuery,
} from "@/lib/repositories/session-repository";
import { findTaskById } from "@/lib/repositories/task-repository";
import { upsertUserByAuth } from "@/lib/repositories/user-repository";
import type { AuthContext } from "@/lib/services/task-service";

export function serializeSession(session: {
  startedAt: Date;
  completedAt: Date;
  createdAt: Date;
}) {
  return {
    ...session,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
  };
}

export type SessionFilterQuery = {
  page: number;
  pageSize: number;
  taskId?: string;
  startedFrom?: string;
  completedTo?: string;
};

export function buildSessionFilterQuery(searchParams: URLSearchParams): SessionFilterQuery {
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const requestedPageSize = Math.max(1, Number(searchParams.get("pageSize") ?? "100"));
  const pageSize = Math.min(200, requestedPageSize);

  return {
    page,
    pageSize,
    taskId: searchParams.get("taskId") ?? undefined,
    startedFrom: searchParams.get("startedFrom") ?? undefined,
    completedTo: searchParams.get("completedTo") ?? undefined,
  };
}

export async function listSessionsForUser(userId: string, filters: SessionFilterQuery) {
  const query: SessionListQuery = {
    userId,
    skip: (filters.page - 1) * filters.pageSize,
    take: filters.pageSize,
    taskId: filters.taskId,
    ...(filters.startedFrom && !Number.isNaN(Date.parse(filters.startedFrom))
      ? { startedFrom: new Date(filters.startedFrom) }
      : {}),
    ...(filters.completedTo && !Number.isNaN(Date.parse(filters.completedTo))
      ? { completedTo: new Date(filters.completedTo) }
      : {}),
  };

  return findSessionsByUserId(query);
}

export async function validateOwnedTaskReference(userId: string, taskId: string | null) {
  if (!taskId) return true;
  const task = await findTaskById(taskId);
  return Boolean(task && task.userId === userId);
}

export async function createSessionForUser(
  auth: AuthContext,
  data: Prisma.FocusSessionUncheckedCreateInput
) {
  return prisma.$transaction(async (tx) => {
    await upsertUserByAuth(auth.userId, auth.email, tx);
    return createSession(data, tx);
  });
}
