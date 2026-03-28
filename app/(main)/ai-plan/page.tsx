"use client";

import * as React from "react";
import { addDays, addMinutes, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, CalendarClock, Clock3, Loader2, RefreshCw } from "lucide-react";
import { tasksApi, type Task } from "@/lib/api-client";

type OptimizedTask = {
  task: Task;
  suggestedStart: Date | null;
  suggestedEnd: Date | null;
  rank: number;
  reason: string;
};

export default function AiPlanPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadTasks = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.list();
      setTasks(data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const optimized = React.useMemo(() => buildOptimizedTaskList(tasks, new Date()), [tasks]);

  return (
    <main className="flex-1 bg-muted/5 overflow-y-auto w-full">
      <header className="px-8 py-8 border-b bg-background flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 text-indigo-600" />
            AI Optimized Plan
          </h1>
          <p className="text-muted-foreground mt-1">
            A prioritized queue of your tasks with recommended execution times.
          </p>
        </div>
        <Button variant="outline" onClick={loadTasks}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Plan
        </Button>
      </header>

      <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
        <Card className="border-indigo-200 bg-indigo-50/60">
          <CardHeader>
            <CardTitle className="text-base">How to read this</CardTitle>
            <CardDescription>
              Start from rank #1 and follow down the list. Each item includes a suggested start/end time and why it was positioned there.
            </CardDescription>
          </CardHeader>
        </Card>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : optimized.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No tasks found yet. Add tasks first, then AI Plan will optimize them.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {optimized.map((item) => (
              <Card key={`${item.task.id}-${item.rank}`} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">Rank #{item.rank}</Badge>
                        <Badge variant={item.task.priority === "urgent" ? "destructive" : item.task.priority === "high" ? "default" : "secondary"}>
                          {item.task.priority}
                        </Badge>
                        <Badge variant="outline">{item.task.status}</Badge>
                      </div>
                      <h2 className="text-lg font-semibold text-foreground">{item.task.title}</h2>
                      {(item.task.course || item.task.category) && (
                        <p className="text-sm text-muted-foreground">{[item.task.course, item.task.category].filter(Boolean).join(" • ")}</p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Due: {format(new Date(item.task.endTime), "EEE, MMM d • h:mm a")}
                    </div>
                  </div>

                  <div className="mt-4 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                    {item.suggestedStart && item.suggestedEnd ? (
                      <>
                        <p className="font-medium text-foreground flex items-center gap-2">
                          <CalendarClock className="h-4 w-4" />
                          Suggested: {format(item.suggestedStart, "EEE, MMM d • h:mm a")} - {format(item.suggestedEnd, "h:mm a")}
                        </p>
                        <p className="mt-1 text-muted-foreground">{item.reason}</p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Already completed. Kept for reference in your full task list.</p>
                    )}
                  </div>

                  {item.task.description && (
                    <div className="mt-3 text-sm text-muted-foreground flex items-start gap-2">
                      <Clock3 className="h-4 w-4 mt-0.5" />
                      <span>{item.task.description}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function buildOptimizedTaskList(tasks: Task[], anchorDate: Date): OptimizedTask[] {
  const selectedDayStart = startOfDaySafe(anchorDate);
  const todayStart = startOfDaySafe(new Date());
  const planningStart = selectedDayStart > todayStart ? selectedDayStart : todayStart;

  const pending = tasks
    .filter((task) => task.status !== "completed")
    .sort((a, b) => {
      const priorityDiff = getPriorityScore(b.priority) - getPriorityScore(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    });

  const completed = tasks
    .filter((task) => task.status === "completed")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const optimized: OptimizedTask[] = [];
  let cursor = setDayTime(new Date(planningStart), 9, 0);
  let rank = 1;

  for (const task of pending) {
    const durationMinutes = getTaskDurationMinutes(task);
    cursor = alignToQuarterHour(cursor);

    if (cursor.getHours() >= 20) {
      cursor = setDayTime(addDays(cursor, 1), 9, 0);
    }

    const suggestedStart = new Date(cursor);
    let suggestedEnd = addMinutes(suggestedStart, durationMinutes);
    if (suggestedEnd.getHours() >= 22) {
      const movedStart = setDayTime(addDays(suggestedStart, 1), 9, 0);
      suggestedEnd = addMinutes(movedStart, durationMinutes);
      optimized.push({
        task,
        suggestedStart: movedStart,
        suggestedEnd,
        rank,
        reason: `Prioritized as ${task.priority}; due ${format(new Date(task.endTime), "EEE, MMM d h:mm a")}.`,
      });
      cursor = addMinutes(suggestedEnd, 15);
      rank += 1;
      continue;
    }

    optimized.push({
      task,
      suggestedStart,
      suggestedEnd,
      rank,
      reason: `Prioritized as ${task.priority}; due ${format(new Date(task.endTime), "EEE, MMM d h:mm a")}.`,
    });

    cursor = addMinutes(suggestedEnd, 15);
    rank += 1;
  }

  for (const task of completed) {
    optimized.push({
      task,
      suggestedStart: null,
      suggestedEnd: null,
      rank,
      reason: "Completed task.",
    });
    rank += 1;
  }

  return optimized;
}

function getTaskDurationMinutes(task: Task): number {
  const start = new Date(task.startTime).getTime();
  const end = new Date(task.endTime).getTime();
  const raw = Math.round((end - start) / 60000);
  return Math.min(180, Math.max(30, raw));
}

function getPriorityScore(priority: Task["priority"]) {
  if (priority === "urgent") return 4;
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function alignToQuarterHour(date: Date) {
  const copy = new Date(date);
  const minutes = copy.getMinutes();
  const remainder = minutes % 15;
  if (remainder !== 0) {
    copy.setMinutes(minutes + (15 - remainder), 0, 0);
  }
  return copy;
}

function setDayTime(date: Date, hours: number, minutes: number) {
  const copy = new Date(date);
  copy.setHours(hours, minutes, 0, 0);
  return copy;
}

function startOfDaySafe(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
