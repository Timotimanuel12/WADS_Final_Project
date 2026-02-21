"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, Calendar as CalendarIcon, ListTodo, Timer, 
  Plus, Moon, HelpCircle, BrainCircuit, LogOut
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/10 hidden md:flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">F</div>
        <h1 className="text-xl font-bold tracking-tight">FocusFlow</h1>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1 mb-6">
          <Button 
            variant={pathname === '/dashboard' ? 'secondary' : 'ghost'} 
            className="w-full justify-start font-semibold"
            onClick={() => router.push('/dashboard')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </Button>
          <Button 
            variant={pathname === '/calendar' ? 'secondary' : 'ghost'} 
            className="w-full justify-start font-semibold"
            onClick={() => router.push('/calendar')}
          >
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
        <Button variant="ghost" className="w-full justify-start text-muted-foreground">
          <Moon className="mr-2 h-4 w-4" /> Dark Mode
        </Button>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => router.push('/')}>
          <LogOut className="mr-2 h-4 w-4" /> Log Out
        </Button>
      </div>
    </aside>
  );
}