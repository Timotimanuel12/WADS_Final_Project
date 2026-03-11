"use client";

import { Button } from "@/components/ui/button";
import { Calendar, LayoutDashboard, ListTodo, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Activities", href: "/activities", icon: ListTodo },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="grid grid-cols-4 gap-1 p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Button
              key={item.href}
              variant={active ? "secondary" : "ghost"}
              className="h-12 flex-col gap-1 text-[11px]"
              onClick={() => router.push(item.href)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
