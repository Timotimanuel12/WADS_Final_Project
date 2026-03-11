import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok, err, notFound, forbidden } from "@/lib/api-response";
import { tasks, type Task, VALID_STATUSES, VALID_PRIORITIES } from "@/lib/store";

type Params = { params: Promise<{ id: string }> };

// GET /api/tasks/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const task = tasks.get(id);
  if (!task) return notFound("Task not found");
  if (task.userId !== auth.userId) return forbidden();
  return ok(task);
}

// PUT /api/tasks/[id] — update task fields (partial update)
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const task = tasks.get(id);
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

  const nextStart = typeof startTime === "string" ? startTime : task.startTime;
  const nextEnd = typeof endTime === "string" ? endTime : task.endTime;
  if (new Date(nextStart) >= new Date(nextEnd)) {
    return err("endTime must be after startTime");
  }

  const updated: Task = {
    ...task,
    title:
      typeof title === "string" && title.trim() ? title.trim() : task.title,
    description:
      typeof description === "string" ? description : task.description,
    status: VALID_STATUSES.includes(status as Task["status"])
      ? (status as Task["status"])
      : task.status,
    priority: VALID_PRIORITIES.includes(priority as Task["priority"])
      ? (priority as Task["priority"])
      : task.priority,
    category: typeof category === "string" ? category : task.category,
    course: typeof course === "string" ? course : task.course,
    startTime: nextStart,
    endTime: nextEnd,
    updatedAt: new Date().toISOString(),
  };

  tasks.set(id, updated);
  return ok(updated);
}

// DELETE /api/tasks/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const task = tasks.get(id);
  if (!task) return notFound("Task not found");
  if (task.userId !== auth.userId) return forbidden();

  tasks.delete(id);
  return ok({ deleted: true });
}
