"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";
import { supabase } from "@/lib/supabase";

type Ingredient = {
    id: number;
    name: string;
    unit: "g" | "pcs";
    calories: number;
    protein: number;
    cost: number;
};

type RecipeIngredient = {
    amount: number;
    ingredients: Ingredient | null;
};

type Recipe = {
    id: number;
    name: string;
    servings: number;
    instructions: string | null;
    recipe_ingredients: RecipeIngredient[];
};

export default function RecipesPage() {
    const [search, setSearch] = useState("");
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        const fetchRecipes = async () => {
            const { data, error } = await supabase
                .from("recipes")
                .select(
                    `
          id,
          name,
          servings,
          instructions,
          recipe_ingredients (
            amount,
            ingredients (
              id,
              name,
              unit,
              calories,
              protein,
              cost
            )
          )
        `
                )
                .order("name", { ascending: true });

            if (error) {
                alert(error.message);
                return;
            }

            setRecipes((data ?? []) as Recipe[]);
        };

        fetchRecipes();
    }, []);

    const recipesWithDetails = recipes.map((recipe) => {
        const totals = recipe.recipe_ingredients.reduce(
            (sum, item) => {
                if (!item.ingredients) return sum;

                const multiplier =
                    item.ingredients.unit === "g" ? item.amount / 100 : item.amount;

                return {
                    calories: sum.calories + item.ingredients.calories * multiplier,
                    protein: sum.protein + item.ingredients.protein * multiplier,
                    cost: sum.cost + item.ingredients.cost * multiplier,
                };
            },
            { calories: 0, protein: 0, cost: 0 }
        );

        return {
            ...recipe,
            ingredientNames: recipe.recipe_ingredients.map(
                (item) => item.ingredients?.name ?? "Unknown ingredient"
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

    const handleDeleteRecipe = async (recipeId: number, recipeName: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${recipeName}"?`
        );

        if (!confirmed) return;

        const { error } = await supabase.from("recipes").delete().eq("id", recipeId);

        if (error) {
            alert(error.message);
            return;
        }

        setRecipes((currentRecipes) =>
            currentRecipes.filter((recipe) => recipe.id !== recipeId)
        );
    };

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
                                    key={recipe.id}
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
                                                onClick={() =>
                                                    handleDeleteRecipe(recipe.id, recipe.name)
                                                }
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500 transition hover:bg-rose-200"
                                                aria-label={`Delete ${recipe.name}`}
                                            >
                                                <Trash2 size={18} />
                                            </button>

                                            <Link
                                                href={`/recipes/${recipe.id}`}
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