import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok, err, notFound, forbidden } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { VALID_STATUSES, VALID_PRIORITIES } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

// GET /api/tasks/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return notFound("Task not found");
  if (task.userId !== auth.userId) return forbidden();

  return ok({
    ...task,
    startTime: task.startTime.toISOString(),
    endTime: task.endTime.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  });
}

// PUT /api/tasks/[id] — update task fields (partial update)
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return notFound("Task not found");
  if (task.userId !== auth.userId) return forbidden();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }

  const { title, description, status, priority, category, course, startTime, endTime } =
    body as Record<string, unknown>;

  if (startTime !== undefined && (typeof startTime !== "string" || !startTime.trim())) return err("startTime is required");
  if (endTime !== undefined && (typeof endTime !== "string" || !endTime.trim())) return err("endTime is required");
  if (typeof startTime === "string" && Number.isNaN(Date.parse(startTime))) return err("startTime must be a valid date");
  if (typeof endTime === "string" && Number.isNaN(Date.parse(endTime))) return err("endTime must be a valid date");

  const nextStart = typeof startTime === "string" ? new Date(startTime) : task.startTime;
  const nextEnd = typeof endTime === "string" ? new Date(endTime) : task.endTime;
  if (nextStart >= nextEnd) {
    return err("endTime must be after startTime");
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      title: typeof title === "string" && title.trim() ? title.trim() : undefined,
      description: typeof description === "string" ? description : undefined,
      status: VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
        ? (status as string)
        : undefined,
      priority: VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])
        ? (priority as string)
        : undefined,
      category: typeof category === "string" ? category : undefined,
      course: typeof course === "string" ? course : undefined,
      startTime: nextStart,
      endTime: nextEnd,
    },
  });

  return ok({
    ...updated,
    startTime: updated.startTime.toISOString(),
    endTime: updated.endTime.toISOString(),
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  });
}

// DELETE /api/tasks/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return notFound("Task not found");
  if (task.userId !== auth.userId) return forbidden();

  await prisma.task.delete({ where: { id } });
  return ok({ deleted: true });
}
