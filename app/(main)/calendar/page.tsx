"use client";

import * as React from "react";
import {
  addDays,
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
import { tasksApi, type Task } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

type CalendarView = "day" | "week" | "month";

const HOURS = Array.from({ length: 24 }, (_, index) => index);

export default function CalendarPage() {
  const router = useRouter();
  const [view, setView] = React.useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setProfilePhotoUrl(user?.photoURL ?? null);
      setProfileInitials(getInitials(user?.displayName, user?.email));
    });
    return unsubscribe;
  }, []);

  const sortedTasks = React.useMemo(
    () => [...tasks].sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime()),
    [tasks]
  );

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const monthDays: Date[] = [];

  for (let day = monthGridStart; day <= monthGridEnd; day = addDays(day, 1)) {
    monthDays.push(day);
  }

  const dayTasks = sortedTasks.filter((task) => {
    const d = startOfDaySafe(currentDate);
    return d >= startOfDaySafe(new Date(task.startTime)) && d <= startOfDaySafe(new Date(task.endTime));
  });
  const urgentTasks = sortedTasks.filter((task) => task.priority === "urgent" && new Date(task.startTime) >= startOfDaySafe(new Date()));

  function handlePrevious() {
    setCurrentDate((value) => {
      if (view === "day") return addDays(value, -1);
      if (view === "week") return subWeeks(value, 1);
      return subMonths(value, 1);
    });
  }

  function handleNext() {
    setCurrentDate((value) => {
      if (view === "day") return addDays(value, 1);
      if (view === "week") return addWeeks(value, 1);
      return addMonths(value, 1);
    });
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-muted/5 w-full">
      <header className="px-4 md:px-8 py-6 border-b bg-background flex flex-col sm:flex-row justify-between sm:items-center gap-3 z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Schedule</h2>
          <p className="text-sm text-muted-foreground">View tasks by due date across day, week, and month.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 py-1 px-3 hidden sm:inline-flex">
            <BrainCircuit className="w-3 h-3 mr-2" /> AI Auto-Plan Active
          </Badge>
          <Button variant="outline" size="icon" className="rounded-full" onClick={loadTasks} title="Refresh">
            <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.push('/settings')} title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
          <Avatar className="cursor-pointer border">
            <AvatarImage src={profilePhotoUrl ?? undefined} alt="Profile" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{profileInitials}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-8 flex flex-col overflow-hidden">
        <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)} className="flex-1 flex flex-col h-full">
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
            <TabsList className="grid grid-cols-3 w-full sm:w-[300px] shadow-sm">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </div>

          <Card className="flex-1 overflow-hidden flex flex-col bg-background shadow-sm border">
            <TabsContent value="month" className="m-0 flex-1 flex flex-col">
              <div className="grid grid-cols-7 border-b bg-muted/30">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-border gap-px overflow-y-auto">
                {monthDays.map((day) => {
                  const tasksForDay = sortedTasks.filter((task) => {
                    const d = startOfDaySafe(day);
                    return d >= startOfDaySafe(new Date(task.startTime)) && d <= startOfDaySafe(new Date(task.endTime));
                  });
                  return (
                    <div key={day.toISOString()} className="bg-background p-2 min-h-[110px] hover:bg-muted/10 transition-colors">
                      <span
                        className={`text-sm font-medium ${
                          isToday(day)
                            ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center"
                            : isSameMonth(day, currentDate)
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
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="week" className="m-0 flex-1 flex flex-col overflow-auto">
              <div className="grid grid-cols-8 border-b bg-background sticky top-0 z-30">
                <div className="py-3 border-r"></div>
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className={`py-3 text-center border-r last:border-r-0 ${isToday(day) ? "bg-primary/5" : ""}`}>
                    <span className={`text-sm font-semibold ${isToday(day) ? "text-primary" : "text-muted-foreground"}`}>
                      {format(day, "d EEE")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="relative flex-1 grid grid-cols-8 min-h-[1728px]">
                <div className="border-r flex flex-col bg-background z-10">
                  {HOURS.map((hour) => (
                    <div key={hour} className="min-h-[72px] border-b text-xs text-muted-foreground text-right pr-2 pt-2">
                      {formatHour(hour)}
                    </div>
                  ))}
                </div>
                <div className="col-span-7 grid grid-cols-7 bg-border gap-px">
                  {weekDays.map((day) => {
                    const tasksForDay = sortedTasks.filter((task) => {
                      const d = startOfDaySafe(day);
                      return d >= startOfDaySafe(new Date(task.startTime)) && d <= startOfDaySafe(new Date(task.endTime));
                    });
                    const overlapLayout = computeDayOverlapLayout(tasksForDay);
                    return (
                      <div key={day.toISOString()} className={`bg-background relative overflow-hidden ${isToday(day) ? "bg-primary/[0.02]" : ""}`}>
                        {HOURS.map((hour) => (
                          <div key={hour} className="min-h-[72px] border-b border-dashed border-muted"></div>
                        ))}
                        {tasksForDay.map((task) => {
                          const startDate = new Date(task.startTime);
                          const endDate = new Date(task.endTime);
                          const layout = getWeekEventLayout(startDate, endDate, day);
                          if (layout === null) return null;
                          const ol = overlapLayout.get(task.id) ?? { column: 0, totalColumns: 1 };
                          const widthPct = 100 / ol.totalColumns;
                          const leftPct = ol.column * widthPct;
                          return (
                            <div
                              key={task.id}
                              className={`absolute rounded-md p-1.5 shadow-sm z-20 overflow-hidden border ${getWeekCardStyles(task.priority)}`}
                              style={{
                                top: layout.top,
                                height: layout.height,
                                left: `calc(${leftPct}% + 2px)`,
                                width: `calc(${widthPct}% - 4px)`,
                                minWidth: "28px",
                              }}
                            >
                              <p className="text-xs font-bold truncate">{task.title}</p>
                              <p className="text-[10px] opacity-80 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {isSameDay(startDate, endDate)
                                  ? `${format(startDate, "h:mm a")} – ${format(endDate, "h:mm a")}`
                                  : `${format(startDate, "MMM d")} – ${format(endDate, "MMM d")}`}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="day" className="m-0 flex-1 flex flex-col overflow-y-auto bg-background p-6">
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
  if (view === "day") return format(currentDate, "MMMM d, yyyy");
  if (view === "week") return `${format(weekDays[0], "MMMM d")} - ${format(weekDays[6], "MMMM d, yyyy")}`;
  return format(currentDate, "MMMM yyyy");
}

function formatHour(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

function getWeekEventLayout(startDate: Date, endDate: Date, currentDay?: Date) {
  const isMultiDay = !isSameDay(startDate, endDate);
  let topHour: number, topMinutes: number, durationMinutes: number;

  if (isMultiDay && currentDay) {
    if (isSameDay(startDate, currentDay)) {
      topHour = startDate.getHours();
      topMinutes = startDate.getMinutes();
      durationMinutes = (24 - topHour) * 60 - topMinutes;
    } else if (isSameDay(endDate, currentDay)) {
      topHour = 0;
      topMinutes = 0;
      const endMins = endDate.getHours() * 60 + endDate.getMinutes();
      durationMinutes = Math.max(60, endMins);
    } else {
      topHour = 0;
      topMinutes = 0;
      durationMinutes = 24 * 60;
    }
  } else {
    topHour = startDate.getHours();
    topMinutes = startDate.getMinutes();
    durationMinutes = Math.max(15, (endDate.getTime() - startDate.getTime()) / 60000);
  }

  const top = topHour * 72 + (topMinutes / 60) * 72 + 4;
  const height = Math.max(28, (durationMinutes / 60) * 72 - 8);
  return { top: `${top}px`, height: `${height}px` };
}

function startOfDaySafe(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function computeDayOverlapLayout(
  tasks: { id: string; startTime: string; endTime: string }[]
): Map<string, { column: number; totalColumns: number }> {
  const result = new Map<string, { column: number; totalColumns: number }>();
  if (tasks.length === 0) return result;

  const sorted = [...tasks].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const columnEnds: number[] = [];
  const taskCols = new Map<string, number>();

  for (const task of sorted) {
    const s = new Date(task.startTime).getTime();
    const e = new Date(task.endTime).getTime();
    let col = columnEnds.findIndex((end) => end <= s);
    if (col === -1) { col = columnEnds.length; columnEnds.push(e); }
    else columnEnds[col] = e;
    taskCols.set(task.id, col);
  }

  const total = columnEnds.length;
  for (const task of sorted) {
    result.set(task.id, { column: taskCols.get(task.id) ?? 0, totalColumns: total });
  }
  return result;
}

function getEventStyles(priority: Task["priority"]) {
  if (priority === "urgent") return "bg-red-100 text-red-700";
  if (priority === "high") return "bg-blue-100 text-blue-700";
  return "bg-green-100 text-green-700";
}

function getWeekCardStyles(priority: Task["priority"]) {
  if (priority === "urgent") return "bg-red-50 border-red-200 text-red-700";
  if (priority === "high") return "bg-blue-50 border-blue-200 text-blue-700";
  return "bg-green-50 border-green-200 text-green-700";
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