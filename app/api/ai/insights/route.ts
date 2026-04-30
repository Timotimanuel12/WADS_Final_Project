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
    const data = await geminiAIService.analyzeTaskPatterns(allTasks);
    const stats = {
      totalTasks: allTasks.length,
      completed: allTasks.filter((task) => isTaskCompleted(task.status)).length,
      pending: allTasks.filter((task) => !isTaskCompleted(task.status)).length,
      highPriority: allTasks.filter((task) => task.priority === "high").length,
      mediumPriority: allTasks.filter((task) => task.priority === "medium").length,
      lowPriority: allTasks.filter((task) => task.priority === "low").length,
    };
    return ok({ insights: data, stats });
  } catch {
    return err("Failed to generate insights", 500);
  }
}

function isTaskCompleted(status: string) {
  return status.trim().toLowerCase() === "completed";
}
