"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Settings, ChevronLeft, ChevronRight, BrainCircuit, Clock } from "lucide-react";

export default function CalendarPage() {
  const events = [
    { id: 1, title: "Calculus Final Exam", type: "urgent", time: "10:00 AM", duration: "2h" },
    { id: 2, title: "History Essay Outline", type: "high", time: "2:00 PM", duration: "1.5h" },
    { id: 3, title: "Study Group: Physics", type: "low", time: "4:00 PM", duration: "1h" },
  ];

  return (
    <main className="flex-1 flex flex-col h-full bg-muted/5 w-full">
      <header className="px-8 py-6 border-b bg-background flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Schedule</h2>
          <p className="text-sm text-muted-foreground">Manage your AI-optimized timeline.</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 py-1 px-3">
            <BrainCircuit className="w-3 h-3 mr-2" /> AI Auto-Plan Active
          </Badge>
          <Button variant="outline" size="icon" className="rounded-full"><Settings className="h-4 w-4" /></Button>
          <Avatar className="cursor-pointer border">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">AL</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex-1 p-8 flex flex-col overflow-hidden">
        <Tabs defaultValue="week" className="flex-1 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold">February 2026</h3>
              <div className="flex items-center gap-1 bg-background border rounded-md p-1 shadow-sm">
                <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" className="h-7 px-3 text-xs font-medium">Today</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            <TabsList className="grid grid-cols-3 w-[300px] shadow-sm">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </div>

          <Card className="flex-1 overflow-hidden flex flex-col bg-background shadow-sm border">
            {/* MONTH VIEW */}
            <TabsContent value="month" className="m-0 flex-1 flex flex-col">
              <div className="grid grid-cols-7 border-b bg-muted/30">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2 text-center text-sm font-semibold text-muted-foreground border-r">{day}</div>
                ))}
              </div>
              <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-border gap-px">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="bg-background p-2 min-h-[100px] hover:bg-muted/10 transition-colors">
                    <span className={`text-sm font-medium ${i === 21 ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : 'text-muted-foreground'}`}>
                      {(i % 28) + 1}
                    </span>
                    {i === 21 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-[10px] font-bold bg-red-100 text-red-700 p-1 rounded truncate">10a Calc Exam</div>
                        <div className="text-[10px] font-bold bg-blue-100 text-blue-700 p-1 rounded truncate">2p History</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* WEEK VIEW */}
            <TabsContent value="week" className="m-0 flex-1 flex flex-col overflow-y-auto">
              <div className="grid grid-cols-8 border-b bg-muted/30 sticky top-0 z-10">
                <div className="py-3 border-r"></div>
                {['16 Mon', '17 Tue', '18 Wed', '19 Thu', '20 Fri', '21 Sat', '22 Sun'].map((day, i) => (
                  <div key={day} className={`py-3 text-center border-r ${i === 5 ? 'bg-primary/5' : ''}`}>
                    <span className={`text-sm font-semibold ${i === 5 ? 'text-primary' : 'text-muted-foreground'}`}>{day}</span>
                  </div>
                ))}
              </div>
              <div className="relative flex-1 grid grid-cols-8">
                <div className="border-r flex flex-col bg-background z-10">
                  {['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'].map(time => (
                    <div key={time} className="h-20 border-b text-xs text-muted-foreground text-right pr-2 pt-2">{time}</div>
                  ))}
                </div>
                <div className="col-span-7 grid grid-cols-7 bg-border gap-px">
                  {Array.from({ length: 7 }).map((_, colIndex) => (
                    <div key={colIndex} className={`bg-background relative ${colIndex === 5 ? 'bg-primary/[0.02]' : ''}`}>
                      {Array.from({ length: 8 }).map((_, rowIndex) => (
                        <div key={rowIndex} className="h-20 border-b border-dashed border-muted"></div>
                      ))}
                      {colIndex === 5 && (
                        <>
                          <div className="absolute top-[80px] left-1 right-1 h-[155px] bg-red-50 border border-red-200 rounded-md p-2 shadow-sm z-20 overflow-hidden">
                            <p className="text-xs font-bold text-red-700 mb-1">Calculus Exam Prep</p>
                            <p className="text-[10px] text-red-600/80 flex items-center"><Clock className="w-3 h-3 mr-1"/> 10am-12pm</p>
                          </div>
                          <div className="absolute top-[400px] left-1 right-1 h-[75px] bg-blue-50 border border-blue-200 rounded-md p-2 shadow-sm z-20 overflow-hidden">
                            <p className="text-xs font-bold text-blue-700 mb-1">History Essay</p>
                            <p className="text-[10px] text-blue-600/80 flex items-center"><Clock className="w-3 h-3 mr-1"/> 2pm-3pm</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* DAY VIEW */}
            <TabsContent value="day" className="m-0 flex-1 flex flex-col overflow-y-auto bg-background p-6">
              <h3 className="text-2xl font-bold mb-6 text-foreground">Saturday, Feb 21</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-12 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                {events.map((event) => (
                  <div key={event.id} className="relative flex items-start gap-6 group">
                    <div className="w-16 text-right pt-1">
                      <span className="text-xs font-bold text-muted-foreground">{event.time}</span>
                    </div>
                    <div className={`w-3 h-3 mt-1.5 rounded-full border-2 bg-background z-10 ${
                      event.type === 'urgent' ? 'border-red-500' : 
                      event.type === 'high' ? 'border-blue-500' : 'border-green-500'
                    }`} />
                    <div className={`flex-1 p-4 rounded-xl border shadow-sm ${
                      event.type === 'urgent' ? 'bg-red-50/50 border-red-100' : 
                      event.type === 'high' ? 'bg-blue-50/50 border-blue-100' : 'bg-green-50/50 border-green-100'
                    }`}>
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {event.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Card>
        </Tabs>
      </div>
    </main>
  );
}