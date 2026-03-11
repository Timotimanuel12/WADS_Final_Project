"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle, Circle, Play, Trash2, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActivityProps {
  id: string;
  title: string;
  category: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  type: string;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: "Pending" | "In Progress" | "Completed") => void;
  onEdit?: (id: string) => void;
}

export default function ActivityCard({
  id, title, category, description, startTime, endTime, status, priority, type,
  onDelete, onStatusChange, onEdit,
}: ActivityProps) {
  const [busy, setBusy] = useState(false);
  const isCompleted = status === "Completed";
  const inProgress = status === "In Progress";

  async function handleStatusToggle() {
    if (!onStatusChange) return;
    setBusy(true);
    const next = isCompleted ? "Pending" : inProgress ? "Completed" : "In Progress";
    await onStatusChange(id, next);
    setBusy(false);
  }

  async function handleDelete() {
    if (!onDelete) return;
    setBusy(true);
    await onDelete(id);
    setBusy(false);
  }

  return (
    <Card className={`transition-all hover:shadow-md ${isCompleted ? 'bg-muted/30 opacity-75' : 'bg-card'}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <button onClick={handleStatusToggle} disabled={busy} className="focus:outline-none" title="Toggle status">
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : inProgress ? (
                <Play className="w-5 h-5 text-indigo-500 fill-indigo-100" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <Badge variant="outline" className="text-xs font-medium bg-background">
              {type}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(id)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className={`font-semibold text-lg mb-1 leading-tight ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{category}</p>
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <div className="flex flex-col gap-2">
            <Badge
              variant={priority === "Urgent" ? "destructive" : priority === "High" ? "default" : "secondary"}
              className="w-fit"
            >
              {priority}
            </Badge>
            {startTime && (
              <span className="text-xs text-muted-foreground">
                {new Date(startTime).toLocaleDateString()} {new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {endTime ? ` - ${new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
              </span>
            )}
          </div>
          {!isCompleted && (
            <Button
              size="sm"
              variant={inProgress ? "default" : "secondary"}
              className={inProgress ? "bg-indigo-600 hover:bg-indigo-700" : ""}
              disabled={busy}
              onClick={handleStatusToggle}
            >
              {inProgress ? "Complete" : "Start"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}