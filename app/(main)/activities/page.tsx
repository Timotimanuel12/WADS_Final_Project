"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ActivityCard from "@/components/ActivityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, ArrowUpDown, CheckCircle2, AlertCircle, Link2, Paperclip, Upload, X } from "lucide-react";
import { tasksApi, type Task, type TaskStatus, type TaskPriority } from "@/lib/api-client";

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const API_TO_UI_STATUS: Record<TaskStatus, "Pending" | "In Progress" | "Completed"> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
};
const UI_TO_API_STATUS: Record<string, TaskStatus> = {
  Pending: "pending",
  "In Progress": "in-progress",
  Completed: "completed",
};
const API_TO_UI_PRIORITY: Record<TaskPriority, "Low" | "Medium" | "High" | "Urgent"> = {
  low: "Low", medium: "Medium", high: "High", urgent: "Urgent",
};

type FormState = {
  title: string;
  description: string;
  category: string;
  course: string;
  taskLink: string;
  attachmentName: string;
  attachmentMimeType: string;
  attachmentDataUrl: string;
  priority: TaskPriority;
  status: TaskStatus;
  startTime: string;
  endTime: string;
};

type SortOption = "created-desc" | "due-asc" | "due-desc" | "priority-desc";

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  course: "",
  taskLink: "",
  attachmentName: "",
  attachmentMimeType: "",
  attachmentDataUrl: "",
  priority: "medium",
  status: "pending",
  startTime: "",
  endTime: "",
};

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export default function ActivitiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("created-desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const data = await tasksApi.list();
      setTasks(data);
    } catch {
      // silently ignore — user may not be authed yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  useEffect(() => {
    if (searchParams.get("new") !== "1") return;
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setDialogOpen(true);
    router.replace("/activities");
  }, [router, searchParams]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setDialogOpen(true);
  }

  function openEdit(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setEditingId(id);
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      course: task.course,
      taskLink: task.taskLink ?? "",
      attachmentName: task.attachmentName ?? "",
      attachmentMimeType: task.attachmentMimeType ?? "",
      attachmentDataUrl: task.attachmentDataUrl ?? "",
      priority: task.priority,
      status: task.status,
      startTime: toDateTimeLocalValue(task.startTime),
      endTime: toDateTimeLocalValue(task.endTime),
    });
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.startTime) { setError("Start time is required."); return; }
    if (!form.endTime) { setError("End time is required."); return; }
    const startTime = new Date(form.startTime).toISOString();
    const endTime = new Date(form.endTime).toISOString();
    if (new Date(startTime) >= new Date(endTime)) {
      setError("End time must be after start time.");
      return;
    }

    if (form.taskLink.trim() && !/^https?:\/\//i.test(form.taskLink.trim())) {
      setError("Link must start with http:// or https://");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const updated = await tasksApi.update(editingId, {
          title: form.title,
          description: form.description,
          category: form.category,
          course: form.course,
          taskLink: form.taskLink.trim(),
          attachmentName: form.attachmentName,
          attachmentMimeType: form.attachmentMimeType,
          attachmentDataUrl: form.attachmentDataUrl,
          priority: form.priority,
          status: form.status,
          startTime,
          endTime,
        });
        setTasks((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
        setToast({ type: "success", message: "Task updated." });
      } else {
        const created = await tasksApi.create({
          title: form.title,
          description: form.description,
          category: form.category,
          course: form.course,
          taskLink: form.taskLink.trim(),
          attachmentName: form.attachmentName,
          attachmentMimeType: form.attachmentMimeType,
          attachmentDataUrl: form.attachmentDataUrl,
          priority: form.priority,
          status: form.status,
          startTime,
          endTime,
        });
        setTasks((prev) => [created, ...prev]);
        setToast({ type: "success", message: "Task created." });
      }
      setDialogOpen(false);
    } catch (e) {
      const message = (e as Error).message;
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setSaving(false);
    }
  }

  function clearAttachment() {
    setForm((f) => ({
      ...f,
      attachmentName: "",
      attachmentMimeType: "",
      attachmentDataUrl: "",
    }));
  }

  function handleAttachmentChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError("Attachment must be 10MB or less.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setError("Failed to read selected file.");
        return;
      }

      setForm((f) => ({
        ...f,
        attachmentName: file.name,
        attachmentMimeType: file.type || "application/octet-stream",
        attachmentDataUrl: result,
      }));
      setError("");
    };

    reader.onerror = () => {
      setError("Failed to read selected file.");
    };

    reader.readAsDataURL(file);
  }

  function openAttachmentPicker() {
    fileInputRef.current?.click();
  }

  async function handleDelete(id: string) {
    try {
      await tasksApi.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setToast({ type: "success", message: "Task deleted." });
    } catch (e) {
      setToast({ type: "error", message: (e as Error).message });
    }
  }

  async function handleStatusChange(id: string, uiStatus: "Pending" | "In Progress" | "Completed") {
    try {
      const updated = await tasksApi.update(id, { status: UI_TO_API_STATUS[uiStatus] });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setToast({ type: "success", message: `Task marked ${uiStatus.toLowerCase()}.` });
    } catch (e) {
      setToast({ type: "error", message: (e as Error).message });
    }
  }

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filtered = tasks
    .filter((t) => {
      if (filter === "All") return true;
      return API_TO_UI_STATUS[t.status] === filter;
    })
    .sort((left, right) => {
      if (sortBy === "due-asc") {
        return new Date(left.startTime).getTime() - new Date(right.startTime).getTime();
      }
      if (sortBy === "due-desc") {
        return new Date(right.startTime).getTime() - new Date(left.startTime).getTime();
      }
      if (sortBy === "priority-desc") {
        return PRIORITY_WEIGHT[right.priority] - PRIORITY_WEIGHT[left.priority];
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

  return (
    <main className="flex-1 flex flex-col h-full bg-muted/5 overflow-y-auto w-full">
      <header className="px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-background">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Activities</h1>
          <p className="text-muted-foreground mt-1">Manage your academic, work, and personal projects.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> New Activity
        </Button>
      </header>

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-background p-2 rounded-lg border shadow-sm">
          <Tabs defaultValue="All" className="w-full sm:w-auto" onValueChange={setFilter}>
            <TabsList className="grid w-full grid-cols-4 sm:w-[400px]">
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="In Progress">Active</TabsTrigger>
              <TabsTrigger value="Completed">Done</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="w-full sm:w-56">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Sort tasks" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created-desc">Newest first</SelectItem>
                <SelectItem value="due-asc">Due date: earliest</SelectItem>
                <SelectItem value="due-desc">Due date: latest</SelectItem>
                <SelectItem value="priority-desc">Priority: highest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((task) => (
                <ActivityCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  category={[task.course, task.category].filter(Boolean).join(" • ") || "General"}
                  description={task.description}
                  taskLink={task.taskLink ?? undefined}
                  attachmentName={task.attachmentName ?? undefined}
                  attachmentDataUrl={task.attachmentDataUrl ?? undefined}
                  attachmentMimeType={task.attachmentMimeType ?? undefined}
                  startTime={task.startTime}
                  endTime={task.endTime}
                  status={API_TO_UI_STATUS[task.status]}
                  priority={API_TO_UI_PRIORITY[task.priority]}
                  type={task.category || "Task"}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onEdit={openEdit}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                {tasks.length === 0
                  ? "No activities yet. Click \"New Activity\" to add one."
                  : "No activities match this filter."}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Activity" : "New Activity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="act-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="act-title"
                placeholder="e.g. Study for Calculus Final"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="act-description">Description</Label>
              <Textarea
                id="act-description"
                placeholder="Optional notes, subtasks, or details"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="act-category">Category</Label>
                <Input
                  id="act-category"
                  placeholder="e.g. Academic, Work, Project"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="act-course">Course</Label>
                <Input
                  id="act-course"
                  placeholder="e.g. Math 202"
                  value={form.course}
                  onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="act-link" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" /> Optional Link
                </Label>
                <Input
                  id="act-link"
                  placeholder="https://example.com/resource"
                  value={form.taskLink}
                  onChange={(e) => setForm((f) => ({ ...f, taskLink: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Optional File / Image (max 10MB)
                </Label>
                <input
                  ref={fileInputRef}
                  id="act-file"
                  type="file"
                  onChange={handleAttachmentChange}
                  className="hidden"
                />
                <Button type="button" variant="outline" className="w-full justify-start" onClick={openAttachmentPicker}>
                  <Upload className="h-4 w-4 mr-2" />
                  {form.attachmentName ? "Change attached file" : "Click to upload file/image"}
                </Button>
                {form.attachmentName && (
                  <div className="rounded-md border px-3 py-2 text-sm flex items-center justify-between gap-3">
                    <span className="truncate">Attached: {form.attachmentName}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={clearAttachment}>
                      <X className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v as TaskPriority }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as TaskStatus }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="act-start">
                Start Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="act-start"
                type="datetime-local"
                value={form.startTime}
                required
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="act-end">
                End Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="act-end"
                type="datetime-local"
                value={form.endTime}
                required
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-lg border bg-background px-4 py-3 shadow-lg">
          <div className="flex items-start gap-3">
            {toast.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
            )}
            <div>
              <p className="text-sm font-medium">
                {toast.type === "success" ? "Success" : "Error"}
              </p>
              <p className="text-sm text-muted-foreground">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}