"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ScrollToTop from "@/components/ScrollToTop";
import { recipes } from "@/data/recipes";
import { ingredients } from "@/data/ingredients";
import { Plus, Trash2 } from "lucide-react";

export default function RecipesPage() {
    const [search, setSearch] = useState("");
    const handleDeleteRecipe = (recipeName: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${recipeName}"?`
        );

        if (!confirmed) return;

        alert("Later this will delete from Supabase ♡");
    };

    const recipesWithDetails = recipes.map((recipe) => {
        const recipeIngredients = recipe.ingredients.map((recipeIngredient) => {
            const ingredient = ingredients.find(
                (item) => item.id === recipeIngredient.ingredientId
            );

            return {
                ...recipeIngredient,
                ingredient,
            };
        });

        const totals = recipeIngredients.reduce(
            (sum, item) => {
                if (!item.ingredient) return sum;

                const multiplier =
                    item.ingredient.unit === "g" ? item.amount / 100 : item.amount;

                return {
                    calories: sum.calories + item.ingredient.calories * multiplier,
                    protein: sum.protein + item.ingredient.protein * multiplier,
                    cost: sum.cost + item.ingredient.cost * multiplier,
                };
            },
            { calories: 0, protein: 0, cost: 0 }
        );

        return {
            ...recipe,
            ingredientNames: recipeIngredients.map(
                (item) => item.ingredient?.name ?? "Unknown ingredient"
            ),
            calories: Math.round(totals.calories / recipe.servings),
            protein: totals.protein / recipe.servings,
            cost: totals.cost / recipe.servings,
        };
    });

    const filteredRecipes = useMemo(() => {
        return recipesWithDetails
            .filter(
                (recipe) =>
                    recipe.name.toLowerCase().includes(search.toLowerCase()) ||
                    recipe.ingredientNames.some((ingredient) =>
                        ingredient.toLowerCase().includes(search.toLowerCase())
                    )
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [search, recipesWithDetails]);

    const letters = Array.from(
        new Set(filteredRecipes.map((recipe) => recipe.name[0].toUpperCase()))
    );

    const groupedRecipes = letters.map((letter) => ({
        letter,
        items: filteredRecipes.filter(
            (recipe) => recipe.name[0].toUpperCase() === letter
        ),
    }));

    return (
        <main className="mx-auto max-w-6xl p-6">
            <section className="rounded-[2rem] border border-pink-100 bg-white/70 p-8 shadow-sm backdrop-blur">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    recipe collection
                </p>

                <h1 className="mt-2 text-5xl font-black text-pink-500">
                    Recipes ♡
                </h1>

                <p className="mt-3 text-rose-700">
                    Cute recipe cards with calories, protein and cost per serving.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-[1fr_260px]">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search recipes..."
                        className="w-full rounded-full border border-pink-100 bg-white px-5 py-3 text-rose-900 shadow-sm outline-none placeholder:text-rose-300 focus:border-pink-300"
                    />

                    <Link
                        href="/create-recipe"
                        className="flex h-full items-center justify-center gap-3 rounded-full bg-pink-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_25px_rgba(244,114,182,0.3)] transition hover:scale-[1.02] hover:bg-pink-600"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Create recipe
                    </Link>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {letters.map((letter) => (
                        <a
                            key={letter}
                            href={`#recipe-letter-${letter}`}
                            className="rounded-full bg-pink-100 px-4 py-2 text-sm font-bold text-pink-500 hover:bg-pink-200"
                        >
                            {letter}
                        </a>
                    ))}
                </div>
            </section>

            <section className="mt-8 space-y-10">
                {groupedRecipes.map((group) => (
                    <div
                        key={group.letter}
                        id={`recipe-letter-${group.letter}`}
                        className="scroll-mt-24"
                    >
                        <h2 className="mb-4 text-3xl font-black text-pink-500">
                            {group.letter} ♡
                        </h2>

                        <div className="grid gap-6 md:grid-cols-2">
                            {group.items.map((recipe) => (
                                <article
                                    key={recipe.name}
                                    className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.18)]"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-2xl font-black text-rose-950">
                                                {recipe.name}
                                            </h3>

                                            <p className="mt-1 text-sm font-medium text-rose-500">
                                                {recipe.servings} servings
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDeleteRecipe(recipe.name)}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500 transition hover:bg-rose-200"
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            <Link
                                                href={`/recipes/${recipe.slug}`}
                                                className="rounded-full bg-pink-500 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-pink-600"
                                            >
                                                View ♡
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid grid-cols-3 gap-3">
                                        <div className="rounded-2xl bg-pink-50 p-4 text-center">
                                            <p className="text-xs font-bold uppercase text-pink-400">
                                                Cost
                                            </p>
                                            <p className="mt-1 font-black text-rose-900">
                                                {recipe.cost.toFixed(2)} €
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-orange-50 p-4 text-center">
                                            <p className="text-xs font-bold uppercase text-orange-400">
                                                Calories
                                            </p>
                                            <p className="mt-1 font-black text-rose-900">
                                                {recipe.calories}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl bg-purple-50 p-4 text-center">
                                            <p className="text-xs font-bold uppercase text-purple-400">
                                                Protein
                                            </p>
                                            <p className="mt-1 font-black text-rose-900">
                                                {recipe.protein.toFixed(1)}g
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 rounded-2xl border border-pink-100 bg-rose-50/50 p-4">
                                        <p className="text-sm font-black text-pink-500">
                                            Ingredients
                                        </p>

                                        <ul className="mt-3 space-y-2 text-sm text-rose-800">
                                            {recipe.ingredientNames.map((ingredient) => (
                                                <li key={ingredient}>♡ {ingredient}</li>
                                            ))}
                                        </ul>
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