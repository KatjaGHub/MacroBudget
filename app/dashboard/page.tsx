"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      setName(data.full_name);
    };

    fetchProfile();
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <section className="rounded-[2rem] border border-pink-100 bg-white/80 p-8 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
          dashboard
        </p>

        <h1 className="mt-2 text-5xl font-black text-pink-500">
          Welcome, {name} ♡
        </h1>

        <p className="mt-3 text-lg font-semibold text-rose-600">
          Ready to plan meals and save money?
        </p>
      </section>
    </main>
  );
}