"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { Home, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

const days = Array.from({ length: 31 }, (_, index) =>
    String(index + 1).padStart(2, "0")
);

const years = Array.from({ length: 100 }, (_, index) =>
    String(new Date().getFullYear() - index)
);

export default function SettingsPage() {
    const [fullName, setFullName] = useState("");
    const [heightCm, setHeightCm] = useState("");
    const [sex, setSex] = useState("");

    const [birthDay, setBirthDay] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthYear, setBirthYear] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData.session?.user.id;

            if (!userId) return;

            const { data } = await supabase
                .from("profiles")
                .select("full_name, height_cm, birth_date, sex")
                .eq("id", userId)
                .maybeSingle();

            setFullName(data?.full_name ?? "");
            setHeightCm(data?.height_cm ? String(data.height_cm) : "");
            setSex(data?.sex ?? "");

            if (data?.birth_date) {
                const [year, month, day] = data.birth_date.split("-");
                setBirthYear(year);
                setBirthMonth(month);
                setBirthDay(day);
            }
        };

        fetchProfile();
    }, []);

    const saveProfile = async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;

        if (!userId) return;

        const birthDate =
            birthYear && birthMonth && birthDay
                ? `${birthYear}-${birthMonth}-${birthDay}`
                : null;

        const { error } = await supabase.from("profiles").upsert({
            id: userId,
            full_name: fullName.trim() || "User",
            height_cm: heightCm ? Number(heightCm) : null,
            birth_date: birthDate,
            sex: sex || null,
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

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                <p className="text-2xl font-black text-pink-500">Profile ♡</p>

                <p className="mt-1 text-sm font-semibold text-rose-500">
                    Used for dashboard welcome, BMI and calorie estimates.
                </p>

                <div className="mt-6">
                    <label className="text-sm font-black uppercase tracking-wide text-pink-400">
                        Name:
                    </label>

                    <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Your name"
                        className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                    />
                </div>

                <div className="mt-5">
                    <label className="text-sm font-black uppercase tracking-wide text-purple-400">
                        Height in cm:
                    </label>

                    <input
                        type="number"
                        value={heightCm}
                        onChange={(event) => setHeightCm(event.target.value)}
                        placeholder="Height in cm"
                        className="mt-2 w-full rounded-2xl bg-purple-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                    />
                </div>

                <div className="mt-5">
                    <label className="text-sm font-black uppercase tracking-wide text-orange-400">
                        Birth date:
                    </label>

                    <div className="mt-2 grid gap-3 md:grid-cols-3">
                        <select
                            value={birthDay}
                            onChange={(event) => setBirthDay(event.target.value)}
                            className="rounded-2xl bg-orange-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                        >
                            <option value="">Day</option>
                            {days.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>

                        <select
                            value={birthMonth}
                            onChange={(event) => setBirthMonth(event.target.value)}
                            className="rounded-2xl bg-orange-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                        >
                            <option value="">Month</option>
                            {months.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={birthYear}
                            onChange={(event) => setBirthYear(event.target.value)}
                            className="rounded-2xl bg-orange-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                        >
                            <option value="">Year</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-5">
                    <label className="text-sm font-black uppercase tracking-wide text-blue-400">
                        Sex:
                    </label>

                    <select
                        value={sex}
                        onChange={(event) => setSex(event.target.value)}
                        className="mt-2 w-full rounded-2xl bg-blue-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                    >
                        <option value="">Select sex</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="other">Prefer not to say</option>
                    </select>
                </div>

                <button
                    onClick={saveProfile}
                    className="mt-6 w-full rounded-full bg-pink-500 px-6 py-4 font-black text-white"
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