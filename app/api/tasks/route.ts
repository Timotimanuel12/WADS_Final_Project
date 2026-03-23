import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok, created, err } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { VALID_STATUSES, VALID_PRIORITIES } from "@/lib/store";

// GET /api/tasks — list all tasks for the authenticated user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const userTasks = await prisma.task.findMany({
    where: { userId: auth.userId },
    orderBy: { updatedAt: "desc" },
  });

  return ok(
    userTasks.map((t) => ({
      ...t,
      startTime: t.startTime.toISOString(),
      endTime: t.endTime.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))
  );
}

// POST /api/tasks — create a new task
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  // Ensure the authenticated user exists in Postgres so the FK on Task.userId
  // is always satisfied, even if /api/auth/session was never called explicitly.
  await prisma.user.upsert({
    where: { id: auth.userId },
    create: { id: auth.userId, email: auth.email ?? null },
    update: { email: auth.email ?? null },
  });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }

  const { title, description, status, priority, category, course, startTime, endTime } =
    body as Record<string, unknown>;

  if (typeof title !== "string" || !title.trim()) return err("title is required");
  if (typeof startTime !== "string" || !startTime.trim()) return err("startTime is required");
  if (typeof endTime !== "string" || !endTime.trim()) return err("endTime is required");
  if (Number.isNaN(Date.parse(startTime))) return err("startTime must be a valid date");
  if (Number.isNaN(Date.parse(endTime))) return err("endTime must be a valid date");
  if (new Date(startTime) >= new Date(endTime)) return err("endTime must be after startTime");

  const task = await prisma.task.create({
    data: {
      userId: auth.userId,
      title: title.trim(),
      description: typeof description === "string" ? description : "",
      status: VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
        ? (status as string)
        : "pending",
      priority: VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])
        ? (priority as string)
        : "medium",
      category: typeof category === "string" ? category : "",
      course: typeof course === "string" ? course : "",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    },
  });

  return created({
    ...task,
    startTime: task.startTime.toISOString(),
    endTime: task.endTime.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  });
}
