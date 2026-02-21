"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, Play, Settings, CheckCircle, Flame, Clock, BrainCircuit, AlertCircle, Circle
} from "lucide-react";

export default function DashboardPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const tasks = [
    { id: 1, title: "Calculus Final Exam Prep", subject: "Math 202", due: "Today, 10:00 AM", priority: "URGENT", status: "incomplete" },
    { id: 2, title: "History Essay Draft", subject: "History 101", due: "Tomorrow, 11:59 PM", priority: "HIGH", status: "incomplete" },
    { id: 3, title: "Read Chapter 4-5", subject: "Physics", due: "Next Monday", priority: "LOW", status: "incomplete" },
    { id: 4, title: "Submit Lab Report", subject: "Chemistry", due: "Yesterday", priority: "URGENT", status: "completed" },
  ];

  const urgentTasks = tasks.filter(t => t.priority === "URGENT" && t.status === "incomplete");
  const incompleteTasks = tasks.filter(t => t.status === "incomplete");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="flex w-full h-full">
      {/* CENTER COLUMN: MAIN DASHBOARD */}
      <ScrollArea className="flex-1 bg-muted/5">
        <div className="p-8 max-w-5xl mx-auto space-y-8">
          
          <header className="flex justify-between items-center">
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">1:50 PM</h2>
              <span className="text-muted-foreground font-medium">Saturday, February 21</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-full"><RefreshCw className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="rounded-full"><Settings className="h-4 w-4" /></Button>
              <Avatar className="cursor-pointer border ml-2">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">AL</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white flex justify-between items-center shadow-md">
            <div>
              <p className="font-medium text-blue-100 mb-1">1 Urgent task requires attention.</p>
              <h1 className="text-4xl font-bold tracking-tight mb-4">Good Afternoon, Alex.</h1>
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-white/90 font-semibold border-0">
                View Smart Schedule
              </Button>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl flex items-center gap-6 border border-white/20 hidden sm:flex">
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
                <Button size="icon" className="bg-white text-blue-600 hover:bg-gray-100 rounded-full w-12 h-12 shadow-sm">
                  <Play className="fill-current w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<AlertCircle className="text-red-500 h-5 w-5" />} title="Urgent" value="1" subtext="Due today" />
            <StatCard icon={<Clock className="text-amber-500 h-5 w-5" />} title="Incomplete" value="3" subtext="Pending tasks" />
            <StatCard icon={<CheckCircle className="text-green-500 h-5 w-5" />} title="Completed" value="8" subtext="Last 7 days" />
            <StatCard icon={<BrainCircuit className="text-indigo-500 h-5 w-5" />} title="AI Optimized" value="12" subtext="Saved hours" />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Tasks</CardTitle>
              <CardDescription>Manage and track your AI-prioritized workload.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="incomplete" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
                  <TabsTrigger value="urgent" className="data-[state=active]:text-red-600">Urgent</TabsTrigger>
                  <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <TabsContent value="urgent" className="space-y-3">
                  {urgentTasks.map(task => <TaskRow key={task.id} task={task} />)}
                </TabsContent>
                <TabsContent value="incomplete" className="space-y-3">
                  {incompleteTasks.map(task => <TaskRow key={task.id} task={task} />)}
                </TabsContent>
                <TabsContent value="completed" className="space-y-3">
                  {completedTasks.map(task => <TaskRow key={task.id} task={task} />)}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* RIGHT COLUMN: CALENDAR & TIMELINE */}
      <aside className="w-80 border-l bg-background hidden xl:flex flex-col">
        <ScrollArea className="flex-1 p-6">
          <h3 className="font-semibold text-lg mb-4">Calendar</h3>
          <div className="border rounded-md p-1 bg-card shadow-sm mb-6 flex justify-center">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
          </div>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-border">
            <div className="relative flex items-center justify-between group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shrink-0 shadow-sm z-10">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              <div className="w-[calc(100%-3rem)] p-4 rounded-xl border bg-card shadow-sm">
                <span className="font-bold text-sm block">Calculus Exam Prep</span>
                <span className="text-muted-foreground text-xs font-medium flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> 10:00 AM</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}

function StatCard({ icon, title, value, subtext }: { icon: React.ReactNode, title: string, value: string, subtext: string }) {
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

function TaskRow({ task }: { task: any }) {
  const isCompleted = task.status === "completed";
  const isUrgent = task.priority === "URGENT";
  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${isCompleted ? 'bg-muted/30 opacity-70' : 'bg-card'}`}>
      <div className="flex items-center gap-4">
        {isCompleted ? <CheckCircle className="text-green-500 h-5 w-5" /> : <Circle className="text-muted-foreground h-5 w-5" />}
        <div>
          <h4 className={`text-sm font-semibold ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</h4>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{task.subject}</Badge>
            <span className="text-xs text-muted-foreground flex items-center"><Clock className="w-3 h-3 mr-1" /> {task.due}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!isCompleted && <Badge variant={isUrgent ? "destructive" : "outline"} className={isUrgent ? "animate-pulse" : ""}>{task.priority}</Badge>}
        <Button variant={isCompleted ? "ghost" : "secondary"} size="sm">{isCompleted ? 'View' : 'Start'}</Button>
      </div>
    </div>
  );
}