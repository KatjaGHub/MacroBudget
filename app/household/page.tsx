"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Household = {
    id: number;
    name: string;
    invite_code: string;
};

function makeInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function HouseholdPage() {
    const [household, setHousehold] = useState<Household | null>(null);
    const [inviteCode, setInviteCode] = useState("");
    const [loading, setLoading] = useState(true);
    const hasCheckedHousehold = useRef(false);

    useEffect(() => {
        if (hasCheckedHousehold.current) return;
        hasCheckedHousehold.current = true;
        const fetchOrCreateHousehold = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData.session?.user.id;

            if (!userId) {
                setLoading(false);
                return;
            }

            const { data: existingMemberships } = await supabase
                .from("household_members")
                .select(
                    `
    households (
      id,
      name,
      invite_code
    )
  `
                )
                .eq("user_id", userId)
                .limit(1);

            const existingMembership = existingMemberships?.[0];

            if (existingMembership?.households) {
                setHousehold(existingMembership.households as Household);
                setLoading(false);
                return;
            }

            const { data: createdHousehold, error: householdError } = await supabase
                .from("households")
                .insert({
                    name: "My Household",
                    invite_code: makeInviteCode(),
                })
                .select()
                .single();

            if (householdError) {
                alert(householdError.message);
                setLoading(false);
                return;
            }

            const { error: memberError } = await supabase
                .from("household_members")
                .insert({
                    household_id: createdHousehold.id,
                    user_id: userId,
                });

            if (memberError) {
                alert(memberError.message);
                setLoading(false);
                return;
            }

            setHousehold(createdHousehold);
            setLoading(false);
        };

        fetchOrCreateHousehold();
    }, []);

    const joinHousehold = async () => {
        if (!inviteCode.trim()) {
            alert("Please enter an invite code.");
            return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;

        if (!userId) return;

        const { data: foundHousehold, error: householdError } = await supabase
            .from("households")
            .select("*")
            .eq("invite_code", inviteCode.toUpperCase())
            .single();

        if (householdError) {
            alert("Household not found.");
            return;
        }

        const { error: memberError } = await supabase
            .from("household_members")
            .insert({
                household_id: foundHousehold.id,
                user_id: userId,
            });

        if (memberError) {
            alert(memberError.message);
            return;
        }

        setHousehold(foundHousehold);
        setInviteCode("");
    };

    const leaveHousehold = async () => {
        if (!household) return;

        const confirmed = window.confirm(
            `Are you sure you want to leave "${household.name}"?`
        );

        if (!confirmed) return;

        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;

        if (!userId) return;

        const { error } = await supabase
            .from("household_members")
            .delete()
            .eq("user_id", userId)
            .eq("household_id", household.id);

        if (error) {
            alert(error.message);
            return;
        }

        setHousehold(null);
        window.location.reload();
    };

    if (loading) {
        return (
            <main className="mx-auto max-w-3xl p-6">
                <p className="font-black text-pink-500">Loading household ♡</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-3xl p-6">
            <section className="rounded-[2rem] border border-pink-100 bg-white/80 p-8 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    shared space
                </p>

                <h1 className="mt-2 text-5xl font-black text-pink-500">
                    Household ♡
                </h1>

                <p className="mt-3 text-rose-700">
                    Use this invite code to sync MacroBudget with your partner.
                </p>
            </section>

            {household && (
                <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                        current household
                    </p>


                    <h2 className="mt-2 text-3xl font-black text-rose-950">
                        {household.name}
                    </h2>

                    <p className="mt-2 text-sm font-semibold text-rose-500">
                        Household ID: {household.id}
                    </p>

                    <div className="mt-6 rounded-2xl bg-pink-50 p-5">
                        <p className="text-xs font-bold uppercase text-pink-400">
                            Invite code
                        </p>

                        <p className="mt-2 text-3xl font-black tracking-widest text-pink-500">
                            {household.invite_code}
                        </p>
                    </div>
                    <button
                        onClick={leaveHousehold}
                        className="mt-5 w-full rounded-full bg-rose-100 px-6 py-4 font-black text-rose-500 transition hover:bg-rose-200"
                    >
                        Leave household
                    </button>
                </section>
            )}

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                <h2 className="text-2xl font-black text-pink-500">
                    Join another household
                </h2>

                <p className="mt-2 text-sm font-semibold text-rose-500">
                    Enter your partner&apos;s invite code to sync together.
                </p>

                <input
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value)}
                    className="mt-5 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold uppercase tracking-widest text-rose-950 outline-none"
                />

                <button
                    onClick={joinHousehold}
                    className="mt-5 w-full rounded-full bg-pink-500 px-6 py-4 font-black text-white transition hover:bg-pink-600"
                >
                    Join ♡
                </button>
            </section>
        </main>
    );
}