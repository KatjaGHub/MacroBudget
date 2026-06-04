"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      setLoading(true);

      if (pathname === "/login") {
        if (active) setLoading(false);
        return;
      }

      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>((resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 4000)
          ),
        ]);

        if (!active) return;

        if (!sessionResult.data.session) {
          setLoading(false);
          window.location.replace("/login");
          return;
        }

        setLoading(false);
      } catch {
        if (!active) return;

        setLoading(false);
        window.location.replace("/login");
      }
    };

    checkUser();

    return () => {
      active = false;
    };
  }, [pathname]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[2rem] border border-pink-100 bg-white/85 p-8 text-center shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
            MacroBudget
          </p>

          <div className="mt-6 flex justify-center gap-2">
            <span className="h-3 w-3 rounded-full bg-pink-300 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-3 w-3 rounded-full bg-rose-300 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-3 w-3 rounded-full bg-purple-300 animate-bounce" />
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

  return <>{children}</>;
}
