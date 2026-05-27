"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        router.replace("/login");
      }}
      className="rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
    >
      Logout
    </button>
  );
}
