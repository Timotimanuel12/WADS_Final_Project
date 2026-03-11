import { auth } from "@/lib/firebase";
import type { Task, TaskStatus, TaskPriority } from "@/lib/store";

export type { Task, TaskStatus, TaskPriority };

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  const json = (await res.json()) as { success: boolean; data?: T; error?: string };
  if (!json.success) throw new Error(json.error ?? "API error");
  return json.data as T;
}

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  course?: string;
  startTime: string;
  endTime: string;
};

export type CreateSessionInput = {
  taskId?: string;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
  notes?: string;
};

export type FocusSessionRecord = {
  id: string;
  userId: string;
  taskId: string | null;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
  notes: string;
};

export const sessionsApi = {
  list: () => apiFetch<FocusSessionRecord[]>("/api/sessions"),
  create: (input: CreateSessionInput) =>
    apiFetch<FocusSessionRecord>("/api/sessions", { method: "POST", body: JSON.stringify(input) }),
};

export const tasksApi = {
  list: () => apiFetch<Task[]>("/api/tasks"),
  create: (input: CreateTaskInput) =>
    apiFetch<Task>("/api/tasks", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: Partial<CreateTaskInput>) =>
    apiFetch<Task>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: string) =>
    apiFetch<{ deleted: boolean }>(`/api/tasks/${id}`, { method: "DELETE" }),
};
