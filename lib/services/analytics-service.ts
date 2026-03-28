import { findAnalyticsDataByUserId } from "@/lib/repositories/analytics-repository";

export async function getAnalyticsForUser(userId: string) {
  const [userTasks, userSessions] = await findAnalyticsDataByUserId(userId);

  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.status === "completed").length;
  const pendingTasks = userTasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = userTasks.filter((t) => t.status === "in-progress").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalMinutes = userSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklySessions = userSessions.filter((s) => s.completedAt >= oneWeekAgo);
  const weeklyMinutes = weeklySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const byPriority = {
    low: userTasks.filter((t) => t.priority === "low").length,
    medium: userTasks.filter((t) => t.priority === "medium").length,
    high: userTasks.filter((t) => t.priority === "high").length,
    urgent: userTasks.filter((t) => t.priority === "urgent").length,
  };

  return {
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
  };
}
