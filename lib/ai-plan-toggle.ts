const AI_PLAN_STORAGE_KEY = "helpimtoolazy.aiAutoPlanEnabled";
const AI_PLAN_EVENT = "ai-auto-plan-changed";

export function getAiPlanEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AI_PLAN_STORAGE_KEY) === "true";
}

export function setAiPlanEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(AI_PLAN_STORAGE_KEY, enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent<boolean>(AI_PLAN_EVENT, { detail: enabled }));
}

export function subscribeAiPlanEnabled(onChange: (enabled: boolean) => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== AI_PLAN_STORAGE_KEY) return;
    onChange(event.newValue === "true");
  };

  const handleCustom = (event: Event) => {
    const customEvent = event as CustomEvent<boolean>;
    onChange(Boolean(customEvent.detail));
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AI_PLAN_EVENT, handleCustom as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AI_PLAN_EVENT, handleCustom as EventListener);
  };
}
