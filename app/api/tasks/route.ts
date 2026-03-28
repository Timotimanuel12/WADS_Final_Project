import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok, created, err } from "@/lib/api-response";
import { VALID_STATUSES, VALID_PRIORITIES } from "@/lib/store";
import {
  buildTaskFilterQuery,
  createTaskForUser,
  listTasksForUser,
  serializeTask,
} from "@/lib/services/task-service";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function getAttachmentByteSizeFromDataUrl(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex < 0) return Number.POSITIVE_INFINITY;

  const base64 = dataUrl.slice(commaIndex + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

// GET /api/tasks — list all tasks for the authenticated user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const filters = buildTaskFilterQuery(request.nextUrl.searchParams);
    const userTasks = await listTasksForUser(auth.userId, filters);

    return ok(userTasks.map((t) => serializeTask(t)));
  } catch {
    return err("Failed to fetch tasks", 500);
  }
}

// POST /api/tasks — create a new task
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body");
  }

  const { title, description, status, priority, category, course, startTime, endTime, taskLink, attachmentName, attachmentMimeType, attachmentDataUrl } =
    body as Record<string, unknown>;

  if (typeof title !== "string" || !title.trim()) return err("title is required");
  if (typeof startTime !== "string" || !startTime.trim()) return err("startTime is required");
  if (typeof endTime !== "string" || !endTime.trim()) return err("endTime is required");
  if (Number.isNaN(Date.parse(startTime))) return err("startTime must be a valid date");
  if (Number.isNaN(Date.parse(endTime))) return err("endTime must be a valid date");
  if (new Date(startTime) >= new Date(endTime)) return err("endTime must be after startTime");

  const normalizedTaskLink = typeof taskLink === "string" ? taskLink.trim() : "";
  if (normalizedTaskLink && !/^https?:\/\//i.test(normalizedTaskLink)) {
    return err("taskLink must start with http:// or https://");
  }

  const normalizedAttachmentName = typeof attachmentName === "string" ? attachmentName.trim() : "";
  const normalizedAttachmentMimeType = typeof attachmentMimeType === "string" ? attachmentMimeType.trim() : "";
  const normalizedAttachmentDataUrl = typeof attachmentDataUrl === "string" ? attachmentDataUrl.trim() : "";

  const hasAnyAttachmentField = Boolean(
    normalizedAttachmentName || normalizedAttachmentMimeType || normalizedAttachmentDataUrl
  );

  if (hasAnyAttachmentField) {
    if (!normalizedAttachmentName || !normalizedAttachmentMimeType || !normalizedAttachmentDataUrl) {
      return err("attachmentName, attachmentMimeType, and attachmentDataUrl must be provided together");
    }

    if (!normalizedAttachmentDataUrl.startsWith("data:")) {
      return err("attachmentDataUrl must be a valid data URL");
    }

    const attachmentBytes = getAttachmentByteSizeFromDataUrl(normalizedAttachmentDataUrl);
    if (!Number.isFinite(attachmentBytes) || attachmentBytes > MAX_ATTACHMENT_BYTES) {
      return err("Attachment size must be 10MB or less");
    }
  }

  try {
    const task = await createTaskForUser(auth, {
      userId: auth.userId,
      title: title.trim(),
      description: typeof description === "string" ? description : "",
      status: VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
        ? (status as string)
        : "pending",
      priority: VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])
        ? (priority as string)
        : "medium",
      category: typeof category === "string" ? category : "",
      course: typeof course === "string" ? course : "",
      taskLink: normalizedTaskLink || null,
      attachmentName: normalizedAttachmentName || null,
      attachmentMimeType: normalizedAttachmentMimeType || null,
      attachmentDataUrl: normalizedAttachmentDataUrl || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    return created(serializeTask(task));
  } catch {
    return err("Failed to create task", 500);
  }
}
