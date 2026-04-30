import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { err, ok } from "@/lib/api-response";
import { taskRepository } from "@/lib/repositories/task-repository";
import geminiAIService from "@/lib/services/groq-ai-service";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const preferences = body.preferences;
    const tasks = await taskRepository.findAllByUserId(auth.userId);
    const data = await geminiAIService.prioritizeAndScheduleTasks(tasks, preferences);
    return ok({ recommendations: data, taskCount: tasks.length });
  } catch {
    return err("Failed to prioritize tasks", 500);
  }
}
