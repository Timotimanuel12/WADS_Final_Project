"use client";

import { useState } from "react";
import ActivityCard from "@/components/ActivityCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter, SortDesc } from "lucide-react";

export default function ActivitiesPage() {
  const [filter, setFilter] = useState("All");

  // I populated this with a variety of activity types to test the UI layout
  const mockActivities = [
    { id: 1, title: "Implement Zoom & Orbit Trails", category: "Pygame Simulation", status: "In Progress", priority: "Medium" as const, type: "Project" },
    { id: 2, title: "LLM & Toxoplasma Gondii Data Analysis", category: "Research", status: "Pending", priority: "High" as const, type: "Academic" },
    { id: 3, title: "Update Housing Website Frontend", category: "UrbanLink", status: "In Progress", priority: "Urgent" as const, type: "Work" },
    { id: 4, title: "Math Tutoring Session", category: "Tutoring", status: "Completed", priority: "Medium" as const, type: "Work" },
    { id: 5, title: "Calculus Final Exam Prep", category: "Math 202", status: "Pending", priority: "Urgent" as const, type: "Academic" },
    { id: 6, title: "Draft PawPal Presentation Slides", category: "PawPal", status: "Pending", priority: "Medium" as const, type: "Project" }
  ];

  const filteredActivities = mockActivities.filter(activity => {
    if (filter === "All") return true;
    return activity.status === filter;
  });

  return (
    <main className="flex-1 flex flex-col h-full bg-muted/5 overflow-y-auto w-full">
      {/* Header */}
      <header className="px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-background">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Activities</h1>
          <p className="text-muted-foreground mt-1">Manage your academic, work, and personal projects.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
          <Plus className="w-4 h-4 mr-2" /> New Activity
        </Button>
      </header>

      {/* Controls & Grid */}
      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-background p-2 rounded-lg border shadow-sm">
          <Tabs defaultValue="All" className="w-full sm:w-auto" onValueChange={setFilter}>
            <TabsList className="grid w-full grid-cols-4 sm:w-[400px]">
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="In Progress">Active</TabsTrigger>
              <TabsTrigger value="Completed">Done</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <SortDesc className="w-4 h-4 mr-2" /> Sort
            </Button>
          </div>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              title={activity.title}
              category={activity.category}
              status={activity.status as any}
              priority={activity.priority}
              type={activity.type}
            />
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No activities found for this filter.
          </div>
        )}

      </div>
    </main>
  );
}