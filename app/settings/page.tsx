"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { Home, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
    const [fullName, setFullName] = useState("");
    const [heightCm, setHeightCm] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData.session?.user.id;

            if (!userId) return;

            const { data } = await supabase
                .from("profiles")
                .select("full_name, height_cm")
                .eq("id", userId)
                .maybeSingle();

            setFullName(data?.full_name ?? "");
            setHeightCm(data?.height_cm ? String(data.height_cm) : "");
        };

        fetchProfile();
    }, []);

    const saveProfile = async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;

        if (!userId) return;

        const { error } = await supabase.from("profiles").upsert({
            id: userId,
            full_name: fullName.trim() || "User",
            height_cm: heightCm ? Number(heightCm) : null,
        });

        if (error) {
            alert(error.message);
            return;
        }

        alert("Profile saved ♡");
    };
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

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                <p className="text-lg font-black text-rose-950">Profile</p>
                <p className="text-sm font-semibold text-rose-500">
                    Used for dashboard welcome and fitness stats
                </p>

                <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your name"
                    className="mt-5 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                />

                <input
                    type="number"
                    value={heightCm}
                    onChange={(event) => setHeightCm(event.target.value)}
                    placeholder="Height in cm"
                    className="mt-3 w-full rounded-2xl bg-purple-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                />

                <button
                    onClick={saveProfile}
                    className="mt-5 w-full rounded-full bg-pink-500 px-6 py-4 font-black text-white"
                >
                    Save profile ♡
                </button>
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