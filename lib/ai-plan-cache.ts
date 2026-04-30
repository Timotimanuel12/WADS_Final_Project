import type { AIPrioritizeItem } from "@/lib/api-client";

const AI_PLAN_CACHE_KEY = "helpimtoolazy.aiPrioritizeCache.v1";
const AI_PLAN_VIEW_CACHE_KEY = "helpimtoolazy.aiPlanViewCache.v1";
const AI_PLAN_CACHE_EVENT = "ai-prioritize-cache-changed";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

type CachedAiPlan = {
  savedAt: number;
  recommendations: AIPrioritizeItem[];
};

export type CachedAiPlanViewItem = {
  taskId: string;
  rank: number;
  reason: string;
  suggestedStartIso: string;
  suggestedEndIso: string;
};

type CachedAiPlanView = {
  savedAt: number;
  items: CachedAiPlanViewItem[];
};

export function saveCachedAiPlan(recommendations: AIPrioritizeItem[]) {
  if (typeof window === "undefined") return;

  const payload: CachedAiPlan = {
    savedAt: Date.now(),
    recommendations,
  };

  window.localStorage.setItem(AI_PLAN_CACHE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(AI_PLAN_CACHE_EVENT));
}

export function getCachedAiPlan(): AIPrioritizeItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(AI_PLAN_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as CachedAiPlan;
    if (!parsed?.savedAt || !Array.isArray(parsed.recommendations)) {
      return [];
    }

    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      window.localStorage.removeItem(AI_PLAN_CACHE_KEY);
      return [];
    }

    return parsed.recommendations;
  } catch {
    return [];
  }
}

export function saveCachedAiPlanView(items: CachedAiPlanViewItem[]) {
  if (typeof window === "undefined") return;

  const payload: CachedAiPlanView = {
    savedAt: Date.now(),
    items,
  };

  window.localStorage.setItem(AI_PLAN_VIEW_CACHE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(AI_PLAN_CACHE_EVENT));
}

export function getCachedAiPlanView(): CachedAiPlanViewItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(AI_PLAN_VIEW_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as CachedAiPlanView;
    if (!parsed?.savedAt || !Array.isArray(parsed.items)) {
      return [];
    }

    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      window.localStorage.removeItem(AI_PLAN_VIEW_CACHE_KEY);
      return [];
    }

    return parsed.items;
  } catch {
    return [];
  }
}

export function subscribeCachedAiPlan(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === AI_PLAN_CACHE_KEY || event.key === AI_PLAN_VIEW_CACHE_KEY) onChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AI_PLAN_CACHE_EVENT, onChange as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AI_PLAN_CACHE_EVENT, onChange as EventListener);
  };
}
