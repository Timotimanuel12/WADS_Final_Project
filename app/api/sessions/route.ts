import { type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok, created, err } from "@/lib/api-response";
import { focusSessions, type FocusSession } from "@/lib/store";

// GET /api/sessions — list all focus sessions for the authenticated user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const userSessions = Array.from(focusSessions.values()).filter(
    (s) => s.userId === auth.userId
  );
  return ok(userSessions);
}

// POST /api/sessions — log a completed focus session
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }

  const { taskId, durationMinutes, startedAt, completedAt, notes } =
    body as Record<string, unknown>;

  if (typeof durationMinutes !== "number" || durationMinutes <= 0)
    return err("durationMinutes must be a positive number");
  if (typeof startedAt !== "string" || !startedAt)
    return err("startedAt is required");
  if (typeof completedAt !== "string" || !completedAt)
    return err("completedAt is required");

  const session: FocusSession = {
    id: randomUUID(),
    userId: auth.userId,
    taskId: typeof taskId === "string" ? taskId : null,
    durationMinutes,
    startedAt,
    completedAt,
    notes: typeof notes === "string" ? notes : "",
  };

  focusSessions.set(session.id, session);
  return created(session);
}
