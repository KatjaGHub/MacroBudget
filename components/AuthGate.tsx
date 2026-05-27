"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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
        router.replace("/login");
        return;
      }

      setLoading(false);
    };

    checkUser();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-rose-700 font-black">
        Loading ♡
      </main>
    );
  }

  return <>{children}</>;
}
