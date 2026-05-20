"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      setLoading(true);

      if (pathname === "/login") {
        if (active) setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!active) return;

      if (!data.session) {
        setLoading(false);
        window.location.href = "/login";
        return;
      }

      setLoading(false);
    };

    checkUser();

    const handlePageShow = () => {
      checkUser();
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      active = false;
      window.removeEventListener("pageshow", handlePageShow);
    };
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