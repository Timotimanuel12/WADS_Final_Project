"use client";

import { Button } from "@/components/ui/button";
import { BrainCircuit, Calendar, LayoutDashboard, ListTodo, Settings, MessageCircle, Timer } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "AI Plan", href: "/ai-plan", icon: BrainCircuit },
  { label: "AI Chat", href: "/ai-chat", icon: MessageCircle },
  { label: "Activities", href: "/activities", icon: ListTodo },
  { label: "Timer", href: "/focus-timer", icon: Timer },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="flex overflow-x-auto gap-1 p-2 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Button
              key={item.href}
              variant={active ? "secondary" : "ghost"}
              className="h-12 min-w-[72px] shrink-0 flex-col gap-1 text-[10px] px-1"
              onClick={() => router.push(item.href)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate w-full text-center">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
