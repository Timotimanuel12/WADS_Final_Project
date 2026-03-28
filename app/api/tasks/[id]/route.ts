import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { ok, err, notFound, forbidden } from "@/lib/api-response";
import { VALID_STATUSES, VALID_PRIORITIES } from "@/lib/store";
import {
  deleteOwnedTask,
  findOwnedTask,
  serializeTask,
  updateOwnedTask,
} from "@/lib/services/task-service";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function getAttachmentByteSizeFromDataUrl(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex < 0) return Number.POSITIVE_INFINITY;

  const base64 = dataUrl.slice(commaIndex + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

type Params = { params: Promise<{ id: string }> };

// GET /api/tasks/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const { task, isOwner } = await findOwnedTask(auth.userId, id);
    if (!task) return notFound("Task not found");
    if (!isOwner) return forbidden();

    return ok(serializeTask(task));
  } catch {
    return err("Failed to fetch task", 500);
  }
}

// PUT /api/tasks/[id] — update task fields (partial update)
export async function PUT(request: NextRequest, { params }: Params) {
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

  if (startTime !== undefined && (typeof startTime !== "string" || !startTime.trim())) return err("startTime is required");
  if (endTime !== undefined && (typeof endTime !== "string" || !endTime.trim())) return err("endTime is required");
  if (typeof startTime === "string" && Number.isNaN(Date.parse(startTime))) return err("startTime must be a valid date");
  if (typeof endTime === "string" && Number.isNaN(Date.parse(endTime))) return err("endTime must be a valid date");

  const normalizedTaskLink = typeof taskLink === "string" ? taskLink.trim() : undefined;
  if (normalizedTaskLink !== undefined && normalizedTaskLink && !/^https?:\/\//i.test(normalizedTaskLink)) {
    return err("taskLink must start with http:// or https://");
  }

  const normalizedAttachmentName = typeof attachmentName === "string" ? attachmentName.trim() : undefined;
  const normalizedAttachmentMimeType = typeof attachmentMimeType === "string" ? attachmentMimeType.trim() : undefined;
  const normalizedAttachmentDataUrl = typeof attachmentDataUrl === "string" ? attachmentDataUrl.trim() : undefined;

  const anyAttachmentProvided =
    normalizedAttachmentName !== undefined ||
    normalizedAttachmentMimeType !== undefined ||
    normalizedAttachmentDataUrl !== undefined;

  if (anyAttachmentProvided) {
    const nextAttachmentName = normalizedAttachmentName ?? "";
    const nextAttachmentMimeType = normalizedAttachmentMimeType ?? "";
    const nextAttachmentDataUrl = normalizedAttachmentDataUrl ?? "";

    const allEmpty = !nextAttachmentName && !nextAttachmentMimeType && !nextAttachmentDataUrl;
    if (!allEmpty) {
      if (!nextAttachmentName || !nextAttachmentMimeType || !nextAttachmentDataUrl) {
        return err("attachmentName, attachmentMimeType, and attachmentDataUrl must be provided together");
      }
      if (!nextAttachmentDataUrl.startsWith("data:")) {
        return err("attachmentDataUrl must be a valid data URL");
      }

      const attachmentBytes = getAttachmentByteSizeFromDataUrl(nextAttachmentDataUrl);
      if (!Number.isFinite(attachmentBytes) || attachmentBytes > MAX_ATTACHMENT_BYTES) {
        return err("Attachment size must be 10MB or less");
      }
    }
  }

  try {
    const { id } = await params;
    const { task, isOwner } = await findOwnedTask(auth.userId, id);
    if (!task) return notFound("Task not found");
    if (!isOwner) return forbidden();

    const nextStart = typeof startTime === "string" ? new Date(startTime) : task.startTime;
    const nextEnd = typeof endTime === "string" ? new Date(endTime) : task.endTime;
    if (nextStart >= nextEnd) {
      return err("endTime must be after startTime");
    }

    const updated = await updateOwnedTask(id, {
      title: typeof title === "string" && title.trim() ? title.trim() : undefined,
      description: typeof description === "string" ? description : undefined,
      status: VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
        ? (status as string)
        : undefined,
      priority: VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])
        ? (priority as string)
        : undefined,
      category: typeof category === "string" ? category : undefined,
      course: typeof course === "string" ? course : undefined,
      taskLink: normalizedTaskLink === undefined ? undefined : (normalizedTaskLink || null),
      attachmentName: normalizedAttachmentName === undefined ? undefined : (normalizedAttachmentName || null),
      attachmentMimeType: normalizedAttachmentMimeType === undefined ? undefined : (normalizedAttachmentMimeType || null),
      attachmentDataUrl: normalizedAttachmentDataUrl === undefined ? undefined : (normalizedAttachmentDataUrl || null),
      startTime: nextStart,
      endTime: nextEnd,
    });

    return ok(serializeTask(updated));
  } catch {
    return err("Failed to update task", 500);
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const { task, isOwner } = await findOwnedTask(auth.userId, id);
    if (!task) return notFound("Task not found");
    if (!isOwner) return forbidden();

    await deleteOwnedTask(id);
    return ok({ deleted: true });
  } catch {
    return err("Failed to delete task", 500);
  }
}
