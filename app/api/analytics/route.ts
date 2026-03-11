import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok } from "@/lib/api-response";
import { tasks, focusSessions } from "@/lib/store";

// GET /api/analytics — aggregated stats for the authenticated user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const userTasks = Array.from(tasks.values()).filter(
    (t) => t.userId === auth.userId
  );
  const userSessions = Array.from(focusSessions.values()).filter(
    (s) => s.userId === auth.userId
  );

  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.status === "completed").length;
  const pendingTasks = userTasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = userTasks.filter((t) => t.status === "in-progress").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalMinutes = userSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Sessions in the last 7 days
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weeklySessions = userSessions.filter((s) => s.completedAt >= oneWeekAgo);
  const weeklyMinutes = weeklySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const byPriority = {
    low: userTasks.filter((t) => t.priority === "low").length,
    medium: userTasks.filter((t) => t.priority === "medium").length,
    high: userTasks.filter((t) => t.priority === "high").length,
    urgent: userTasks.filter((t) => t.priority === "urgent").length,
  };

  return ok({
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks,
      completionRate,
    },
    focusTime: {
      totalMinutes,
      totalHours,
      weeklyMinutes,
      sessionCount: userSessions.length,
    },
    byPriority,
  });
}
