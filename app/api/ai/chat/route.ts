import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { err, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import geminiAIService from "@/lib/services/groq-ai-service";
import { enforceRateLimit } from "@/lib/rate-limit";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CHAT_WINDOW_MS = 60_000;
const MAX_MESSAGES_PER_WINDOW = 8;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONVERSATION_MESSAGES = 20;

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const limited = enforceRateLimit(request, "ai-chat", { windowMs: CHAT_WINDOW_MS, max: MAX_MESSAGES_PER_WINDOW }, auth.userId);
  if (limited.limited) {
    return err("Too many AI chat messages. Please wait a minute and try again.", 429);
  }

  try {
    const body = await request.json().catch(() => ({}));
    const message = body.message;
    const conversationId = body.conversationId;
    const preferences = body.preferences ?? {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return err("Message is required", 400);
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return err("Message too long (max 2000 chars)", 400);
    }

    let conversation = null;
    if (conversationId) {
      conversation = await prisma.aIChatConversation.findFirst({
        where: { id: conversationId, userId: auth.userId },
        include: { messages: { orderBy: { createdAt: "asc" }, take: MAX_CONVERSATION_MESSAGES } },
      });
      if (!conversation) return err("Conversation not found", 404);
    } else {
      conversation = await prisma.aIChatConversation.create({
        data: { userId: auth.userId, title: buildConversationTitle(message) },
        include: { messages: true },
      });
    }

    await prisma.aIChatMessage.create({
      data: { conversationId: conversation.id, role: "user", content: message },
    });

    const history: ChatMessage[] = conversation.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
    history.push({ role: "user", content: message });

    const aiResponse = await geminiAIService.chat(history, preferences);

    const assistantMsg = await prisma.aIChatMessage.create({
      data: { conversationId: conversation.id, role: "assistant", content: aiResponse },
    });

    return ok({
      conversationId: conversation.id,
      assistantMessage: assistantMsg,
    });
  } catch {
    return err("Failed to process chat message", 500);
  }
}

function buildConversationTitle(message: string) {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (!cleaned) return "New Conversation";

  const sentenceMatch = cleaned.match(/^.+?[.!?](?=\s|$)/);
  const sentence = sentenceMatch?.[0] ?? cleaned;
  const compact = collapseRepeatedWords(sentence).trim();
  const candidate = compact || cleaned;

  if (candidate.length <= 40) {
    return candidate;
  }

  return `${candidate.slice(0, 37).trimEnd()}...`;
}

function collapseRepeatedWords(value: string) {
  let result = value;
  let previous = "";

  while (result !== previous) {
    previous = result;
    result = result.replace(/\b([\w'-]+)(\s+\1\b)+/gi, "$1");
  }

  return result;
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const conversationId = body.conversationId;
    const title = body.title;

    if (!conversationId || typeof conversationId !== "string") {
      return err("Conversation ID is required", 400);
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return err("Conversation title is required", 400);
    }

    const updated = await prisma.aIChatConversation.updateMany({
      where: { id: conversationId, userId: auth.userId },
      data: { title: title.trim().slice(0, 80) },
    });

    if (updated.count === 0) {
      return err("Conversation not found", 404);
    }

    return ok({ updated: true });
  } catch {
    return err("Failed to rename conversation", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const conversationId = body.conversationId;

    if (!conversationId || typeof conversationId !== "string") {
      return err("Conversation ID is required", 400);
    }

    const deleted = await prisma.aIChatConversation.deleteMany({
      where: { id: conversationId, userId: auth.userId },
    });

    if (deleted.count === 0) {
      return err("Conversation not found", 404);
    }

    return ok({ deleted: true });
  } catch {
    return err("Failed to delete conversation", 500);
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const conversationId = request.nextUrl.searchParams.get("conversationId");

    if (conversationId) {
      const conversation = await prisma.aIChatConversation.findFirst({
        where: { id: conversationId, userId: auth.userId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      if (!conversation) return err("Conversation not found", 404);
      return ok(conversation);
    }

    const conversations = await prisma.aIChatConversation.findMany({
      where: { userId: auth.userId },
      orderBy: { updatedAt: "desc" },
      include: { messages: { take: 1, orderBy: { createdAt: "desc" } } },
    });

    return ok(conversations);
  } catch {
    return err("Failed to fetch conversations", 500);
  }
}
