import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { err, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import geminiAIService from "@/lib/services/groq-ai-service";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CHAT_WINDOW_MS = 60_000;
const MAX_MESSAGES_PER_WINDOW = 8;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_CONVERSATION_MESSAGES = 20;

const chatRequestLog = new Map<string, number[]>();

function isRateLimited(userId: string) {
  const now = Date.now();
  const timestamps = (chatRequestLog.get(userId) ?? []).filter((timestamp) => now - timestamp < CHAT_WINDOW_MS);

  if (timestamps.length >= MAX_MESSAGES_PER_WINDOW) {
    chatRequestLog.set(userId, timestamps);
    return true;
  }

  timestamps.push(now);
  chatRequestLog.set(userId, timestamps);
  return false;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

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

    if (isRateLimited(auth.userId)) {
      return err("Too many AI chat messages. Please wait a minute and try again.", 429);
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
        data: { userId: auth.userId, title: message.slice(0, 50) || "New Conversation" },
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
