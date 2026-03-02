"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-background rounded-xl shadow-lg border p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                </button>

                <h2 className="text-xl font-semibold mb-6">Add New Task</h2>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input id="title" placeholder="e.g., Read Chapter 5" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject / Course</Label>
                        <Input id="subject" placeholder="e.g., Biology 101" />
                    </div>

                    <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select defaultValue="medium">
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <div className="border rounded-md p-2 bg-card/50">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onClose}>
                        Save Task
                    </Button>
                </div>
            </div>
        </div>
    );
}
