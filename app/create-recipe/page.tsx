"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { supabase } from "@/lib/supabase";
import { getHouseholdId } from "@/lib/getHouseholdId";

type RecipeIngredient = {
    id: number;
    ingredientId: string;
    search: string;
    amount: number;
};

type Ingredient = {
    id: number;
    name: string;
    unit: "g" | "pcs";
    calories: number;
    protein: number;
    cost: number;
};

function createRecipeIngredient(id: number): RecipeIngredient {
    return {
        id,
        ingredientId: "",
        search: "",
        amount: 100,
    };
}

export default function CreateRecipePage() {
    const { t } = useLanguage();
    const noHouseholdFound = t.common.noHouseholdFound;
    const [recipeName, setRecipeName] = useState("");
    const [servings, setServings] = useState(4);
    const [instructions, setInstructions] = useState("");
    const [ingredientDatabase, setIngredientDatabase] = useState<Ingredient[]>(
        []
    );

    const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
        createRecipeIngredient(1),
    ]);

    useEffect(() => {
        const fetchIngredients = async () => {
            const householdId = await getHouseholdId();

            if (!householdId) {
                alert(noHouseholdFound);
                return;
            }

            const { data, error } = await supabase
                .from("ingredients")
                .select("id, name, unit, calories, protein, cost")
                .eq("household_id", householdId)
                .order("name", { ascending: true });

            if (error) {
                alert(error.message);
                return;
            }

            setIngredientDatabase(data ?? []);
        };

        fetchIngredients();
    }, [noHouseholdFound]);

    const totals = useMemo(() => {
        return ingredients.reduce(
            (sum, ingredient) => {
                const found = ingredientDatabase.find(
                    (item) => item.id === Number(ingredient.ingredientId)
                );

                if (!found) return sum;

                const multiplier =
                    found.unit === "g" ? ingredient.amount / 100 : ingredient.amount;

                return {
                    calories: sum.calories + found.calories * multiplier,
                    protein: sum.protein + found.protein * multiplier,
                    cost: sum.cost + found.cost * multiplier,
                };
            },
            { calories: 0, protein: 0, cost: 0 }
        );
    }, [ingredients, ingredientDatabase]);

    const safeServings = Math.max(1, servings);

    const perServing = {
        calories: totals.calories / safeServings,
        protein: totals.protein / safeServings,
        cost: totals.cost / safeServings,
    };

    const addIngredient = () => {
        setIngredients((currentIngredients) => [
            ...currentIngredients,
            createRecipeIngredient(
                Math.max(...currentIngredients.map((ingredient) => ingredient.id)) + 1
            ),
        ]);
    };

    const updateIngredient = (
        id: number,
        field: "ingredientId" | "search" | "amount",
        value: string
    ) => {
        setIngredients((currentIngredients) =>
            currentIngredients.map((ingredient) =>
                ingredient.id === id
                    ? {
                        ...ingredient,
                        [field]: field === "amount" ? Number(value) : value,
                    }
                    : ingredient
            )
        );
    };

    const deleteIngredient = (id: number) => {
        setIngredients((currentIngredients) =>
            currentIngredients.filter((ingredient) => ingredient.id !== id)
        );
    };



    const saveRecipe = async () => {
        if (!recipeName.trim()) {
            alert(t.createRecipe.enterName);
            return;
        }

        const validIngredients = ingredients.filter(
            (ingredient) => ingredient.ingredientId && ingredient.amount > 0
        );

        if (validIngredients.length === 0) {
            alert(t.createRecipe.addOneIngredient);
            return;
        }

        const householdId = await getHouseholdId();

        if (!householdId) {
            alert(t.common.noHouseholdFound);
            return;
        }

        const { data: recipe, error: recipeError } = await supabase
            .from("recipes")
            .insert({
                household_id: householdId,
                name: recipeName,
                servings,
                instructions,
            })
            .select()
            .single();

        if (recipeError) {
            alert(recipeError.message);
            return;
        }

        const recipeIngredients = validIngredients.map((ingredient) => ({
            recipe_id: recipe.id,
            ingredient_id: Number(ingredient.ingredientId),
            amount: ingredient.amount,
        }));

        const { error: ingredientsError } = await supabase
            .from("recipe_ingredients")
            .insert(recipeIngredients);

        if (ingredientsError) {
            alert(ingredientsError.message);
            return;
        }

        window.location.href = "/recipes";
    };

    return (
        <main className="mx-auto max-w-6xl px-4 py-4 sm:p-6">
            <Link
                href="/recipes"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-pink-500 shadow-sm transition hover:bg-pink-50"
            >
                <ArrowLeft size={16} />
                {t.common.backToRecipes}
            </Link>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white/80 p-5 shadow-[0_10px_30px_rgba(244,114,182,0.15)] sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    {t.createRecipe.builder}
                </p>

                <h1 className="mt-2 text-3xl font-black text-pink-500 sm:text-5xl">
                    {t.createRecipe.title}
                </h1>

                <p className="mt-3 text-rose-700">
                    {t.createRecipe.intro}
                </p>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="rounded-[2rem] border border-pink-100 bg-white/85 p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
                    <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
                        <div>
                            <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
                                {t.createRecipe.recipeName}
                            </label>

                            <input
                                value={recipeName}
                                onChange={(event) => setRecipeName(event.target.value)}
                                className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 text-lg font-semibold text-rose-950 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
                                {t.common.servings}
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={servings}
                                onChange={(event) =>
                                    setServings(Math.max(1, Number(event.target.value)))
                                }
                                className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 text-lg font-semibold text-rose-950 outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-2xl font-black text-pink-500">
                                {t.common.ingredients}
                            </h2>

                            <button
                                onClick={addIngredient}
                                className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:scale-105 hover:bg-pink-600"
                            >
                                <Plus size={16} />
                                {t.createRecipe.add}
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {ingredients.map((ingredient) => {
                                const selectedIngredient = ingredientDatabase.find(
                                    (item) => item.id === Number(ingredient.ingredientId)
                                );

                                return (
                                    <div
                                        key={ingredient.id}
                                        className="grid gap-3 rounded-2xl bg-pink-50 p-3 sm:grid-cols-[1fr_140px_auto]"
                                    >
                                        <div className="relative">
                                            <input
                                                value={ingredient.search}
                                                onChange={(event) => {
                                                    updateIngredient(ingredient.id, "search", event.target.value);
                                                    updateIngredient(ingredient.id, "ingredientId", "");
                                                }}
                                                placeholder={t.createRecipe.searchIngredient}
                                                className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                                            />

                                            {ingredient.search && !ingredient.ingredientId && (
                                                <div className="absolute left-0 right-0 top-14 z-20 max-h-56 overflow-y-auto rounded-2xl border border-pink-100 bg-white p-2 shadow-lg">
                                                    {ingredientDatabase
                                                        .filter((item) =>
                                                            item.name.toLowerCase().includes(ingredient.search.toLowerCase())
                                                        )
                                                        .map((item) => (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    updateIngredient(ingredient.id, "ingredientId", String(item.id));
                                                                    updateIngredient(ingredient.id, "search", item.name);
                                                                }}
                                                                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-semibold text-rose-800 hover:bg-pink-50"
                                                            >
                                                                <span>{item.name}</span>
                                                                <span className="text-xs text-rose-400">
                                                                    {item.unit === "g" ? t.createRecipe.per100g : t.createRecipe.perPiece}
                                                                </span>
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            type="number"
                                            min="0"
                                            value={ingredient.amount}
                                            onChange={(event) =>
                                                updateIngredient(
                                                    ingredient.id,
                                                    "amount",
                                                    event.target.value
                                                )
                                            }
                                            className="rounded-xl bg-white px-4 py-3 font-semibold text-rose-950 outline-none"
                                        />

                                        <button
                                            onClick={() => deleteIngredient(ingredient.id)}
                                            className="flex items-center justify-center rounded-xl p-3 text-rose-300 transition hover:bg-rose-100 hover:text-rose-500"
                                            aria-label={`${t.ingredientsPage.deleteLabel} ${t.common.ingredient}`}
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        {selectedIngredient && (
                                            <p className="sm:col-span-3 text-sm font-semibold text-rose-500">
                                                {t.createRecipe.amountIn}{" "}
                                                {selectedIngredient.unit === "g" ? t.common.grams : t.common.pieces}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-8">
                        <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
                            {t.common.instructions}
                        </label>

                        <textarea
                            value={instructions}
                            onChange={(event) => setInstructions(event.target.value)}
                            placeholder={t.createRecipe.writeSteps}
                            className="mt-2 min-h-40 w-full rounded-2xl bg-pink-50 px-5 py-4 text-lg font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                        />
                    </div>

                    <button
                        onClick={saveRecipe}
                        className="mt-8 w-full rounded-full bg-pink-500 px-6 py-4 text-lg font-black text-white shadow-[0_10px_25px_rgba(244,114,182,0.35)] transition hover:scale-[1.01] hover:bg-pink-600"
                    >
                        {t.createRecipe.save}
                    </button>
                </div>

                <aside className="h-fit rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.15)] sm:p-6">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                        {t.createRecipe.summary}
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-pink-500">
                        {recipeName || t.createRecipe.newRecipe} ♡
                    </h2>

                    <p className="mt-1 text-sm font-semibold text-rose-500">
                        {safeServings} {t.common.servings}
                    </p>

                    <div className="mt-6 space-y-3">
                        <div className="rounded-2xl bg-orange-50 p-4">
                            <p className="text-xs font-bold uppercase text-orange-400">
                                {t.recipeDetails.caloriesServing}
                            </p>
                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {Math.round(perServing.calories)} kcal
                            </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 p-4">
                            <p className="text-xs font-bold uppercase text-purple-400">
                                {t.recipeDetails.proteinServing}
                            </p>
                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {perServing.protein.toFixed(1)} g
                            </p>
                        </div>

                        <div className="rounded-2xl bg-pink-50 p-4">
                            <p className="text-xs font-bold uppercase text-pink-400">
                                {t.recipeDetails.costServing}
                            </p>
                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {perServing.cost.toFixed(2)} €
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-pink-100 bg-rose-50/60 p-4">
                        <p className="text-sm font-black text-pink-500">{t.createRecipe.totalRecipe}</p>

                        <div className="mt-3 space-y-1 text-sm font-semibold text-rose-700">
                            <p>{Math.round(totals.calories)} kcal {t.common.total}</p>
                            <p>{totals.protein.toFixed(1)} g {t.common.protein} {t.common.total}</p>
                            <p>{totals.cost.toFixed(2)} € {t.common.cost} {t.common.total}</p>
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    );
}
