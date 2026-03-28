"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw, Play, Settings, CheckCircle, Clock, BrainCircuit, AlertCircle, Circle, Loader2
} from "lucide-react";
import { profileApi, tasksApi, type Task } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function DashboardPage() {
  const router = useRouter();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [activeTaskTab, setActiveTaskTab] = React.useState("incomplete");
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [displayName, setDisplayName] = React.useState("there");
  const [profilePhotoUrl, setProfilePhotoUrl] = React.useState<string | null>(null);
  const [profileInitials, setProfileInitials] = React.useState("AL");

  const loadTasks = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.list();
      setTasks(data);
    } catch {
      // user may not be authed yet
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { loadTasks(); }, [loadTasks]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const name = user?.displayName?.trim() || "there";
      setDisplayName(name.split(" ")[0] || "there");
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

  async function handleStatusToggle(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const next = task.status === "completed" ? "pending" : task.status === "in-progress" ? "completed" : "in-progress";
    const updated = await tasksApi.update(id, { status: next });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  const urgentTasks = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed");
  const incompleteTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const taskGroups: Record<string, Task[]> = {
    urgent: urgentTasks,
    incomplete: incompleteTasks,
    completed: completedTasks,
  };

  const renderTaskContent = (key: string, emptyMessage: string) => {
    if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
    const items = taskGroups[key] ?? [];
    if (items.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      );
    }
    return items.map((task) => (
      <TaskRow key={task.id} task={task} onToggle={handleStatusToggle} />
    ));
  };

  return (
    <div className="flex w-full h-full">
      {/* CENTER COLUMN */}
      <ScrollArea className="flex-1 bg-muted/5">
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">

          <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </h2>
              <span className="text-muted-foreground font-medium">
                {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-full" onClick={loadTasks} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.push('/settings')} title="Settings">
                <Settings className="h-4 w-4" />
              </Button>
              <Avatar
                className="cursor-pointer border ml-2"
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
                <AvatarImage src={profilePhotoUrl ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{profileInitials}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 md:p-8 text-white flex flex-col lg:flex-row justify-between lg:items-center gap-6 shadow-md">
            <div>
              <p className="font-medium text-blue-100 mb-1">
                {urgentTasks.length > 0 ? `${urgentTasks.length} urgent task${urgentTasks.length > 1 ? "s require" : " requires"} attention.` : "You're all caught up!"}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Good {getGreeting()}, {displayName}.</h1>
              <Button
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-white/90 font-semibold border-0"
                onClick={() => router.push('/ai-plan')}
              >
                View Smart Schedule
              </Button>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl items-center gap-6 border border-white/20 hidden sm:flex">
              <div className="relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/20" />
                  <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="301" strokeDashoffset="60" className="text-white" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-[10px] text-blue-100 uppercase tracking-wider font-bold mb-0.5">Focus</span>
                  <span className="text-2xl font-bold tabular-nums">25:00</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button size="icon" className="bg-white text-blue-600 hover:bg-gray-100 rounded-full w-12 h-12 shadow-sm" onClick={() => router.push('/focus-timer')} title="Open Focus Timer">
                  <Play className="fill-current w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<AlertCircle className="text-red-500 h-5 w-5" />} title="Urgent" value={String(urgentTasks.length)} subtext="Need attention" />
            <StatCard icon={<Clock className="text-amber-500 h-5 w-5" />} title="Incomplete" value={String(incompleteTasks.length)} subtext="Pending tasks" />
            <StatCard icon={<CheckCircle className="text-green-500 h-5 w-5" />} title="Completed" value={String(completedTasks.length)} subtext="Done" />
            <StatCard icon={<BrainCircuit className="text-indigo-500 h-5 w-5" />} title="Total" value={String(tasks.length)} subtext="All tasks" />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>Manage and track your workload.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTaskTab} onValueChange={setActiveTaskTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
                  <TabsTrigger value="urgent" className="data-[state=active]:text-red-600">Urgent</TabsTrigger>
                  <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="urgent" className="space-y-3">
                  {renderTaskContent("urgent", "No urgent tasks right now. Great job staying ahead.")}
                </TabsContent>
                <TabsContent value="incomplete" className="space-y-3">
                  {renderTaskContent("incomplete", "No pending tasks. You are all caught up.")}
                </TabsContent>
                <TabsContent value="completed" className="space-y-3">
                  {renderTaskContent("completed", "No completed tasks yet. Start a session to build momentum.")}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* RIGHT COLUMN: CALENDAR */}
      <aside className="w-80 border-l bg-background hidden xl:flex flex-col">
        <ScrollArea className="flex-1 p-6">
          <h3 className="font-semibold text-lg mb-4">Calendar</h3>
          <div className="border rounded-md p-1 bg-card shadow-sm mb-6 flex justify-center">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
          </div>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border">
            {urgentTasks.slice(0, 3).map((t) => (
              <div key={t.id} className="relative flex items-center justify-between group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shrink-0 shadow-sm z-10">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div className="w-[calc(100%-3rem)] p-4 rounded-xl border bg-card shadow-sm">
                  <span className="font-bold text-sm block">{t.title}</span>
                  {(t.course || t.category) && (
                    <span className="text-muted-foreground text-xs block mt-1">
                      {[t.course, t.category].filter(Boolean).join(" • ")}
                    </span>
                  )}
                  <span className="text-muted-foreground text-xs font-medium flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> {new Date(t.startTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {urgentTasks.length === 0 && (
              <p className="text-sm text-muted-foreground pl-14">No urgent tasks.</p>
            )}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
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

function StatCard({ icon, title, value, subtext }: { icon: React.ReactNode; title: string; value: string; subtext: string }) {
  return (
    <Card className="shadow-none border bg-card/50 hover:bg-card hover:shadow-sm transition-all">
      <CardContent className="p-6 flex flex-col items-center text-center sm:block sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 text-sm font-semibold text-muted-foreground">{icon} {title}</div>
        <div className="text-3xl font-bold text-primary mb-1">{value}</div>
        <p className="text-xs text-muted-foreground font-medium">{subtext}</p>
      </CardContent>
    </Card>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const isCompleted = task.status === "completed";
  const isUrgent = task.priority === "urgent";
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg transition-colors ${isCompleted ? "bg-muted/30 opacity-70" : "bg-card"}`}>
      <div className="flex items-center gap-4 min-w-0">
        <button onClick={() => onToggle(task.id)} className="shrink-0 focus:outline-none" title="Toggle status">
          {isCompleted
            ? <CheckCircle className="text-green-500 h-5 w-5" />
            : <Circle className="text-muted-foreground h-5 w-5" />}
        </button>
        <div className="min-w-0">
          <h4 className={`text-sm font-semibold ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</h4>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {task.category && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{task.category}</Badge>}
            {task.course && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{task.course}</Badge>}
            {
              <span className="text-xs text-muted-foreground flex items-center">
                <Clock className="w-3 h-3 mr-1" /> {new Date(task.startTime).toLocaleDateString()}
              </span>
            }
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!isCompleted && (
          <Badge variant={isUrgent ? "destructive" : "outline"} className={isUrgent ? "animate-pulse" : ""}>
            {task.priority.toUpperCase()}
          </Badge>
        )}
        <Button variant={isCompleted ? "ghost" : "secondary"} size="sm" onClick={() => onToggle(task.id)}>
          {isCompleted ? "Undo" : task.status === "in-progress" ? "Complete" : "Start"}
        </Button>
      </div>
    </div>
  );
}
