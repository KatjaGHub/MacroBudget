"use client";

import { useEffect, useMemo, useState } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";
import { getHouseholdId } from "@/lib/getHouseholdId";

type Ingredient = {
    id: number;
    name: string;
    emoji: string;
    unit: "g" | "pcs";
    calories: number;
    protein: number;
    cost: number;
};

export default function IngredientsPage() {
    const { t } = useLanguage();
    const noHouseholdFound = t.common.noHouseholdFound;
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const handleDeleteIngredient = async (
        ingredientId: number,
        ingredientName: string
    ) => {
        const confirmed = window.confirm(
            `${t.ingredientsPage.deleteConfirm} "${ingredientName}"?`
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("ingredients")
            .delete()
            .eq("id", ingredientId);

        if (error) {
            alert(error.message);
            return;
        }

        setIngredients((currentIngredients) =>
            currentIngredients.filter(
                (ingredient) => ingredient.id !== ingredientId
            )
        );
    };

    useEffect(() => {
        const fetchIngredients = async () => {
            setLoading(true);

            const householdId = await getHouseholdId();

            if (!householdId) {
                setLoading(false);
                alert(noHouseholdFound);
                return;
            }

            const { data, error } = await supabase
                .from("ingredients")
                .select("*")
                .eq("household_id", householdId)
                .order("name", { ascending: true });

            if (error) {
                setLoading(false);
                alert(error.message);
                return;
            }

            setIngredients(data ?? []);
            setLoading(false);
        };

        fetchIngredients();
    }, [noHouseholdFound]);

    const filteredIngredients = useMemo(() => {
        return ingredients
            .filter((ingredient) =>
                ingredient.name.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [search, ingredients]);

    const letters = Array.from(
        new Set(filteredIngredients.map((ingredient) => ingredient.name[0].toUpperCase()))
    );

    const groupedIngredients = letters.map((letter) => ({
        letter,
        items: filteredIngredients.filter(
            (ingredient) => ingredient.name[0].toUpperCase() === letter
        ),
    }));

    return (
        <main className="mx-auto max-w-6xl p-6">
            <section className="rounded-[2rem] border border-pink-100 bg-white/80 p-8 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    {t.ingredientsPage.eyebrow}
                </p>

                <h1 className="mt-2 text-5xl font-black text-pink-500">
                    {t.ingredientsPage.title}
                </h1>

                <p className="mt-3 text-rose-700">
                    {t.ingredientsPage.intro}
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_260px]">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t.ingredientsPage.search}
                        className="w-full rounded-full border border-pink-100 bg-white px-5 py-3 text-rose-900 shadow-sm outline-none placeholder:text-rose-300 focus:border-pink-300"
                    />

                    <Link
                        href="/create-ingredient"
                        className="flex h-full items-center justify-center gap-3 rounded-full bg-pink-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(244,114,182,0.3)] transition hover:scale-[1.02] hover:bg-pink-600"
                    >
                        <Plus size={20} strokeWidth={3} />
                        {t.ingredientsPage.add}
                    </Link>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {letters.map((letter) => (
                        <a
                            key={letter}
                            href={`#letter-${letter}`}
                            className="rounded-full bg-pink-100 px-4 py-2 text-sm font-bold text-pink-500 hover:bg-pink-200"
                        >
                            {letter}
                        </a>
                    ))}
                </div>
            </section>

            <section className="mt-8 space-y-10">
                {loading ? (
                    <div className="rounded-[2rem] border border-pink-100 bg-white/80 p-8 text-center shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                            {t.common.loading}
                        </p>
                        <p className="mt-2 text-3xl font-black text-pink-500">
                            {t.ingredientsPage.loadingTitle}
                        </p>
                        <p className="mt-3 font-semibold text-rose-500">
                            {t.ingredientsPage.loadingBody}
                        </p>
                    </div>
                ) : ingredients.length === 0 ? (
                    <div className="rounded-[2rem] border border-pink-100 bg-white/80 p-8 text-center shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                            {t.ingredientsPage.emptyEyebrow}
                        </p>
                        <p className="mt-2 text-3xl font-black text-pink-500">
                            {t.ingredientsPage.emptyTitle}
                        </p>
                        <p className="mt-3 font-semibold text-rose-500">
                            {t.ingredientsPage.emptyBody}
                        </p>
                        <Link
                            href="/create-ingredient"
                            className="mt-6 inline-flex items-center justify-center gap-3 rounded-full bg-pink-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(244,114,182,0.3)] transition hover:scale-[1.02] hover:bg-pink-600"
                        >
                            <Plus size={20} strokeWidth={3} />
                            {t.ingredientsPage.add}
                        </Link>
                    </div>
                ) : groupedIngredients.length === 0 ? (
                    <div className="rounded-[2rem] border border-pink-100 bg-white/80 p-8 text-center shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                        <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                            {t.ingredientsPage.noMatches}
                        </p>
                        <p className="mt-2 text-3xl font-black text-pink-500">
                            {t.ingredientsPage.nothingMatches} &quot;{search}&quot; ♡
                        </p>
                        <p className="mt-3 font-semibold text-rose-500">
                            {t.ingredientsPage.tryDifferent}
                        </p>
                    </div>
                ) : (
                    groupedIngredients.map((group) => (
                        <div key={group.letter} id={`letter-${group.letter}`} className="scroll-mt-24">
                            <h2 className="mb-4 text-3xl font-black text-pink-500">
                                {group.letter} ♡
                            </h2>

                            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {group.items.map((ingredient) => (
                                    <article
                                        key={ingredient.name}
                                        className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.18)]"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="inline-flex rounded-full bg-pink-100 px-4 py-2 text-3xl">
                                                {ingredient.emoji}
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleDeleteIngredient(ingredient.id, ingredient.name)
                                                }
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500 transition hover:bg-rose-200"
                                                aria-label={`${t.ingredientsPage.deleteLabel} ${ingredient.name}`}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <h3 className="mt-4 text-2xl font-black text-rose-950">
                                            {ingredient.name}
                                        </h3>

                                        <p className="mt-1 text-sm font-medium text-rose-500">
                                            {t.ingredientsPage.nutritionPer} {ingredient.unit === "g" ? "100g" : t.common.piece}
                                        </p>

                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            <div className="rounded-2xl bg-orange-50 p-4">
                                                <p className="text-xs font-bold uppercase text-orange-400">
                                                    {t.common.calories}
                                                </p>

                                                <p className="mt-1 text-xl font-black text-rose-950">
                                                    {ingredient.calories}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl bg-purple-50 p-4">
                                                <p className="text-xs font-bold uppercase text-purple-400">
                                                    {t.common.protein}
                                                </p>

                                                <p className="mt-1 text-xl font-black text-rose-950">
                                                    {ingredient.protein}g
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-2xl bg-pink-50 p-4">
                                            <p className="text-xs font-bold uppercase text-pink-400">
                                                {t.common.cost}
                                            </p>

                                            <p className="mt-1 text-xl font-black text-rose-950">
                                                {ingredient.cost.toFixed(2)} € /{" "}
                                                {ingredient.unit === "g" ? "100g" : t.common.piece}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>
            <ScrollToTop />
        </main>
    );
}
