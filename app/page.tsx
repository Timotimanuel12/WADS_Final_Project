import Sidebar from "@/components/Sidebar";
import TaskCard from "@/components/TaskCard";
import { Zap, BrainCircuit, CheckCircle } from "lucide-react";

export default function Home() {
  // MOCK DATA: This simulates what your Database would send back
  const mockTasks = [
    { id: 1, title: "Calculus Final Exam Prep", subject: "Math 202", due: "Friday, 10:00 AM", priority: "HIGH" as const },
    { id: 2, title: "History Essay Draft", subject: "History 101", due: "Tomorrow, 11:59 PM", priority: "MEDIUM" as const },
    { id: 3, title: "Read Chapter 4-5", subject: "Physics", due: "Next Monday", priority: "LOW" as const },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      {/* 1. Sidebar Navigation */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="ml-64 flex-1 p-8">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Alex! 👋</h1>
            <p className="text-gray-500">You have 2 high-priority tasks pending.</p>
          </div>
          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
            + Add New Task
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <StatCard icon={<Zap className="text-yellow-500" />} label="Focus Score" value="84%" />
          <StatCard icon={<BrainCircuit className="text-indigo-500" />} label="Tasks AI Prioritized" value="12" />
          <StatCard icon={<CheckCircle className="text-green-500" />} label="Completed Today" value="3" />
        </div>

        {/* Task List Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Your Smart Schedule</h2>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              AI Optimized
            </span>
          </div>

          <div className="space-y-1">
            {mockTasks.map((task) => (
              <TaskCard 
                key={task.id}
                title={task.title}
                subject={task.subject}
                due={task.due}
                priority={task.priority}
              />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

// Simple Mini-Component for Stats
function StatCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-4">
      <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}