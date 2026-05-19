"use client";

import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
      className="rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
    >
      Logout
    </button>
  );
}