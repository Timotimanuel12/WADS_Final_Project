import { type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok, created, err } from "@/lib/api-response";
import { tasks, type Task, VALID_STATUSES, VALID_PRIORITIES } from "@/lib/store";

// GET /api/tasks — list all tasks for the authenticated user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const userTasks = Array.from(tasks.values()).filter(
    (t) => t.userId === auth.userId
  );
  return ok(userTasks);
}

// POST /api/tasks — create a new task
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

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

  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    userId: auth.userId,
    title: title.trim(),
    description: typeof description === "string" ? description : "",
    status: VALID_STATUSES.includes(status as Task["status"])
      ? (status as Task["status"])
      : "pending",
    priority: VALID_PRIORITIES.includes(priority as Task["priority"])
      ? (priority as Task["priority"])
      : "medium",
    category: typeof category === "string" ? category : "",
    course: typeof course === "string" ? course : "",
    startTime,
    endTime,
    createdAt: now,
    updatedAt: now,
  };

  tasks.set(task.id, task);
  return created(task);
}
