"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { Home, LogOut } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { getHouseholdId } from "@/lib/getHouseholdId";
import { languages } from "@/lib/i18n";
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

type ThemeMode = "system" | "light" | "dark";

const themeOptions: { value: ThemeMode; label: string; description: string }[] = [
    {
        value: "system",
        label: "System",
        description: "Follow this device",
    },
    {
        value: "light",
        label: "Light",
        description: "Keep the bright look",
    },
    {
        value: "dark",
        label: "Dark",
        description: "Use darker cards",
    },
];

function applyTheme(theme: ThemeMode) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);

    document.documentElement.classList.toggle("dark", shouldUseDark);
}

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage();
    const dateLocale = language === "sl" ? "sl-SI" : language === "de" ? "de-DE" : "en-US";
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<ThemeMode>("system");
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
        const savedTheme = localStorage.getItem("macrobudget-theme") as ThemeMode | null;
        const initialTheme =
            savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
                ? savedTheme
                : "system";

        const timeoutId = window.setTimeout(() => {
            setTheme(initialTheme);
            applyTheme(initialTheme);
        }, 0);

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const syncSystemTheme = () => {
            const currentTheme =
                (localStorage.getItem("macrobudget-theme") as ThemeMode | null) ??
                "system";

            if (currentTheme === "system") {
                applyTheme("system");
            }
        };

        mediaQuery.addEventListener("change", syncSystemTheme);

        return () => {
            window.clearTimeout(timeoutId);
            mediaQuery.removeEventListener("change", syncSystemTheme);
        };
    }, []);

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
                    "full_name, height_cm, birth_date, sex, calorie_target, protein_target, calorie_target_mode, protein_target_mode, goal_weight, goal_start_weight, language"
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

        alert(t.settings.profileSaved);
    };

    const saveTheme = (nextTheme: ThemeMode) => {
        setTheme(nextTheme);
        localStorage.setItem("macrobudget-theme", nextTheme);
        applyTheme(nextTheme);
    };

    return (
        <main className="mx-auto max-w-3xl px-4 py-4 sm:p-6">
            {loading ? (
                <section className="rounded-[2rem] border border-pink-100 bg-white/80 p-5 text-center shadow-[0_10px_30px_rgba(244,114,182,0.15)] sm:p-8">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                        {t.settings.loadingEyebrow}
                    </p>

                    <p className="mt-2 text-3xl font-black text-pink-500 sm:text-4xl">
                        {t.settings.loadingTitle}
                    </p>

                    <p className="mt-3 font-semibold text-rose-500">
                        {t.settings.loadingBody}
                    </p>
                </section>
            ) : (
                <>
            <section className="rounded-[2rem] border border-pink-100 bg-white/80 p-5 shadow-[0_10px_30px_rgba(244,114,182,0.15)] sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    {t.settings.accountEyebrow}
                </p>

                <h1 className="mt-2 text-3xl font-black text-pink-500 sm:text-5xl">
                    {t.settings.title}
                </h1>

                <p className="mt-3 text-rose-700">
                    {t.settings.intro}
                </p>
            </section>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
                <p className="text-2xl font-black text-pink-500">{t.settings.languageTitle}</p>

                <p className="mt-1 text-sm font-semibold text-rose-500">
                    {t.settings.languageBody}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {languages.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setLanguage(option.value)}
                            className={`rounded-2xl border px-5 py-4 text-left transition ${language === option.value
                                ? "border-pink-400 bg-pink-500 text-white shadow-[0_10px_25px_rgba(244,114,182,0.3)]"
                                : "border-pink-100 bg-pink-50 text-rose-700 hover:bg-pink-100"
                                }`}
                        >
                            <p className="font-black">{option.label}</p>
                            <p className="mt-1 text-sm font-semibold opacity-80">
                                {option.description}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
                <p className="text-2xl font-black text-pink-500">{t.settings.themeTitle}</p>

                <p className="mt-1 text-sm font-semibold text-rose-500">
                    {t.settings.themeBody}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {themeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => saveTheme(option.value)}
                            className={`rounded-2xl border px-5 py-4 text-left transition ${theme === option.value
                                ? "border-pink-400 bg-pink-500 text-white shadow-[0_10px_25px_rgba(244,114,182,0.3)]"
                                : "border-pink-100 bg-pink-50 text-rose-700 hover:bg-pink-100"
                                }`}
                        >
                            <p className="font-black">
                                {option.value === "system"
                                    ? t.theme.system
                                    : option.value === "light"
                                        ? t.theme.light
                                        : t.theme.dark}
                            </p>
                            <p className="mt-1 text-sm font-semibold opacity-80">
                                {option.value === "system"
                                    ? t.theme.systemDescription
                                    : option.value === "light"
                                        ? t.theme.lightDescription
                                        : t.theme.darkDescription}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
                <p className="text-2xl font-black text-pink-500">{t.settings.profileTitle}</p>

                <p className="mt-1 text-sm font-semibold text-rose-500">
                    {t.settings.profileBody}
                </p>

                <div className="mt-6">
                    <label className="text-sm font-black uppercase tracking-wide text-pink-400">
                        {t.settings.nameLabel}
                    </label>

                    <input
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder={t.settings.namePlaceholder}
                        className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                    />
                </div>

                <div className="mt-5">
                    <label className="text-sm font-black uppercase tracking-wide text-purple-400">
                        {t.settings.heightLabel}
                    </label>

                    <input
                        type="number"
                        value={heightCm}
                        onChange={(event) => setHeightCm(event.target.value)}
                        placeholder={t.settings.heightPlaceholder}
                        className="mt-2 w-full rounded-2xl bg-purple-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                    />
                </div>

                <div className="mt-5">
                    <label className="text-sm font-black uppercase tracking-wide text-orange-400">
                        {t.settings.birthDateLabel}
                    </label>

                    <div className="mt-2 grid gap-3 sm:grid-cols-3">
                        <select
                            value={birthDay}
                            onChange={(event) => setBirthDay(event.target.value)}
                            className="rounded-2xl bg-orange-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                        >
                            <option value="">{t.settings.day}</option>
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
                            <option value="">{t.settings.month}</option>
                            {months.map((month) => (
                                <option key={month.value} value={month.value}>
                                    {new Date(2000, Number(month.value) - 1, 1).toLocaleString(dateLocale, { month: "long" })}
                                </option>
                            ))}
                        </select>

                        <select
                            value={birthYear}
                            onChange={(event) => setBirthYear(event.target.value)}
                            className="rounded-2xl bg-orange-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                        >
                            <option value="">{t.settings.year}</option>
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
                        {t.settings.sexLabel}
                    </label>

                    <select
                        value={sex}
                        onChange={(event) => setSex(event.target.value)}
                        className="mt-2 w-full rounded-2xl bg-blue-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                    >
                        <option value="">{t.settings.selectSex}</option>
                        <option value="female">{t.settings.female}</option>
                        <option value="male">{t.settings.male}</option>
                        <option value="other">{t.settings.otherSex}</option>
                    </select>
                </div>
            </section>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
                <p className="text-2xl font-black text-pink-500">{t.settings.goalsTitle}</p>

                <p className="mt-1 text-sm font-semibold text-rose-500">
                    {t.settings.goalsBody}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-black uppercase tracking-wide text-pink-400">
                            {t.settings.goalWeightLabel}
                        </label>

                        <input
                            type="number"
                            step="0.1"
                            value={goalWeight}
                            onChange={(event) => setGoalWeight(event.target.value)}
                            placeholder={t.settings.exampleGoalWeight}
                            className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-black uppercase tracking-wide text-rose-400">
                            {t.settings.startingWeightLabel}
                        </label>

                        <input
                            type="number"
                            step="0.1"
                            value={goalStartWeight}
                            onChange={(event) => setGoalStartWeight(event.target.value)}
                            placeholder={t.settings.exampleStartWeight}
                            className="mt-2 w-full rounded-2xl bg-rose-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                        />
                    </div>

                    <p className="text-sm font-semibold text-rose-400 sm:col-span-2">
                        {t.settings.goalWeightHint}
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
                        <p className="font-black">{t.settings.automaticTarget}</p>
                        <p className="mt-1 text-sm font-semibold opacity-80">
                            {t.settings.automaticCalorieBody}
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
                        <p className="font-black">{t.settings.manualTargetTitle}</p>
                        <p className="mt-1 text-sm font-semibold opacity-80">
                            {t.settings.manualCalorieBody}
                        </p>
                    </button>
                </div>

                <div className="mt-5">
                    <label className="text-sm font-black uppercase tracking-wide text-pink-400">
                        {t.settings.dailyCalorieTarget}
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
                                ? t.settings.calculatedAutomatically
                                : t.settings.exampleCalories
                        }
                        className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                    />

                    {calorieTargetMode === "auto" && (
                        <p className="mt-2 text-sm font-semibold text-rose-400">
                            {t.settings.automaticCalorieBody}
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
                        <p className="font-black">{t.settings.automaticProteinTitle}</p>
                        <p className="mt-1 text-sm font-semibold opacity-80">
                            {t.settings.automaticProteinBody}
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
                        <p className="font-black">{t.settings.manualProteinTitle}</p>
                        <p className="mt-1 text-sm font-semibold opacity-80">
                            {t.settings.manualProteinBody}
                        </p>
                    </button>
                </div>

                <div className="mt-5">
                    <label className="text-sm font-black uppercase tracking-wide text-purple-400">
                        {t.settings.proteinTargetLabel}
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
                                ? t.settings.calculatedAutomatically
                                : t.settings.exampleProtein
                        }
                        className="mt-2 w-full rounded-2xl bg-purple-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                    />

                    {proteinTargetMode === "auto" && (
                        <p className="mt-2 text-sm font-semibold text-rose-400">
                            {t.settings.automaticProteinHint}
                        </p>
                    )}
                </div>

                <button
                    onClick={saveProfile}
                    className="mt-6 w-full rounded-full bg-pink-500 px-6 py-4 font-black text-white"
                >
                    {t.settings.saveProfile}
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
                            <p className="text-lg font-black text-rose-950">{t.settings.householdTitle}</p>
                            <p className="text-sm font-semibold text-rose-500">
                                {t.settings.householdBody}
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
                            <p className="text-lg font-black text-rose-950">{t.settings.logoutTitle}</p>
                            <p className="text-sm font-semibold text-rose-500">
                                {t.settings.logoutBody}
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
