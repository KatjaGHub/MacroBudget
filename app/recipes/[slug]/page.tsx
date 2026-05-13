import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { recipes } from "@/data/recipes";
import { ingredients } from "@/data/ingredients";

type RecipeDetailsPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function RecipeDetailsPage({
    params,
}: RecipeDetailsPageProps) {
    const { slug } = await params;

    const recipe = recipes.find((item) => item.slug === slug);

    if (!recipe) {
        notFound();
    }

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

    const perServing = {
        calories: totals.calories / recipe.servings,
        protein: totals.protein / recipe.servings,
        cost: totals.cost / recipe.servings,
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


                <h1 className="mt-4 text-5xl font-black text-pink-500">
                    {recipe.name} ♡
                </h1>

                <p className="mt-3 text-rose-700">{recipe.servings} servings</p>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                    <section className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                        <h2 className="text-3xl font-black text-pink-500">
                            Ingredients
                        </h2>

                        <div className="mt-5 space-y-3">
                            {recipeIngredients.map((item) => (
                                <div
                                    key={item.ingredientId}
                                    className="flex items-center justify-between rounded-2xl bg-pink-50 p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {item.ingredient?.emoji ?? "🛒"}
                                        </span>

                                        <p className="font-black text-rose-950">
                                            {item.ingredient?.name ?? "Unknown ingredient"}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-rose-500">
                                            {item.amount} {item.ingredient?.unit === "pcs" ? "pcs" : "g"}
                                        </p>

                                        {item.ingredient && (
                                            <p className="text-sm font-semibold text-pink-400">
                                                {(
                                                    item.ingredient.cost *
                                                    (item.ingredient.unit === "g" ? item.amount / 100 : item.amount)
                                                ).toFixed(2)}{" "}
                                                €
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                        <h2 className="text-3xl font-black text-pink-500">
                            Instructions
                        </h2>

                        <ol className="mt-5 space-y-3">
                            {recipe.instructions.map((step, index) => (
                                <li
                                    key={step}
                                    className="rounded-2xl bg-rose-50/70 p-4 font-semibold text-rose-800"
                                >
                                    <span className="mr-2 font-black text-pink-500">
                                        {index + 1}.
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>

                <aside className="h-fit rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
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
                    </div>
                </aside>
            </section>
        </main>
    );
}