import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok, created, err } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

// GET /api/sessions — list all focus sessions for the authenticated user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const userSessions = await prisma.focusSession.findMany({
    where: { userId: auth.userId },
    orderBy: { completedAt: "desc" },
  });

  return ok(
    userSessions.map((s) => ({
      ...s,
      startedAt: s.startedAt.toISOString(),
      completedAt: s.completedAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }))
  );
}

// POST /api/sessions — log a completed focus session
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  // Ensure the authenticated user exists in Postgres so the FK on FocusSession.userId
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

  const session = await prisma.focusSession.create({
    data: {
      userId: auth.userId,
      taskId: typeof taskId === "string" ? taskId : null,
      durationMinutes,
      startedAt: new Date(startedAt),
      completedAt: new Date(completedAt),
      notes: typeof notes === "string" ? notes : "",
    },
  });

  return created({
    ...session,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
  });
}
