"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Play, Pause, RotateCcw, CheckCircle, Timer, Settings,
  History, Coffee, Brain, Loader2, Volume2, VolumeX, Music, Headphones,
} from "lucide-react";
import { profileApi, tasksApi, sessionsApi, type Task, type FocusSessionRecord } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

// ─── Mode config ──────────────────────────────────────────────────────────────
type Mode = "focus" | "short" | "long";

const MODE_CONFIG: Record<Mode, { label: string; minutes: number; color: string }> = {
  focus: { label: "Focus", minutes: 25, color: "text-blue-500" },
  short: { label: "Short Break", minutes: 5, color: "text-green-500" },
  long: { label: "Long Break", minutes: 15, color: "text-indigo-400" },
};

// ─── Study music tracks ───────────────────────────────────────────────────────
const MUSIC_TRACKS = [
  { id: "jfKfPfyJRdk", label: "Lofi Hip Hop Radio (Lofi Girl)" },
  { id: "qYnA9wWFHLI", label: "Deep Focus — Ambient Study Music" },
  { id: "4oStw0r33so", label: "Classical Piano for Studying" },
  { id: "h2zkV-l_more", label: "Jazz Coffee Shop Ambience" },
  { id: "WPni755-Krg", label: "Binaural Beats — Focus 40Hz" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
  }
  return email?.trim()[0]?.toUpperCase() ?? "U";
}

// ─── Web Audio noise generator hook ──────────────────────────────────────────
type NoiseType = "white" | "brown";

function useNoise() {
  const ctxRef = React.useRef<AudioContext | null>(null);
  const sourceRef = React.useRef<ScriptProcessorNode | null>(null);
  const gainRef = React.useRef<GainNode | null>(null);
  const [active, setActive] = React.useState<NoiseType | null>(null);

  const stop = React.useCallback(() => {
    sourceRef.current?.disconnect();
    gainRef.current?.disconnect();
    sourceRef.current = null;
    gainRef.current = null;
    setActive(null);
  }, []);

  const toggle = React.useCallback((type: NoiseType) => {
    if (active === type) { stop(); return; }
    stop();

    const ctx = ctxRef.current ?? new AudioContext();
    ctxRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();

    const bufferSize = 4096;
    const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
    const gain = ctx.createGain();

    if (type === "white") {
      gain.gain.value = 0.04;
      processor.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) out[i] = Math.random() * 2 - 1;
      };
    } else {
      // Brown noise: integrate white noise
      gain.gain.value = 0.25;
      let last = 0;
      processor.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.02 * white) / 1.02;
          out[i] = last * 3.5;
        }
      };
    }

    processor.connect(gain);
    gain.connect(ctx.destination);
    sourceRef.current = processor;
    gainRef.current = gain;
    setActive(type);
  }, [active, stop]);

  // Cleanup on unmount
  React.useEffect(() => () => { stop(); ctxRef.current?.close(); }, [stop]);

  return { active, toggle, stop };
}

