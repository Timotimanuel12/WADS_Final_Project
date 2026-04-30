import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { err, ok } from "@/lib/api-response";
import { taskRepository } from "@/lib/repositories/task-repository";
import { sessionRepository } from "@/lib/repositories/session-repository";
import geminiAIService from "@/lib/services/groq-ai-service";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const allTasks = await taskRepository.findAllByUserId(auth.userId);
    const todaySessions = await sessionRepository.findByUserIdAndDate(auth.userId, new Date());
    const completedTasks = allTasks.filter((task) => isTaskCompleted(task.status));
    const pendingTasks = allTasks.filter((task) => !isTaskCompleted(task.status));
    const totalHoursWorked = Math.round(todaySessions.reduce((sum, session) => sum + session.durationMinutes, 0) / 60);
    const data = await geminiAIService.detectBurnoutRisk(
      totalHoursWorked,
      completedTasks.length,
      pendingTasks.length,
      todaySessions.length
    );
    return ok({ analysis: data, stats: { totalHours: totalHoursWorked, completedTasks: completedTasks.length, pendingTasks: pendingTasks.length, sessionsDone: todaySessions.length } });
  } catch {
    return err("Failed to analyze burnout risk", 500);
  }
}

function isTaskCompleted(status: string) {
  return status.trim().toLowerCase() === "completed";
}
