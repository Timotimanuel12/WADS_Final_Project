// Temporary in-memory store — will be replaced by Prisma in Phase 4.
// All Maps are module-level singletons that persist for the lifetime of the
// Next.js server process.

export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  course: string;
  taskLink: string | null;
  attachmentName: string | null;
  attachmentMimeType: string | null;
  attachmentDataUrl: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
};

export type FocusSession = {
  id: string;
  userId: string;
  taskId: string | null;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
  notes: string;
};

export const tasks = new Map<string, Task>();
export const focusSessions = new Map<string, FocusSession>();

export const VALID_STATUSES: TaskStatus[] = ["pending", "in-progress", "completed"];
export const VALID_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];
