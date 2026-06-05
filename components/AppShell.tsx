"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import DesktopNav from "@/components/DesktopNav";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";

function LoadingScreen() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-pink-100 bg-white/85 p-8 text-center shadow-[0_10px_30px_rgba(244,114,182,0.15)] dark:border-pink-900/60 dark:bg-[#21131d]/90">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
          MacroBudget
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <span className="h-3 w-3 animate-bounce rounded-full bg-pink-300 [animation-delay:-0.3s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-rose-300 [animation-delay:-0.15s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-purple-300" />
        </div>

        <p className="mt-6 text-3xl font-black text-pink-500">
          {t.auth.loadingTitle}
        </p>

        <p className="mt-3 font-semibold text-rose-500">
          {t.auth.loadingBody}
        </p>
      </div>
    </main>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      setLoading(true);

      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 4000)
        ),
      ]);

      if (!active) return;

      const hasSession = Boolean(sessionResult.data.session);
      setIsAuthenticated(hasSession);
      setLoading(false);

      if (!hasSession && pathname !== "/login") {
        router.replace("/login");
      }

      if (hasSession && pathname === "/login") {
        router.replace("/dashboard");
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      const hasSession = Boolean(session);
      setIsAuthenticated(hasSession);

      if (!hasSession && pathname !== "/login") {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffe4ef,transparent_35%),radial-gradient(circle_at_top_right,#f3e8ff,transparent_30%),linear-gradient(#fff7fb,#fff)] dark:bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(#160b14,#120912)]">
        <LoadingScreen />
      </div>
    );
  }

  if (!isAuthenticated || pathname === "/login") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffe4ef,transparent_35%),radial-gradient(circle_at_top_right,#f3e8ff,transparent_30%),linear-gradient(#fff7fb,#fff)] dark:bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(#160b14,#120912)]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffe4ef,transparent_35%),radial-gradient(circle_at_top_right,#f3e8ff,transparent_30%),linear-gradient(#fff7fb,#fff)] pb-24 dark:bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(#160b14,#120912)] md:pb-0">
      <nav className="sticky top-0 z-50 border-b border-pink-100 bg-white/70 backdrop-blur-md dark:border-pink-900/60 dark:bg-[#21131d]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-4">
          <Link
            href="/dashboard"
            className="text-xl font-black text-pink-500 drop-shadow-sm sm:text-2xl"
          >
            MacroBudget ♡
          </Link>

          <DesktopNav />

          <Link
            href="/settings"
            className="flex h-11 w-11 items-center justify-center rounded-full text-rose-700 transition hover:bg-pink-100 md:hidden dark:text-pink-100 dark:hover:bg-pink-950/40"
            aria-label={t.nav.settings}
          >
            <Settings size={22} />
          </Link>
        </div>
      </nav>

      {children}
      <MobileBottomNav />
    </div>
  );
}
