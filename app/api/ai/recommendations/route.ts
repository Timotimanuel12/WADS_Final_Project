import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { err, ok } from "@/lib/api-response";
import { taskRepository } from "@/lib/repositories/task-repository";
import geminiAIService from "@/lib/services/groq-ai-service";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const allTasks = await taskRepository.findAllByUserId(auth.userId);
    const incompleteTasks = allTasks.filter((task) => !isTaskCompleted(task.status));
    const completedTasks = allTasks.filter((task) => isTaskCompleted(task.status));
    const data = await geminiAIService.getSmartRecommendations(incompleteTasks, completedTasks.slice(0, 5));
    return ok({ recommendations: data, incompleteTasks: incompleteTasks.length, completedTasks: completedTasks.length });
  } catch {
    return err("Failed to get recommendations", 500);
  }
}

function isTaskCompleted(status: string) {
  return status.trim().toLowerCase() === "completed";
}
