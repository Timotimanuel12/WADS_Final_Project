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

  const monthlyTrends = buildMonthlyTrends(userTasks, userSessions);
  const streak = buildFocusStreak(userSessions);

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
    trends: monthlyTrends,
    streak,
  };
}

function buildMonthlyTrends(userTasks: Array<{ status: string; updatedAt: Date }>, userSessions: Array<{ completedAt: Date; durationMinutes: number }>) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = startOfMonth(addMonths(new Date(), -(5 - index)));
    return {
      month: date.toISOString().slice(0, 7),
      label: date.toLocaleDateString([], { month: "short" }),
      focusMinutes: 0,
      completedTasks: 0,
      sessions: 0,
    };
  });

  const monthByKey = new Map(months.map((month) => [month.month, month]));

  for (const session of userSessions) {
    const key = session.completedAt.toISOString().slice(0, 7);
    const bucket = monthByKey.get(key);
    if (bucket) {
      bucket.focusMinutes += session.durationMinutes;
      bucket.sessions += 1;
    }
  }

  for (const task of userTasks) {
    if (task.status !== "completed") continue;
    const key = task.updatedAt.toISOString().slice(0, 7);
    const bucket = monthByKey.get(key);
    if (bucket) {
      bucket.completedTasks += 1;
    }
  }

  return months;
}

function buildFocusStreak(userSessions: Array<{ completedAt: Date }>) {
  const daySet = new Set(userSessions.map((session) => startOfDay(session.completedAt).toISOString().slice(0, 10)));
  const today = startOfDay(new Date());

  let current = 0;
  for (let cursor = new Date(today); daySet.has(cursor.toISOString().slice(0, 10)); cursor.setDate(cursor.getDate() - 1)) {
    current += 1;
  }

  let longest = 0;
  let streak = 0;
  const sortedDays = [...daySet].sort();
  for (let index = 0; index < sortedDays.length; index += 1) {
    const previous = sortedDays[index - 1];
    const currentDay = sortedDays[index];
    if (!previous || isNextDay(previous, currentDay)) {
      streak += 1;
    } else {
      streak = 1;
    }
    longest = Math.max(longest, streak);
  }

  return {
    current,
    longest,
    active: current > 0,
  };
}

function startOfMonth(date: Date) {
  const copy = new Date(date);
  copy.setDate(1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addMonths(date: Date, offset: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + offset);
  return copy;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isNextDay(previousDay: string, nextDay: string) {
  const previous = new Date(previousDay);
  const next = new Date(nextDay);
  previous.setDate(previous.getDate() + 1);
  return previous.toISOString().slice(0, 10) === next.toISOString().slice(0, 10);
}