// ─── Sounds panel ─────────────────────────────────────────────────────────────
function SoundsPanel() {
  const noise = useNoise();
  const [musicTrackId, setMusicTrackId] = React.useState(MUSIC_TRACKS[0].id);
  const [musicPlaying, setMusicPlaying] = React.useState(false);

  function toggleMusic() {
    setMusicPlaying((p) => !p);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1.5">
        <Music className="h-3.5 w-3.5" /> Sounds
      </p>

      {/* White noise */}
      <button
        onClick={() => noise.toggle("white")}
        className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors flex items-center gap-2
          ${noise.active === "white"
            ? "border-blue-400 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium"
            : "border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground"}`}
      >
        {noise.active === "white"
          ? <Volume2 className="h-4 w-4 shrink-0 text-blue-500" />
          : <VolumeX className="h-4 w-4 shrink-0" />}
        <span>Activate white noise</span>
        {noise.active === "white" && (
          <Badge className="ml-auto text-[10px] px-1.5 py-0 bg-blue-500">ON</Badge>
        )}
      </button>

      {/* Brown noise (Headphones Recommended) */}
      <button
        onClick={() => noise.toggle("brown")}
        className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors flex items-center gap-2
          ${noise.active === "brown"
            ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium"
            : "border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground"}`}
      >
        <Headphones className="h-4 w-4 shrink-0" />
        <span>Headphones Recommended</span>
        {noise.active === "brown" && (
          <Badge className="ml-auto text-[10px] px-1.5 py-0 bg-indigo-500">ON</Badge>
        )}
      </button>

      {/* Music */}
      <div className="space-y-2 pt-1">
        <select
          value={musicTrackId}
          onChange={(e) => {
            setMusicTrackId(e.target.value);
            setMusicPlaying(false); // reset on track change
          }}
          className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {MUSIC_TRACKS.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>

        <button
          onClick={toggleMusic}
          className={`w-full px-3 py-2.5 rounded-lg border text-sm transition-colors flex items-center gap-2
            ${musicPlaying
              ? "border-green-400 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 font-medium"
              : "border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground"}`}
        >
          {musicPlaying
            ? <Pause className="h-4 w-4 shrink-0 fill-current" />
            : <Play className="h-4 w-4 shrink-0 fill-current" />}
          <span>{musicPlaying ? "Stop music" : "Play study music"}</span>
          {musicPlaying && (
            <Badge className="ml-auto text-[10px] px-1.5 py-0 bg-green-500">LIVE</Badge>
          )}
        </button>

        {/* music iframe*/}
        {musicPlaying && (
          <iframe
            key={musicTrackId}
            src={`https://www.youtube.com/embed/${musicTrackId}?autoplay=1&controls=0`}
            allow="autoplay"
            className="hidden"
            title="Study music player"
          />
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FocusTimerPage() {
  const router = useRouter();

  // ── Auth state ──
  const [displayName, setDisplayName] = React.useState("there");
  const [profilePhotoUrl, setProfilePhotoUrl] = React.useState<string | null>(null);
  const [profileInitials, setProfileInitials] = React.useState("U");

  // ── Tasks ──
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = React.useState(true);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);

  // ── Timer ──
  const [mode, setMode] = React.useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = React.useState(MODE_CONFIG.focus.minutes * 60);
  const [running, setRunning] = React.useState(false);
  const startedAtRef = React.useRef<string | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Sessions ──
  const [sessions, setSessions] = React.useState<FocusSessionRecord[]>([]);
  const [toast, setToast] = React.useState<{ msg: string; ok: boolean } | null>(null);

  // ── Load auth ──
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const n = user?.displayName?.trim() || "there";
      setDisplayName(n.split(" ")[0] || "there");
      setProfileInitials(getInitials(user?.displayName, user?.email));
      if (!user) { setProfilePhotoUrl(null); return; }
      try {
        const profile = await profileApi.get();
        setProfilePhotoUrl(profile.profilePhotoUrl ?? user.photoURL ?? null);
      } catch {
        setProfilePhotoUrl(user.photoURL ?? null);
      }
    });
    return unsub;
  }, []);

  // ── Load tasks ──
  React.useEffect(() => {
    tasksApi.list()
      .then((data) => setTasks(data.filter((t) => t.status !== "completed")))
      .catch(() => { })
      .finally(() => setLoadingTasks(false));
  }, []);

  // ── Load sessions history ──
  React.useEffect(() => {
    sessionsApi.list().then(setSessions).catch(() => { });
  }, []);

  // ── Timer countdown ──
  React.useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function switchMode(next: Mode) {
    if (running) { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false); }
    setMode(next);
    setSecondsLeft(MODE_CONFIG[next].minutes * 60);
    startedAtRef.current = null;
  }

  function handleStart() {
    if (!running) {
      if (!startedAtRef.current) startedAtRef.current = new Date().toISOString();
      setRunning(true);
    }
  }

  function handlePause() { setRunning(false); }

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(MODE_CONFIG[mode].minutes * 60);
    startedAtRef.current = null;
  }

  async function handleTimerComplete() {
    if (mode !== "focus") { showToast("Break over! Time to focus.", true); return; }
    const completedAt = new Date().toISOString();
    const startedAt = startedAtRef.current ?? completedAt;
    const durationMinutes = MODE_CONFIG[mode].minutes;
    try {
      const saved = await sessionsApi.create({ taskId: selectedTaskId ?? undefined, durationMinutes, startedAt, completedAt });
      setSessions((prev) => [saved, ...prev]);
      showToast(`Focus session complete! ${durationMinutes} min logged.`, true);
    } catch {
      showToast("Session complete — couldn't save to history.", false);
    }
    startedAtRef.current = null;
  }

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  // ── SVG ring ──
  const totalSeconds = MODE_CONFIG[mode].minutes * 60;
  const RADIUS = 88;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - secondsLeft / totalSeconds);
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <div className="flex flex-col h-full bg-muted/5">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Focus Timer</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.push("/settings")} title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
          <Avatar
            className="cursor-pointer border ml-1"
            role="button"
            tabIndex={0}
            onClick={() => router.push("/settings")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push("/settings"); } }}
            aria-label="Open profile settings"
          >
            <AvatarImage src={profilePhotoUrl ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{profileInitials}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Two-column body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT — timer */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8">

          {/* Mode tabs */}
          <div className="flex gap-2">
            {(["focus", "short", "long"] as Mode[]).map((m) => (
              <Button key={m} variant={mode === m ? "default" : "outline"} size="sm" onClick={() => switchMode(m)}>
                {m === "focus" ? <Brain className="mr-1.5 h-3.5 w-3.5" /> : <Coffee className="mr-1.5 h-3.5 w-3.5" />}
                {MODE_CONFIG[m].label}
              </Button>
            ))}
          </div>

          {/* Ring */}
          <div className="relative flex items-center justify-center">
            <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
              <circle cx="110" cy="110" r={RADIUS} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
              <circle
                cx="110" cy="110" r={RADIUS} stroke="currentColor" strokeWidth="8" fill="transparent"
                strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${MODE_CONFIG[mode].color}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center select-none">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                {MODE_CONFIG[mode].label}
              </span>
              <span className="text-5xl font-bold tabular-nums tracking-tight">{fmt(secondsLeft)}</span>
              {selectedTask && (
                <span className="text-xs text-muted-foreground mt-1.5 max-w-[140px] truncate text-center">
                  {selectedTask.title}
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full w-11 h-11" onClick={handleReset} title="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
            {running ? (
              <Button size="lg" className="rounded-full w-16 h-16 shadow-md" onClick={handlePause} title="Pause">
                <Pause className="fill-current h-6 w-6" />
              </Button>
            ) : (
              <Button size="lg" className="rounded-full w-16 h-16 shadow-md" onClick={handleStart} title="Start">
                <Play className="fill-current h-6 w-6 ml-1" />
              </Button>
            )}
            <div className="w-11 h-11" />
          </div>

          <p className="text-sm text-muted-foreground">
            {running
              ? mode === "focus" ? "Stay focused. You've got this." : "Take a breather."
              : secondsLeft === 0 ? "Session complete!" : "Press play to start."}
          </p>
        </div>

        {/* RIGHT — sidebar */}
        <div className="w-80 border-l bg-background flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">

              {/* Task selector */}
              {mode === "focus" && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                    Focusing on
                  </p>
                  {loadingTasks ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm p-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading tasks…
                    </div>
                  ) : tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-1">No pending tasks found.</p>
                  ) : (
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedTaskId(null)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${selectedTaskId === null ? "border-primary bg-primary/5 font-medium" : "border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground"}`}
                      >
                        None — free session
                      </button>
                      {tasks.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${selectedTaskId === t.id ? "border-primary bg-primary/5 font-medium" : "border-transparent hover:border-border hover:bg-muted/50"}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{t.title}</span>
                            <Badge variant={t.priority === "urgent" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0 shrink-0">
                              {t.priority}
                            </Badge>
                          </div>
                          {(t.course || t.category) && (
                            <span className="text-xs text-muted-foreground mt-0.5 block">
                              {[t.course, t.category].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Sounds ── */}
              <div className="border-t pt-4">
                <SoundsPanel />
              </div>

              {/* Session History */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" /> Session History
                </p>
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-1 py-3 text-center">
                    Complete a session to see it here.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {sessions.map((s) => {
                      const linkedTask = tasks.find((t) => t.id === s.taskId);
                      return (
                        <div key={s.id} className="px-3 py-2.5 rounded-lg bg-muted/40 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            <span className="font-medium">{s.durationMinutes} min</span>
                            {linkedTask && (
                              <span className="text-muted-foreground truncate text-xs ml-0.5">
                                — {linkedTask.title}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 pl-5">
                            {new Date(s.completedAt).toLocaleString([], {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${toast.ok ? "bg-green-600" : "bg-amber-600"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
