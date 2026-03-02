"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, RotateCcw, Coffee, Ban } from "lucide-react";

export default function FocusTimerPage() {
    const [timeLeft, setTimeLeft] = React.useState(25 * 60); // 25 minutes in seconds
    const [isActive, setIsActive] = React.useState(false);
    const [mode, setMode] = React.useState<"focus" | "break">("focus");

    React.useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Optional: Play a sound when timer finishes
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
    };

    const switchMode = (newMode: "focus" | "break") => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(newMode === "focus" ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Calculate percentage for circular progress
    const totalTime = mode === "focus" ? 25 * 60 : 5 * 60;
    const percentage = (timeLeft / totalTime) * 100;
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <ScrollArea className="flex-1 bg-muted/5">
            <div className="p-8 max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">

                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Focus Timer</h1>
                    <p className="text-muted-foreground">Boost your productivity with the Pomodoro Technique.</p>
                </div>

                <Card className="w-full max-w-md border-2 shadow-sm">
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center gap-2 mb-4">
                            <Button
                                variant={mode === "focus" ? "default" : "outline"}
                                onClick={() => switchMode("focus")}
                                className="rounded-full px-6"
                            >
                                <Ban className="w-4 h-4 mr-2" /> Focus (25m)
                            </Button>
                            <Button
                                variant={mode === "break" ? "secondary" : "outline"}
                                onClick={() => switchMode("break")}
                                className="rounded-full px-6 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                            >
                                <Coffee className="w-4 h-4 mr-2" /> Break (5m)
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center pt-6 pb-10">

                        {/* Circular Timer Display */}
                        <div className="relative flex items-center justify-center w-72 h-72 mb-8">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="144" cy="144" r={radius}
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-muted/30"
                                />
                                <circle
                                    cx="144" cy="144" r={radius}
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    className={`transition-all duration-1000 ease-linear ${mode === 'focus' ? 'text-primary' : 'text-emerald-500'}`}
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-6xl font-bold tabular-nums tracking-tighter">
                                    {formatTime(timeLeft)}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">
                                    {mode === 'focus' ? 'Focusing' : 'Relaxing'}
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            <Button
                                size="lg"
                                onClick={toggleTimer}
                                className={`w-32 h-14 text-lg rounded-full shadow-md ${isActive ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                            >
                                {isActive ? (
                                    <><Pause className="mr-2 h-5 w-5 fill-current" /> Pause</>
                                ) : (
                                    <><Play className="mr-2 h-5 w-5 fill-current" /> Start</>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={resetTimer}
                                className="h-14 w-14 rounded-full"
                                title="Reset Timer"
                            >
                                <RotateCcw className="h-6 w-6 text-muted-foreground" />
                            </Button>
                        </div>

                    </CardContent>
                </Card>

            </div>
        </ScrollArea>
    );
}
