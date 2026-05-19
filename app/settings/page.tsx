import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { Home, LogOut } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <section className="rounded-[2rem] border border-pink-100 bg-white/80 p-8 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
          account
        </p>

        <h1 className="mt-2 text-5xl font-black text-pink-500">
          Settings ♡
        </h1>

        <p className="mt-3 text-rose-700">
          Manage your account and shared household.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <Link
          href="/household"
          className="flex items-center justify-between rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] transition hover:bg-pink-50"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-pink-100 p-3 text-pink-500">
              <Home size={22} />
            </div>

            <div>
              <p className="text-lg font-black text-rose-950">Household</p>
              <p className="text-sm font-semibold text-rose-500">
                Invite or join your shared space
              </p>
            </div>
          </div>

          <span className="text-pink-400">→</span>
        </Link>

        <div className="flex items-center justify-between rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-rose-100 p-3 text-rose-500">
              <LogOut size={22} />
            </div>

            <div>
              <p className="text-lg font-black text-rose-950">Logout</p>
              <p className="text-sm font-semibold text-rose-500">
                Sign out of MacroBudget
              </p>
            </div>
          </div>

          <LogoutButton />
        </div>
      </section>
    </main>
  );
}