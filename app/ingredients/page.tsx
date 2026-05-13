"use client";

import { useMemo, useState } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ingredients } from "@/data/ingredients";

export default function IngredientsPage() {
    const [search, setSearch] = useState("");

    const filteredIngredients = useMemo(() => {
        return ingredients
            .filter((ingredient) =>
                ingredient.name.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [search]);

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
                    ingredient database
                </p>

                <h1 className="mt-2 text-5xl font-black text-pink-500">
                    Ingredients ♡
                </h1>

                <p className="mt-3 text-rose-700">
                    Track calories, macros and cost per ingredient.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_260px]">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search ingredients..."
                        className="w-full rounded-full border border-pink-100 bg-white px-5 py-3 text-rose-900 shadow-sm outline-none placeholder:text-rose-300 focus:border-pink-300"
                    />

                    <Link
                        href="/create-ingredient"
                        className="flex h-full items-center justify-center gap-3 rounded-full bg-pink-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(244,114,182,0.3)] transition hover:scale-[1.02] hover:bg-pink-600"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Add ingredient
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
                {groupedIngredients.map((group) => (
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
                                    <div className="inline-flex rounded-full bg-pink-100 px-4 py-2 text-3xl">
                                        {ingredient.emoji}
                                    </div>

                                    <h3 className="mt-4 text-2xl font-black text-rose-950">
                                        {ingredient.name}
                                    </h3>

                                    <p className="mt-1 text-sm font-medium text-rose-500">
                                        Nutrition per 100g
                                    </p>

                                    <div className="mt-6 grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl bg-orange-50 p-4">
                                            <p className="text-xs font-bold uppercase text-orange-400">
                                                Calories
                                            </p>
                                            <p className="mt-1 text-xl font-black text-rose-950">
                                                {ingredient.calories}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-purple-50 p-4">
                                            <p className="text-xs font-bold uppercase text-purple-400">
                                                Protein
                                            </p>
                                            <p className="mt-1 text-xl font-black text-rose-950">
                                                {ingredient.protein}g
                                            </p>
                                        </div>

                                    </div>

                                    <div className="mt-4 rounded-2xl bg-pink-50 p-4">
                                        <p className="text-xs font-bold uppercase text-pink-400">
                                            Cost
                                        </p>
                                        <p className="mt-1 text-xl font-black text-rose-950">
                                            {ingredient.cost}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                ))}
            </section>
            <ScrollToTop />
        </main>
    );
}