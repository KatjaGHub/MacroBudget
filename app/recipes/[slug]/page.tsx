"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Ingredient = {
    id: number;
    name: string;
    emoji: string;
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

type RecipeDetailsPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default function RecipeDetailsPage({ params }: RecipeDetailsPageProps) {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [recipeId, setRecipeId] = useState<string>("");

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setRecipeId(resolvedParams.slug);
        };

        getParams();
    }, [params]);

    useEffect(() => {
        if (!recipeId) return;

        const fetchRecipe = async () => {
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
              emoji,
              unit,
              calories,
              protein,
              cost
            )
          )
        `
                )
                .eq("id", Number(recipeId))
                .single();

            if (error) {
                alert(error.message);
                return;
            }

            setRecipe(data as unknown as Recipe);
        };

        fetchRecipe();
    }, [recipeId]);

    if (!recipe) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-4 sm:p-6">
                <p className="text-pink-500 font-black">Loading recipe ♡</p>
            </main>
        );
    }

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

    const perServing = {
        calories: totals.calories / recipe.servings,
        protein: totals.protein / recipe.servings,
        cost: totals.cost / recipe.servings,
    };

    return (
        <main className="mx-auto max-w-6xl px-4 py-4 sm:p-6">
            <Link
                href="/recipes"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-pink-500 shadow-sm transition hover:bg-pink-50"
            >
                <ArrowLeft size={16} />
                Back to recipes
            </Link>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white/80 p-5 shadow-[0_10px_30px_rgba(244,114,182,0.15)] sm:p-8">
                <h1 className="text-3xl font-black text-pink-500 sm:text-5xl">
                    {recipe.name} ♡
                </h1>

                <p className="mt-3 text-rose-700">{recipe.servings} servings</p>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <section className="rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
                        <h2 className="text-2xl font-black text-pink-500 sm:text-3xl">
                            Ingredients
                        </h2>

                        <div className="mt-5 space-y-3">
                            {recipe.recipe_ingredients.map((item, index) => {
                                if (!item.ingredients) return null;

                                const multiplier =
                                    item.ingredients.unit === "g"
                                        ? item.amount / 100
                                        : item.amount;

                                const ingredientCost = item.ingredients.cost * multiplier;

                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col gap-3 rounded-2xl bg-pink-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                                {item.ingredients.emoji}
                                            </span>

                                            <div>
                                                <p className="font-black text-rose-950">
                                                    {item.ingredients.name}
                                                </p>

                                                <p className="text-sm font-semibold text-rose-500">
                                                    {ingredientCost.toFixed(2)} €
                                                </p>
                                            </div>
                                        </div>

                                        <p className="font-bold text-rose-500">
                                            {item.amount}{" "}
                                            {item.ingredients.unit === "pcs" ? "pcs" : "g"}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
                        <h2 className="text-2xl font-black text-pink-500 sm:text-3xl">
                            Instructions
                        </h2>

                        {recipe.instructions ? (
                            <p className="mt-5 whitespace-pre-line rounded-2xl bg-rose-50/70 p-4 font-semibold text-rose-800">
                                {recipe.instructions}
                            </p>
                        ) : (
                            <p className="mt-5 rounded-2xl bg-rose-50/70 p-4 font-semibold text-rose-400">
                                No instructions added yet.
                            </p>
                        )}
                    </section>
                </div>

                <aside className="h-fit rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.15)] sm:p-6">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                        recipe summary
                    </p>

                    <div className="mt-6 space-y-3">
                        <div className="rounded-2xl bg-orange-50 p-4">
                            <p className="text-xs font-bold uppercase text-orange-400">
                                Calories / serving
                            </p>

                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {Math.round(perServing.calories)} kcal
                            </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 p-4">
                            <p className="text-xs font-bold uppercase text-purple-400">
                                Protein / serving
                            </p>

                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {perServing.protein.toFixed(1)} g
                            </p>
                        </div>

                        <div className="rounded-2xl bg-pink-50 p-4">
                            <p className="text-xs font-bold uppercase text-pink-400">
                                Cost / serving
                            </p>

                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {perServing.cost.toFixed(2)} €
                            </p>
                        </div>

                        <div className="rounded-2xl border border-pink-100 bg-rose-50/60 p-4">
                            <p className="text-xs font-bold uppercase text-pink-400">
                                Total recipe
                            </p>

                            <p className="mt-1 text-sm font-bold text-rose-700">
                                {Math.round(totals.calories)} kcal ·{" "}
                                {totals.protein.toFixed(1)} g protein ·{" "}
                                {totals.cost.toFixed(2)} €
                            </p>
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    );
}
