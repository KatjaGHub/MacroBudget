"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { Home, LogOut } from "lucide-react";
import { getHouseholdId } from "@/lib/getHouseholdId";
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
    const [loading, setLoading] = useState(true);
    const [fullName, setFullName] = useState("");
    const [heightCm, setHeightCm] = useState("");
    const [sex, setSex] = useState("");

    const [birthDay, setBirthDay] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthYear, setBirthYear] = useState("");

    const [calorieTargetMode, setCalorieTargetMode] = useState<"auto" | "manual">("auto");
    const [calorieTarget, setCalorieTarget] = useState("");
    const [proteinTarget, setProteinTarget] = useState("");
    const [proteinTargetMode, setProteinTargetMode] = useState<"auto" | "manual">("auto");
    const [goalWeight, setGoalWeight] = useState("");
    const [goalStartWeight, setGoalStartWeight] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);

            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData.session?.user.id;

            if (!userId) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from("profiles")
                .select(
                    "full_name, height_cm, birth_date, sex, calorie_target, protein_target, calorie_target_mode, protein_target_mode, goal_weight, goal_start_weight"
                )
                .eq("id", userId)
                .maybeSingle();

            setFullName(data?.full_name ?? "");
            setHeightCm(data?.height_cm ? String(data.height_cm) : "");
            setSex(data?.sex ?? "");
            setCalorieTargetMode(data?.calorie_target_mode === "manual" ? "manual" : "auto");
            setCalorieTarget(data?.calorie_target ? String(data.calorie_target) : "");
            setProteinTarget(data?.protein_target ? String(data.protein_target) : "");
            setProteinTargetMode(data?.protein_target_mode === "manual" ? "manual" : "auto");
            setGoalWeight(data?.goal_weight ? String(data.goal_weight) : "");
            setGoalStartWeight(data?.goal_start_weight ? String(data.goal_start_weight) : "");

            if (data?.birth_date) {
                const [year, month, day] = data.birth_date.split("-");
                setBirthYear(year);
                setBirthMonth(month);
                setBirthDay(day);
            }

            setLoading(false);
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
            calorie_target: calorieTarget ? Number(calorieTarget) : null,
            protein_target: proteinTarget ? Number(proteinTarget) : null,
            calorie_target_mode: calorieTargetMode,
            protein_target_mode: proteinTargetMode,
            goal_weight: goalWeight ? Number(goalWeight) : null,
            goal_start_weight: goalStartWeight ? Number(goalStartWeight) : null,
        });

        if (error) {
            alert(error.message);
            return;
        }

        const startWeightValue = goalStartWeight ? Number(goalStartWeight) : null;

        if (startWeightValue) {
            const householdId = await getHouseholdId();

            if (householdId) {
                const { data: existingWeightLog } = await supabase
                    .from("weight_logs")
                    .select("id")
                    .eq("user_id", userId)
                    .order("date", { ascending: true })
                    .limit(1)
                    .maybeSingle();

                if (!existingWeightLog) {
                    const today = new Date();
                    const date = [
                        today.getFullYear(),
                        String(today.getMonth() + 1).padStart(2, "0"),
                        String(today.getDate()).padStart(2, "0"),
                    ].join("-");

                    const { error: weightLogError } = await supabase
                        .from("weight_logs")
                        .insert({
                            household_id: householdId,
                            user_id: userId,
                            date,
                            weight: startWeightValue,
                        });

                    if (weightLogError) {
                        alert(weightLogError.message);
                        return;
                    }
                }
            }
        }

        alert("Profile saved ?");
    };

    return (
        <main className="mx-auto max-w-3xl px-4 py-4 sm:p-6">
            {loading ? (
                <section className="rounded-[2rem] border border-pink-100 bg-white/80 p-5 text-center shadow-[0_10px_30px_rgba(244,114,182,0.15)] sm:p-8">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                        loading
                    </p>

                    <p className="mt-2 text-3xl font-black text-pink-500 sm:text-4xl">
                        Loading settings ♡
                    </p>

                    <p className="mt-3 font-semibold text-rose-500">
                        Pulling in your profile, goals and household options.
                    </p>
                </section>
            ) : (
                <>
            <section className="rounded-[2rem] border border-pink-100 bg-white/80 p-5 shadow-[0_10px_30px_rgba(244,114,182,0.15)] sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    account
                </p>

                <h1 className="mt-2 text-3xl font-black text-pink-500 sm:text-5xl">
                    Settings ♡
                </h1>

                <p className="mt-3 text-rose-700">
                    Manage your account and shared household.
                </p>
            </section>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
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

                    <div className="mt-2 grid gap-3 sm:grid-cols-3">
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
            </section>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
                <p className="text-2xl font-black text-pink-500">Goals ♡</p>

                <p className="mt-1 text-sm font-semibold text-rose-500">
                    Choose automatic calorie goals or set your own fixed target.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-black uppercase tracking-wide text-pink-400">
                            Goal weight in kg:
                        </label>

                        <input
                            type="number"
                            step="0.1"
                            value={goalWeight}
                            onChange={(event) => setGoalWeight(event.target.value)}
                            placeholder="Example: 65"
                            className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-black uppercase tracking-wide text-rose-400">
                            Starting weight in kg:
                        </label>

                        <input
                            type="number"
                            step="0.1"
                            value={goalStartWeight}
                            onChange={(event) => setGoalStartWeight(event.target.value)}
                            placeholder="Example: 95"
                            className="mt-2 w-full rounded-2xl bg-rose-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                        />
                    </div>

                    <p className="text-sm font-semibold text-rose-400 sm:col-span-2">
                        Used on your dashboard to estimate progress and unlock goal milestones.
                    </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => setCalorieTargetMode("auto")}
                        className={`rounded-2xl border px-5 py-4 text-left transition ${calorieTargetMode === "auto"
                            ? "border-pink-400 bg-pink-500 text-white shadow-[0_10px_25px_rgba(244,114,182,0.3)]"
                            : "border-pink-100 bg-pink-50 text-rose-700 hover:bg-pink-100"
                            }`}
                    >
                        <p className="font-black">Calculate for me</p>
                        <p className="mt-1 text-sm font-semibold opacity-80">
                            Updates with your latest logged weight
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => setCalorieTargetMode("manual")}
                        className={`rounded-2xl border px-5 py-4 text-left transition ${calorieTargetMode === "manual"
                            ? "border-pink-400 bg-pink-500 text-white shadow-[0_10px_25px_rgba(244,114,182,0.3)]"
                            : "border-pink-100 bg-pink-50 text-rose-700 hover:bg-pink-100"
                            }`}
                    >
                        <p className="font-black">Manual target</p>
                        <p className="mt-1 text-sm font-semibold opacity-80">
                            Keep the same daily calorie goal
                        </p>
                    </button>
                </div>

                <div className="mt-5">
                    <label className="text-sm font-black uppercase tracking-wide text-pink-400">
                        Daily calorie target:
                    </label>

                    <input
                        type="number"
                        value={calorieTarget}
                        onChange={(event) => {
                            setCalorieTarget(event.target.value);
                            setCalorieTargetMode("manual");
                        }}
                        placeholder={
                            calorieTargetMode === "auto"
                                ? "Calculated automatically on dashboard"
                                : "Example: 1800"
                        }
                        className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                    />

                    {calorieTargetMode === "auto" && (
                        <p className="mt-2 text-sm font-semibold text-rose-400">
                            Auto mode uses your height, birth date, sex and latest weight log.
                        </p>
                    )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => setProteinTargetMode("auto")}
                        className={`rounded-2xl border px-5 py-4 text-left transition ${proteinTargetMode === "auto"
                                ? "border-purple-400 bg-purple-500 text-white shadow-[0_10px_25px_rgba(168,85,247,0.3)]"
                                : "border-purple-100 bg-purple-50 text-rose-700 hover:bg-purple-100"
                            }`}
                    >
                        <p className="font-black">Calculate protein for me</p>
                        <p className="mt-1 text-sm font-semibold opacity-80">
                            Uses your latest weight × 1.6g
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => setProteinTargetMode("manual")}
                        className={`rounded-2xl border px-5 py-4 text-left transition ${proteinTargetMode === "manual"
                                ? "border-purple-400 bg-purple-500 text-white shadow-[0_10px_25px_rgba(168,85,247,0.3)]"
                                : "border-purple-100 bg-purple-50 text-rose-700 hover:bg-purple-100"
                            }`}
                    >
                        <p className="font-black">Manual protein target</p>
                        <p className="mt-1 text-sm font-semibold opacity-80">
                            Keep the same daily protein goal
                        </p>
                    </button>
                </div>

                <div className="mt-5">
                    <label className="text-sm font-black uppercase tracking-wide text-purple-400">
                        Protein target in g:
                    </label>

                    <input
                        type="number"
                        value={proteinTarget}
                        onChange={(event) => {
                            setProteinTarget(event.target.value);
                            setProteinTargetMode("manual");
                        }}
                        placeholder={
                            proteinTargetMode === "auto"
                                ? "Calculated automatically on dashboard"
                                : "Example: 120"
                        }
                        className="mt-2 w-full rounded-2xl bg-purple-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                    />

                    {proteinTargetMode === "auto" && (
                        <p className="mt-2 text-sm font-semibold text-rose-400">
                            Auto mode uses your latest weight log and calculates 1.6g protein per kg.
                        </p>
                    )}
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
                    className="flex items-center justify-between gap-4 rounded-[2rem] border border-pink-100 bg-white p-4 shadow-[0_10px_30px_rgba(244,114,182,0.12)] transition hover:bg-pink-50 sm:p-5"
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

                <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-pink-100 bg-white p-4 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-5">
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
                </>
            )}
        </main>
    );
}
