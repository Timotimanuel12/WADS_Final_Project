"use client";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        const next = encodeURIComponent(pathname || "/dashboard");
        router.replace(`/login?next=${next}`);
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (checkingAuth) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-indigo-700 font-semibold">
          <span className="inline-block h-5 w-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          Checking session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
