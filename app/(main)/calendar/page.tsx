"use client";

import * as React from "react";
import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Clock,
  Loader2,
} from "lucide-react";
import { profileApi, tasksApi, type Task } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAiPlanEnabled, setAiPlanEnabled, subscribeAiPlanEnabled } from "@/lib/ai-plan-toggle";

type CalendarView = "week" | "month";

export default function CalendarPage() {
  const router = useRouter();
  const [view, setView] = React.useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [aiOptimizedEnabled, setAiOptimizedEnabled] = React.useState<boolean>(() => getAiPlanEnabled());
  const [profilePhotoUrl, setProfilePhotoUrl] = React.useState<string | null>(null);
  const [profileInitials, setProfileInitials] = React.useState("AL");

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

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setProfileInitials(getInitials(user?.displayName, user?.email));

      if (!user) {
        setProfilePhotoUrl(null);
        return;
      }

      try {
        const profile = await profileApi.get();
        setProfilePhotoUrl(profile.profilePhotoUrl ?? user.photoURL ?? null);
      } catch {
        setProfilePhotoUrl(user.photoURL ?? null);
      }
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    const unsubscribe = subscribeAiPlanEnabled(setAiOptimizedEnabled);
    return unsubscribe;
  }, []);

  const sortedTasks = React.useMemo(
    () => [...tasks].sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime()),
    [tasks]
  );

  const aiRecommendations = React.useMemo(() => buildAiRecommendations(sortedTasks, currentDate), [sortedTasks, currentDate]);
  const aiCalendarTasks = React.useMemo(
    () =>
      aiRecommendations.map((item, index) => ({
        ...item.task,
        id: `${item.task.id}__ai__${index}`,
        startTime: item.suggestedStart.toISOString(),
        endTime: item.suggestedEnd.toISOString(),
      })),
    [aiRecommendations]
  );

  const visibleTasks = aiOptimizedEnabled ? aiCalendarTasks : sortedTasks;

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const monthSections = React.useMemo(() => {
    const baseMonth = startOfMonth(currentDate);
    return Array.from({ length: 6 }, (_, offset) => {
      const monthDate = addMonths(baseMonth, offset);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      const days: Date[] = [];

      for (let day = monthGridStart; day <= monthGridEnd; day = addDays(day, 1)) {
        days.push(day);
      }

      return { monthDate, days };
    });
  }, [currentDate]);

  const dayTasks = visibleTasks.filter((task) => {
    const d = startOfDaySafe(currentDate);
    return d >= startOfDaySafe(new Date(task.startTime)) && d <= startOfDaySafe(new Date(task.endTime));
  });
  const urgentTasks = visibleTasks.filter((task) => task.priority === "urgent" && new Date(task.startTime) >= startOfDaySafe(new Date()));

  function handlePrevious() {
    setCurrentDate((value) => {
      if (view === "week") return subWeeks(value, 1);
      return subMonths(value, 1);
    });
  }

  function handleNext() {
    setCurrentDate((value) => {
      if (view === "week") return addWeeks(value, 1);
      return addMonths(value, 1);
    });
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  const renderWeekDetails = () => (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-background p-6">
      <div className="mb-6 rounded-lg border bg-muted/20 p-3">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => setCurrentDate(day)}
              className={`rounded-md border px-2 py-2 text-center transition-colors ${
                isSameDay(day, currentDate)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide">{format(day, "EEE")}</p>
              <p className="text-sm font-bold mt-0.5">{format(day, "d")}</p>
            </button>
          ))}
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-6 text-foreground">{format(currentDate, "EEEE, MMM d")}</h3>
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : dayTasks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No tasks due on this day.
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-12 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
          {dayTasks.map((task) => {
            const startDate = new Date(task.startTime);
            const endDate = new Date(task.endTime);
            return (
              <div key={task.id} className="relative flex items-start gap-6 group">
                <div className="w-16 text-right pt-1">
                  <span className="text-xs font-bold text-muted-foreground">{format(startDate, "h:mm a")}</span>
                </div>
                <div className={`w-3 h-3 mt-1.5 rounded-full border-2 bg-background z-10 ${getDayDotStyles(task.priority)}`} />
                <div className={`flex-1 p-4 rounded-xl border shadow-sm ${getDayCardStyles(task.priority)}`}>
                  <h4 className="font-semibold text-foreground">{task.title}</h4>
                  {(task.course || task.category) && (
                    <p className="text-sm text-muted-foreground mt-1">{[task.course, task.category].filter(Boolean).join(" • ")}</p>
                  )}
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {isSameDay(startDate, endDate)
                        ? `${format(startDate, "h:mm a")} – ${format(endDate, "h:mm a")}`
                        : `${format(startDate, "MMM d, h:mm a")} – ${format(endDate, "MMM d, h:mm a")}`}
                    </span>
                    <Badge variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "default" : "secondary"}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <main className="flex-1 flex flex-col h-full bg-muted/5 w-full">
      <header className="px-4 md:px-8 py-6 border-b bg-background flex flex-col sm:flex-row justify-between sm:items-center gap-3 z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Schedule</h2>
          <p className="text-sm text-muted-foreground">View tasks by due date, then toggle AI to replace with optimized scheduling.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 py-1 px-3 hidden sm:inline-flex">
            <BrainCircuit className="w-3 h-3 mr-2" /> {aiOptimizedEnabled ? "AI Optimized On" : "AI Optimized Off"}
          </Badge>
          <Button variant="outline" size="icon" className="rounded-full" onClick={loadTasks} title="Refresh">
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.push('/settings')} title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
          <Avatar
            className="cursor-pointer border"
            role="button"
            tabIndex={0}
            onClick={() => router.push('/settings')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                router.push('/settings');
              }
            }}
            aria-label="Open profile settings"
          >
            <AvatarImage src={profilePhotoUrl ?? undefined} alt="Profile" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{profileInitials}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-8 flex flex-col overflow-hidden min-h-0">
        <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)} className="flex-1 flex flex-col h-full min-h-0">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <h3 className="text-xl font-bold">{getHeading(view, currentDate, weekDays)}</h3>
              <div className="flex items-center gap-1 bg-background border rounded-md p-1 shadow-sm">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="h-7 px-3 text-xs font-medium" onClick={handleToday}>Today</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <TabsList className="grid grid-cols-2 w-full sm:w-[220px] shadow-sm">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
              <Button
                type="button"
                variant={aiOptimizedEnabled ? "default" : "outline"}
                className="whitespace-nowrap"
                onClick={() => setAiPlanEnabled(!aiOptimizedEnabled)}
              >
                <BrainCircuit className="h-4 w-4 mr-2" />
                {aiOptimizedEnabled ? "AI On" : "AI Off"}
              </Button>
            </div>
          </div>

          <Card className="flex-1 overflow-hidden flex flex-col bg-background shadow-sm border min-h-0">
            <TabsContent value="month" className="m-0 flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-3 space-y-6 min-h-0">
                {monthSections.map((section) => (
                  <section key={section.monthDate.toISOString()} className="rounded-lg border overflow-hidden">
                    <div className="px-4 py-3 bg-muted/40 border-b text-sm font-semibold">
                      {format(section.monthDate, "MMMM yyyy")}
                    </div>
                    <div className="grid grid-cols-7 border-b bg-muted/20">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="py-2 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 auto-rows-fr bg-border gap-px">
                      {section.days.map((day) => {
                        const tasksForDay = visibleTasks.filter((task) => {
                          const d = startOfDaySafe(day);
                          return d >= startOfDaySafe(new Date(task.startTime)) && d <= startOfDaySafe(new Date(task.endTime));
                        });
                        return (
                          <button
                            type="button"
                            key={day.toISOString()}
                            onClick={() => {
                              setCurrentDate(day);
                              setView("week");
                            }}
                            className="bg-background p-2 min-h-[110px] hover:bg-muted/10 transition-colors text-left"
                          >
                            <span
                              className={`text-sm font-medium ${
                                isToday(day)
                                  ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                                  : isSameMonth(day, section.monthDate)
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {format(day, "d")}
                            </span>
                            <div className="mt-2 space-y-1">
                              {tasksForDay.slice(0, 3).map((task) => (
                                <div
                                  key={task.id}
                                  className={`text-[10px] font-bold p-1 rounded truncate ${getEventStyles(task.priority)}`}
                                >
                                  {format(new Date(task.startTime), "ha")} {task.title}
                                </div>
                              ))}
                              {tasksForDay.length > 3 && (
                                <div className="text-[10px] text-muted-foreground">+{tasksForDay.length - 3} more</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="week" className="m-0 flex flex-1 min-h-0">
              {renderWeekDetails()}
            </TabsContent>

          </Card>
        </Tabs>

        <div className="mt-4 rounded-lg border bg-background px-4 py-3 text-sm text-muted-foreground">
          {urgentTasks.length > 0
            ? `${urgentTasks.length} urgent task${urgentTasks.length === 1 ? " is" : "s are"} coming up.`
            : "No urgent tasks are coming up right now."}
        </div>
      </div>
    </main>
  );
}

function getHeading(view: CalendarView, currentDate: Date, weekDays: Date[]) {
  if (view === "week") return `${format(weekDays[0], "MMMM d")} - ${format(weekDays[6], "MMMM d, yyyy")}`;
  return format(currentDate, "MMMM yyyy");
}

function startOfDaySafe(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getEventStyles(priority: Task["priority"]) {
  if (priority === "urgent") return "bg-red-100 text-red-700";
  if (priority === "high") return "bg-blue-100 text-blue-700";
  return "bg-green-100 text-green-700";
}

function getDayDotStyles(priority: Task["priority"]) {
  if (priority === "urgent") return "border-red-500";
  if (priority === "high") return "border-blue-500";
  return "border-green-500";
}

function getDayCardStyles(priority: Task["priority"]) {
  if (priority === "urgent") return "bg-red-50/50 border-red-100";
  if (priority === "high") return "bg-blue-50/50 border-blue-100";
  return "bg-green-50/50 border-green-100";
}

function getInitials(name?: string | null, email?: string | null) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
  }
  if (email && email.trim()) {
    return email.trim()[0]?.toUpperCase() ?? "U";
  }
  return "U";
}

type AiRecommendation = {
  task: Task;
  suggestedStart: Date;
  suggestedEnd: Date;
  reason: string;
};

function buildAiRecommendations(tasks: Task[], anchorDate: Date): AiRecommendation[] {
  const selectedDayStart = startOfDaySafe(anchorDate);
  const todayStart = startOfDaySafe(new Date());
  const planningStart = selectedDayStart > todayStart ? selectedDayStart : todayStart;
  const planningEnd = addDays(planningStart, 7);

  const scoped = tasks
    .filter((task) => task.status !== "completed")
    .filter((task) => new Date(task.endTime) >= planningStart && new Date(task.startTime) < planningEnd)
    .sort((a, b) => {
      const priorityDiff = getPriorityScore(b.priority) - getPriorityScore(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    });

  const recommendations: AiRecommendation[] = [];
  let cursor = setDayTime(new Date(planningStart), 9, 0);

  for (const task of scoped) {
    const durationMinutes = getTaskDurationMinutes(task);
    cursor = alignToQuarterHour(cursor);

    if (cursor.getHours() >= 20) {
      cursor = setDayTime(addDays(cursor, 1), 9, 0);
    }

    const suggestedStart = new Date(cursor);
    const suggestedEnd = addMinutes(suggestedStart, durationMinutes);

    if (suggestedEnd.getHours() >= 22) {
      const movedStart = setDayTime(addDays(suggestedStart, 1), 9, 0);
      recommendations.push({
        task,
        suggestedStart: movedStart,
        suggestedEnd: addMinutes(movedStart, durationMinutes),
        reason: `Prioritized as ${task.priority}; due ${format(new Date(task.endTime), "EEE, MMM d h:mm a")}.`,
      });
      cursor = addMinutes(movedStart, durationMinutes + 15);
      continue;
    }

    recommendations.push({
      task,
      suggestedStart,
      suggestedEnd,
      reason: `Prioritized as ${task.priority}; due ${format(new Date(task.endTime), "EEE, MMM d h:mm a")}.`,
    });

    cursor = addMinutes(suggestedEnd, 15);
  }

  return recommendations;
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