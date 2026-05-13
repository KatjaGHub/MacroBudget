"use client";

import { useMemo, useState } from "react";
import ScrollToTop from "@/components/ScrollToTop";

const recipes = [
  {
    name: "Chicken Curry",
    emoji: "🍛",
    servings: 4,
    cost: "1.53 €",
    calories: 420,
    protein: 38,
    ingredients: ["Chicken breast", "Curry sauce", "Rice", "Cream"],
  },
  {
    name: "Greek Yogurt Bowl",
    emoji: "🥣",
    servings: 1,
    cost: "1.20 €",
    calories: 350,
    protein: 32,
    ingredients: ["Greek yogurt", "Oats", "Banana", "Honey"],
  },
  {
    name: "Protein Pancakes",
    emoji: "🥞",
    servings: 2,
    cost: "0.95 €",
    calories: 410,
    protein: 35,
    ingredients: ["Oats", "Eggs", "Protein powder", "Banana"],
  },
];

export default function RecipesPage() {
  const [search, setSearch] = useState("");

  const filteredRecipes = useMemo(() => {
    return recipes
      .filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(search.toLowerCase()) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(search.toLowerCase())
          )
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [search]);

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

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search recipes or ingredients..."
          className="mt-6 w-full rounded-full border border-pink-100 bg-white px-5 py-3 text-rose-900 shadow-sm outline-none placeholder:text-rose-300 focus:border-pink-300"
        />

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
                      <div className="mb-3 inline-flex rounded-full bg-pink-100 px-4 py-2 text-2xl">
                        {recipe.emoji}
                      </div>

                      <h3 className="text-2xl font-black text-rose-950">
                        {recipe.name}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-rose-500">
                        {recipe.servings} servings
                      </p>
                    </div>

                    <button className="rounded-full bg-pink-500 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-pink-600">
                      View ♡
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-pink-50 p-4 text-center">
                      <p className="text-xs font-bold uppercase text-pink-400">
                        Cost
                      </p>
                      <p className="mt-1 font-black text-rose-900">
                        {recipe.cost}
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
                        {recipe.protein}g
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-pink-100 bg-rose-50/50 p-4">
                    <p className="text-sm font-black text-pink-500">
                      Ingredients
                    </p>

                    <ul className="mt-3 space-y-2 text-sm text-rose-800">
                      {recipe.ingredients.map((ingredient) => (
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