import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MoreHorizontal, CheckCircle, Circle, Play } from "lucide-react";

// This interface defines exactly what data an Activity needs
interface ActivityProps {
  title: string;
  category: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  type: string;
}

export default function ActivityCard({ title, category, status, priority, type }: ActivityProps) {
  const isCompleted = status === "Completed";
  const inProgress = status === "In Progress";

  return (
    <Card className={`transition-all hover:shadow-md ${isCompleted ? 'bg-muted/30 opacity-75' : 'bg-card'}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : inProgress ? (
              <Play className="w-5 h-5 text-indigo-500 fill-indigo-100" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            <Badge variant="outline" className="text-xs font-medium bg-background">
              {type}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        <h3 className={`font-semibold text-lg mb-1 leading-tight ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{category}</p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <Badge
            variant={priority === "Urgent" ? "destructive" : priority === "High" ? "default" : "secondary"}
          >
            {priority}
          </Badge>
          {!isCompleted && (
            <Button size="sm" variant={inProgress ? "default" : "secondary"} className={inProgress ? "bg-indigo-600 hover:bg-indigo-700" : ""}>
              {inProgress ? "Continue" : "Start"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}