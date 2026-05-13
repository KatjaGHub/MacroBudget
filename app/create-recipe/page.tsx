"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const ingredientDatabase = [
    {
        name: "Chicken breast",
        caloriesPer100g: 110,
        proteinPer100g: 23,
        costPer100g: 0.85,
    },
    {
        name: "Rice",
        caloriesPer100g: 130,
        proteinPer100g: 2,
        costPer100g: 0.2,
    },
    {
        name: "Curry sauce",
        caloriesPer100g: 95,
        proteinPer100g: 2,
        costPer100g: 0.45,
    },
    {
        name: "Greek yogurt",
        caloriesPer100g: 59,
        proteinPer100g: 10,
        costPer100g: 0.4,
    },
    {
        name: "Banana",
        caloriesPer100g: 89,
        proteinPer100g: 1,
        costPer100g: 0.25,
    },
];

type RecipeIngredient = {
    id: number;
    name: string;
    amount: number;
};

export default function CreateRecipePage() {
    const [recipeName, setRecipeName] = useState("");
    const [servings, setServings] = useState(4);
    const [instructions, setInstructions] = useState("");

    const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
        { id: 1, name: "Chicken breast", amount: 600 },
        { id: 2, name: "Curry sauce", amount: 300 },
    ]);

    const totals = useMemo(() => {
        return ingredients.reduce(
            (sum, ingredient) => {
                const found = ingredientDatabase.find(
                    (item) => item.name === ingredient.name
                );

                if (!found) return sum;

                const multiplier = ingredient.amount / 100;

                return {
                    calories: sum.calories + found.caloriesPer100g * multiplier,
                    protein: sum.protein + found.proteinPer100g * multiplier,
                    cost: sum.cost + found.costPer100g * multiplier,
                };
            },
            { calories: 0, protein: 0, cost: 0 }
        );
    }, [ingredients]);

    const safeServings = Math.max(1, servings);

    const perServing = {
        calories: totals.calories / safeServings,
        protein: totals.protein / safeServings,
        cost: totals.cost / safeServings,
    };

    const addIngredient = () => {
        setIngredients([
            ...ingredients,
            {
                id: Date.now(),
                name: "",
                amount: 100,
            },
        ]);
    };

    const updateIngredient = (
        id: number,
        field: "name" | "amount",
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

    return (
        <main className="mx-auto max-w-6xl p-6">
            <Link
                href="/recipes"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-pink-500 shadow-sm transition hover:bg-pink-50"
            >
                <ArrowLeft size={16} />
                Back to recipes
            </Link>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white/80 p-8 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    recipe builder
                </p>

                <h1 className="mt-2 text-5xl font-black text-pink-500">
                    Create Recipe ♡
                </h1>

                <p className="mt-3 text-rose-700">
                    Build recipes from ingredients and calculate calories, protein and
                    cost per serving.
                </p>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="rounded-[2rem] border border-pink-100 bg-white/85 p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                    <div className="grid gap-5 md:grid-cols-[1fr_160px]">
                        <div>
                            <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
                                Recipe name
                            </label>

                            <input
                                value={recipeName}
                                onChange={(event) => setRecipeName(event.target.value)}
                                placeholder=""
                                className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 text-lg font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
                                Servings
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={servings}
                                onChange={(event) =>
                                    setServings(Math.max(1, Number(event.target.value)))
                                }
                                className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 text-lg font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-pink-500">
                                Ingredients
                            </h2>

                            <button
                                onClick={addIngredient}
                                className="inline-flex items-center gap-2 rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:scale-105 hover:bg-pink-600"
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {ingredients.map((ingredient) => (
                                <div
                                    key={ingredient.id}
                                    className="grid gap-3 rounded-2xl bg-pink-50 p-3 md:grid-cols-[1fr_140px_auto]"
                                >
                                    <select
                                        value={ingredient.name}
                                        onChange={(event) =>
                                            updateIngredient(
                                                ingredient.id,
                                                "name",
                                                event.target.value
                                            )
                                        }
                                        className="rounded-xl bg-white px-4 py-3 font-semibold text-rose-950 outline-none"
                                    >
                                        <option value="">Choose ingredient</option>

                                        {ingredientDatabase.map((item) => (
                                            <option key={item.name} value={item.name}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>

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
                                        placeholder="grams"
                                        className="rounded-xl bg-white px-4 py-3 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                                    />

                                    <button
                                        onClick={() => deleteIngredient(ingredient.id)}
                                        className="flex items-center justify-center rounded-xl p-3 text-rose-300 transition hover:bg-rose-100 hover:text-rose-500"
                                        aria-label={`Delete ${ingredient.name}`}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
                            Instructions
                        </label>

                        <textarea
                            value={instructions}
                            onChange={(event) => setInstructions(event.target.value)}
                            placeholder="Write cooking steps here..."
                            className="mt-2 min-h-40 w-full rounded-2xl bg-pink-50 px-5 py-4 text-lg font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                        />
                    </div>

                    <button
                        onClick={() => alert("Later this will save to Supabase ♡")}
                        className="mt-8 w-full rounded-full bg-pink-500 px-6 py-4 text-lg font-black text-white shadow-[0_10px_25px_rgba(244,114,182,0.35)] transition hover:scale-[1.01] hover:bg-pink-600"
                    >
                        Save Recipe ♡
                    </button>
                </div>

                <aside className="h-fit rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                        recipe summary
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-pink-500">
                        {recipeName || "New recipe"} ♡
                    </h2>

                    <p className="mt-1 text-sm font-semibold text-rose-500">
                        {safeServings} servings
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
                    </div>

                    <div className="mt-5 rounded-2xl border border-pink-100 bg-rose-50/60 p-4">
                        <p className="text-sm font-black text-pink-500">Total recipe</p>

                        <div className="mt-3 space-y-1 text-sm font-semibold text-rose-700">
                            <p>{Math.round(totals.calories)} kcal total</p>
                            <p>{totals.protein.toFixed(1)} g protein total</p>
                            <p>{totals.cost.toFixed(2)} € total cost</p>
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    );
}