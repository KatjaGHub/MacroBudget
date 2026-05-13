"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

const ingredientTypes = [
    { emoji: "🍗", label: "Protein" },
    { emoji: "🥬", label: "Produce" },
    { emoji: "🥛", label: "Dairy" },
    { emoji: "🛒", label: "Store bought" },
];

export default function CreateIngredientPage() {
    const [name, setName] = useState("");
    const [emoji, setEmoji] = useState("🍗");

    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fat, setFat] = useState("");
    const [cost, setCost] = useState("");
    const [unit, setUnit] = useState<"g" | "pcs">("g");

    const selectedType =
        ingredientTypes.find((type) => type.emoji === emoji) ?? ingredientTypes[0];

    return (
        <main className="mx-auto max-w-6xl p-6">
            <Link
                href="/ingredients"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-pink-500 shadow-sm transition hover:bg-pink-50"
            >
                <ArrowLeft size={16} />
                Back to ingredients
            </Link>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white/80 p-8 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    ingredient builder
                </p>

                <h1 className="mt-2 text-5xl font-black text-pink-500">
                    Create Ingredient ♡
                </h1>

                <p className="mt-3 text-rose-700">
                    Add nutrition values and cost per 100g.
                </p>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="rounded-[2rem] border border-pink-100 bg-white/85 p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                    <div>
                        <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
                            Ingredient name
                        </label>

                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Greek yogurt"
                            className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 text-lg font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                        />
                    </div>

                    <div className="mt-6">
                        <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
                            Ingredient type
                        </label>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {ingredientTypes.map((type) => (
                                <button
                                    key={type.emoji}
                                    type="button"
                                    onClick={() => setEmoji(type.emoji)}
                                    className={`rounded-2xl border p-4 text-left transition ${emoji === type.emoji
                                        ? "border-pink-400 bg-pink-500 text-white shadow-[0_10px_25px_rgba(244,114,182,0.3)]"
                                        : "border-pink-100 bg-pink-50 text-rose-700 hover:bg-pink-100"
                                        }`}
                                >
                                    <div className="text-3xl">{type.emoji}</div>
                                    <p className="mt-2 text-sm font-black">{type.label}</p>
                                    <p
                                        className={`mt-1 text-xs font-semibold ${emoji === type.emoji ? "text-pink-50" : "text-rose-400"
                                            }`}
                                    >
                                        {type.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6">
                        <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
                            Measurement unit
                        </label>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            {["g", "pcs"].map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setUnit(option as "g" | "pcs")}
                                    className={`rounded-2xl border p-4 text-center text-lg font-black transition ${unit === option
                                        ? "border-pink-400 bg-pink-500 text-white shadow-[0_10px_25px_rgba(244,114,182,0.3)]"
                                        : "border-pink-100 bg-pink-50 text-rose-700 hover:bg-pink-100"
                                        }`}
                                >
                                    {option === "g" ? "Grams" : "Pieces"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-bold uppercase text-orange-400">
                                Calories / {unit === "g" ? "100g" : "piece"}
                            </label>

                            <input
                                type="number"
                                value={calories}
                                onChange={(event) => setCalories(event.target.value)}
                                placeholder=""
                                className="mt-2 w-full rounded-2xl bg-orange-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold uppercase text-purple-400">
                                Protein / 100g
                            </label>

                            <input
                                type="number"
                                value={protein}
                                onChange={(event) => setProtein(event.target.value)}
                                placeholder=""
                                className="mt-2 w-full rounded-2xl bg-purple-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold uppercase text-blue-400">
                                Carbs / 100g
                            </label>

                            <input
                                type="number"
                                value={carbs}
                                onChange={(event) => setCarbs(event.target.value)}
                                placeholder=""
                                className="mt-2 w-full rounded-2xl bg-blue-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold uppercase text-yellow-500">
                                Fat / 100g
                            </label>

                            <input
                                type="number"
                                value={fat}
                                onChange={(event) => setFat(event.target.value)}
                                placeholder=""
                                className="mt-2 w-full rounded-2xl bg-yellow-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
                            {unit === "g" ? "Cost / 100g (€)" : "Cost / piece (€)"}
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            value={cost}
                            onChange={(event) => setCost(event.target.value)}
                            placeholder=""
                            className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none"
                        />
                    </div>

                    <button
                        onClick={() => {
                            alert("Later this will save to Supabase ♡");
                        }}
                        className="mt-8 w-full rounded-full bg-pink-500 px-6 py-4 text-lg font-black text-white shadow-[0_10px_25px_rgba(244,114,182,0.35)] transition hover:scale-[1.01] hover:bg-pink-600"
                    >
                        Save Ingredient ♡
                    </button>
                </div>

                <aside className="h-fit rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                        ingredient preview
                    </p>

                    <div className="mt-5 flex items-center gap-4">
                        <div className="rounded-full bg-pink-100 px-4 py-3 text-4xl">
                            {emoji}
                        </div>

                        <div>
                            <h2 className="text-3xl font-black text-pink-500">
                                {name || "New ingredient"} ♡
                            </h2>

                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="rounded-2xl bg-orange-50 p-4">
                            <p className="text-xs font-bold uppercase text-orange-400">
                                Calories
                            </p>

                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {calories || 0} kcal / {unit === "g" ? "100g" : "piece"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 p-4">
                            <p className="text-xs font-bold uppercase text-purple-400">
                                Protein
                            </p>

                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {protein || 0} g / {unit === "g" ? "100g" : "piece"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-blue-50 p-4">
                            <p className="text-xs font-bold uppercase text-blue-400">
                                Carbs
                            </p>

                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {carbs || 0} g
                            </p>
                        </div>

                        <div className="rounded-2xl bg-yellow-50 p-4">
                            <p className="text-xs font-bold uppercase text-yellow-500">
                                Fat
                            </p>

                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {fat || 0} g
                            </p>
                        </div>

                        <div className="rounded-2xl bg-pink-50 p-4">
                            <p className="text-xs font-bold uppercase text-pink-400">
                                Cost
                            </p>

                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {cost || 0} € / {unit === "g" ? "100g" : "piece"}
                            </p>
                        </div>
                    </div>
                </aside>
            </section>
        </main>
    );
}