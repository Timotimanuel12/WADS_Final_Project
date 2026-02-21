"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { 
  LayoutDashboard, Calendar as CalendarIcon, ListTodo, Timer, 
  Plus, Moon, HelpCircle, RefreshCw, Play, Settings, 
  CheckCircle, Flame, Clock, BrainCircuit 
} from "lucide-react";

export default function DashboardPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 border-r bg-muted/10 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">F</div>
          <h1 className="text-xl font-bold tracking-tight">FocusFlow</h1>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 mb-6">
            <Button variant="secondary" className="w-full justify-start font-semibold">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <CalendarIcon className="mr-2 h-4 w-4" /> Calendar
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <ListTodo className="mr-2 h-4 w-4" /> Activities
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Timer className="mr-2 h-4 w-4" /> Focus Timer
            </Button>
          </div>

          <Separator className="mb-6" />

          <div className="space-y-2">
            <Button className="w-full justify-start shadow-sm" variant="default">
              <Plus className="mr-2 h-4 w-4" /> Add New Task
            </Button>
            <Button className="w-full justify-start bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-none">
              <BrainCircuit className="mr-2 h-4 w-4" /> Enable AI Auto-Plan
            </Button>
          </div>
        </ScrollArea>

        <div className="p-4 mt-auto">
          <Separator className="mb-4" />
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Moon className="mr-2 h-4 w-4" /> Dark Mode
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <HelpCircle className="mr-2 h-4 w-4" /> Help Center
            </Button>
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* CENTER COLUMN: MAIN DASHBOARD              */}
      {/* ========================================== */}
      <ScrollArea className="flex-1 bg-muted/5">
        <div className="p-8 max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="flex justify-between items-center">
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">1:50 PM</h2>
              <span className="text-muted-foreground font-medium">Saturday, February 21</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-full"><RefreshCw className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="rounded-full"><Settings className="h-4 w-4" /></Button>
              <Avatar className="cursor-pointer border ml-2">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">AL</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Hero Banner (Gradient + Timer) */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white flex justify-between items-center shadow-md">
            <div>
              <p className="font-medium text-blue-100 mb-1">0 tasks due today.</p>
              <h1 className="text-4xl font-bold tracking-tight mb-4">Good Afternoon.</h1>
              <Button variant="secondary" className="bg-white text-blue-600 hover:bg-white/90 font-semibold border-0">
                View Smart Schedule
              </Button>
            </div>

            {/* Custom Timer UI embedded in Hero */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl flex items-center gap-6 border border-white/20">
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
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid using Shadcn Cards */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={<Clock className="text-amber-500 h-5 w-5" />} title="Pending Tasks" value="2" subtext="Last 7 days" />
            <StatCard icon={<BrainCircuit className="text-indigo-500 h-5 w-5" />} title="Overdue Tasks" value="0" subtext="Last 7 days" />
            <StatCard icon={<CheckCircle className="text-green-500 h-5 w-5" />} title="Tasks Completed" value="8" subtext="Last 7 days" />
            <StatCard icon={<Flame className="text-red-500 h-5 w-5" />} title="Your Streak" value="3" subtext="Last 7 days" />
          </div>
          
        </div>
      </ScrollArea>

      {/* ========================================== */}
      {/* RIGHT COLUMN: CALENDAR & TIMELINE          */}
      {/* ========================================== */}
      <aside className="w-80 border-l bg-background hidden lg:flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Calendar</h3>
              <Badge variant="outline" className="cursor-pointer">Day ▾</Badge>
            </div>

            {/* Shadcn Native Calendar Component */}
            <div className="border rounded-md p-1 bg-card shadow-sm mb-6 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </div>

            {/* Daily Timeline */}
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">Calculus Exam Prep</span>
                  </div>
                  <div className="text-muted-foreground text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 10:00 AM
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm opacity-60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">History Essay</span>
                  </div>
                  <div className="text-muted-foreground text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 2:00 PM
                  </div>
                </div>
              </div>

            </div>
          </div>
        </ScrollArea>
      </aside>

    </div>
  );
}

// Helper component for the Stats Grid using Shadcn Cards
function StatCard({ icon, title, value, subtext }: { icon: React.ReactNode, title: string, value: string, subtext: string }) {
  return (
    <Card className="shadow-none border bg-card/50 hover:bg-card hover:shadow-sm transition-all">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground">
          {icon} {title}
        </div>
        <div className="text-4xl font-bold text-primary mb-1">{value}</div>
        <p className="text-xs text-muted-foreground font-medium">{subtext}</p>
      </CardContent>
    </Card>
  );
}