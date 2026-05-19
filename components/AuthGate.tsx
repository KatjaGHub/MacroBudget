"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname === "/login") {
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        window.location.href = "/login";
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [pathname]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-rose-700 font-black">
        Loading ♡
      </main>
    );
  }

  return <>{children}</>;
}