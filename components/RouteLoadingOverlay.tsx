"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const LOADER_DELAY_MS = 350;

export default function RouteLoadingOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    setVisible(true);

    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
    }

    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
    }, LOADER_DELAY_MS);

    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 text-indigo-700 font-semibold">
        <span className="inline-block h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        Loading...
      </div>
    </div>
  );
}
