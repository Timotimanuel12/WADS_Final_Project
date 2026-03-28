import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok, created, err } from "@/lib/api-response";
import {
  buildSessionFilterQuery,
  createSessionForUser,
  listSessionsForUser,
  serializeSession,
  validateOwnedTaskReference,
} from "@/lib/services/session-service";

// GET /api/sessions — list all focus sessions for the authenticated user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const filters = buildSessionFilterQuery(request.nextUrl.searchParams);
    const userSessions = await listSessionsForUser(auth.userId, filters);
    return ok(userSessions.map((s) => serializeSession(s)));
  } catch {
    return err("Failed to fetch focus sessions", 500);
  }
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
  if (Number.isNaN(Date.parse(startedAt))) return err("startedAt must be a valid date");
  if (Number.isNaN(Date.parse(completedAt))) return err("completedAt must be a valid date");
  if (new Date(startedAt) > new Date(completedAt)) return err("completedAt must be after startedAt");

  try {
    const normalizedTaskId = typeof taskId === "string" && taskId.trim() ? taskId : null;
    const isOwnedTaskRef = await validateOwnedTaskReference(auth.userId, normalizedTaskId);
    if (!isOwnedTaskRef) {
      return err("taskId must reference one of your tasks", 400);
    }

    const session = await createSessionForUser(auth, {
      userId: auth.userId,
      taskId: normalizedTaskId,
      durationMinutes,
      startedAt: new Date(startedAt),
      completedAt: new Date(completedAt),
      notes: typeof notes === "string" ? notes : "",
    });

    return created(serializeSession(session));
  } catch {
    return err("Failed to create focus session", 500);
  }
}
