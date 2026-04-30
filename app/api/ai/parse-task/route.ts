import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { err, ok } from "@/lib/api-response";
import geminiAIService from "@/lib/services/groq-ai-service";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const text = body.text;

    if (!text || typeof text !== "string" || !text.trim()) {
      return err("Task text is required", 400);
    }

    if (text.length > 500) {
      return err("Task description too long (max 500 chars)", 400);
    }

    const data = await geminiAIService.parseNaturalLanguageTask(text);
    return ok({
      task: {
        title: data.title || "New Task",
        description: data.description || "",
        priority: data.priority || "medium",
        category: data.category || undefined,
        course: data.course || undefined,
      },
    });
  } catch {
    return err("Failed to parse task", 500);
  }
}
