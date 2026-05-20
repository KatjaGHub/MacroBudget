"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChefHat, ShoppingBag, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getHouseholdId } from "@/lib/getHouseholdId";

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
    recipe_ingredients: RecipeIngredient[];
};

type MealPlanItem = {
    id: number;
    date: string;
    meal_type: string;
    item_type: "recipe" | "ingredient";
    recipe_id: number | null;
    ingredient_id: number | null;
    amount: number;
};

type ShoppingItem = {
    id: number;
    name: string;
    quantity: string | null;
    is_checked: boolean;
};

type MealDetails = {
    id: number;
    name: string;
    mealType: string;
    calories: number;
    protein: number;
    cost: number;
};

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default function DashboardPage() {
    const [name, setName] = useState("");
    const [todayMeals, setTodayMeals] = useState<MealDetails[]>([]);
    const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
    const [weeklyCost, setWeeklyCost] = useState(0);
    const [weeklyMealsCount, setWeeklyMealsCount] = useState(0);

    useEffect(() => {
        const fetchDashboard = async () => {
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData.session?.user.id;

            if (!userId) return;

            const { data: profileData } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", userId)
                .single();

            setName(profileData?.full_name ?? "you");

            const householdId = await getHouseholdId();

            if (!householdId) return;

            const { data: ingredientsData } = await supabase
                .from("ingredients")
                .select("id, name, unit, calories, protein, cost")
                .eq("household_id", householdId);

            const { data: recipesData } = await supabase
                .from("recipes")
                .select(
                    `
          id,
          name,
          servings,
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
                .eq("household_id", householdId);

            const { data: shoppingData } = await supabase
                .from("shopping_items")
                .select("*")
                .eq("household_id", householdId)
                .eq("is_checked", false)
                .order("created_at", { ascending: false });

            setShoppingItems((shoppingData ?? []) as ShoppingItem[]);

            const today = formatDate(new Date());

            const endOfWeek = new Date();
            endOfWeek.setDate(endOfWeek.getDate() + 7);

            const { data: mealData } = await supabase
                .from("meal_plan_items")
                .select("*")
                .eq("household_id", householdId)
                .gte("date", today)
                .lte("date", formatDate(endOfWeek));

            const ingredients = (ingredientsData ?? []) as Ingredient[];
            const recipes = (recipesData ?? []) as Recipe[];
            const mealItems = (mealData ?? []) as MealPlanItem[];

            const calculateMeal = (meal: MealPlanItem) => {
                if (meal.item_type === "ingredient") {
                    const ingredient = ingredients.find(
                        (item) => item.id === meal.ingredient_id
                    );

                    if (!ingredient) return null;

                    const multiplier =
                        ingredient.unit === "g" ? meal.amount / 100 : meal.amount;

                    return {
                        id: meal.id,
                        name: ingredient.name,
                        mealType: meal.meal_type,
                        calories: ingredient.calories * multiplier,
                        protein: ingredient.protein * multiplier,
                        cost: ingredient.cost * multiplier,
                    };
                }

                const recipe = recipes.find((item) => item.id === meal.recipe_id);

                if (!recipe) return null;

                const recipeTotals = recipe.recipe_ingredients.reduce(
                    (sum, recipeIngredient) => {
                        const ingredient = recipeIngredient.ingredients;

                        if (!ingredient) return sum;

                        const multiplier =
                            ingredient.unit === "g"
                                ? recipeIngredient.amount / 100
                                : recipeIngredient.amount;

                        return {
                            calories: sum.calories + ingredient.calories * multiplier,
                            protein: sum.protein + ingredient.protein * multiplier,
                            cost: sum.cost + ingredient.cost * multiplier,
                        };
                    },
                    { calories: 0, protein: 0, cost: 0 }
                );

                return {
                    id: meal.id,
                    name: recipe.name,
                    mealType: meal.meal_type,
                    calories: (recipeTotals.calories / recipe.servings) * meal.amount,
                    protein: (recipeTotals.protein / recipe.servings) * meal.amount,
                    cost: (recipeTotals.cost / recipe.servings) * meal.amount,
                };
            };

            const calculatedMeals = mealItems
                .map(calculateMeal)
                .filter(Boolean) as MealDetails[];

            const calculatedTodayMeals = calculatedMeals.filter((meal) =>
                mealItems.some((item) => item.id === meal.id && item.date === today)
            );

            setTodayMeals(calculatedTodayMeals);
            setWeeklyMealsCount(calculatedMeals.length);
            setWeeklyCost(
                calculatedMeals.reduce((sum, meal) => sum + meal.cost, 0)
            );
        };

        fetchDashboard();
    }, []);

    const todayCalories = todayMeals.reduce(
        (sum, meal) => sum + meal.calories,
        0
    );

    const todayProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const todayCost = todayMeals.reduce((sum, meal) => sum + meal.cost, 0);

    return (
        <main className="mx-auto max-w-6xl p-6">
            <section className="rounded-[2rem] border border-pink-100 bg-white/80 p-8 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    dashboard
                </p>

                <h1 className="mt-2 text-5xl font-black text-pink-500">
                    Welcome, {name} ♡
                </h1>

                <p className="mt-3 text-lg font-semibold text-rose-600">
                    Your household meal budget at a glance.
                </p>
            </section>

            <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[2rem] bg-orange-50 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-black uppercase tracking-wide text-orange-400">
                            Today calories
                        </p>
                        <Sparkles className="text-orange-400" size={22} />
                    </div>

                    <p className="mt-3 text-4xl font-black text-rose-950">
                        {Math.round(todayCalories)}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-rose-500">
                        kcal planned today
                    </p>
                </div>

                <div className="rounded-[2rem] bg-purple-50 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-black uppercase tracking-wide text-purple-400">
                            Protein
                        </p>
                        <ChefHat className="text-purple-400" size={22} />
                    </div>

                    <p className="mt-3 text-4xl font-black text-rose-950">
                        {todayProtein.toFixed(1)}g
                    </p>

                    <p className="mt-1 text-sm font-semibold text-rose-500">
                        planned today
                    </p>
                </div>

                <div className="rounded-[2rem] bg-pink-50 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-black uppercase tracking-wide text-pink-400">
                            Today cost
                        </p>
                        <CalendarDays className="text-pink-400" size={22} />
                    </div>

                    <p className="mt-3 text-4xl font-black text-rose-950">
                        {todayCost.toFixed(2)}€
                    </p>

                    <p className="mt-1 text-sm font-semibold text-rose-500">
                        estimated today
                    </p>
                </div>

                <div className="rounded-[2rem] bg-rose-50 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-black uppercase tracking-wide text-rose-400">
                            Shopping
                        </p>
                        <ShoppingBag className="text-rose-400" size={22} />
                    </div>

                    <p className="mt-3 text-4xl font-black text-rose-950">
                        {shoppingItems.length}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-rose-500">
                        items left to buy
                    </p>
                </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                    <h2 className="text-3xl font-black text-pink-500">
                        Today&apos;s meals ♡
                    </h2>

                    <div className="mt-6 space-y-3">
                        {todayMeals.length === 0 ? (
                            <p className="rounded-2xl bg-pink-50 p-4 font-semibold text-rose-400">
                                No meals planned for today yet.
                            </p>
                        ) : (
                            todayMeals.map((meal) => (
                                <div
                                    key={meal.id}
                                    className="rounded-2xl bg-pink-50 p-4"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-black text-rose-950">
                                                {meal.name}
                                            </p>
                                            <p className="text-sm font-semibold text-rose-500">
                                                {meal.mealType}
                                            </p>
                                        </div>

                                        <p className="text-sm font-black text-pink-500">
                                            {meal.cost.toFixed(2)} €
                                        </p>
                                    </div>

                                    <p className="mt-2 text-xs font-bold text-rose-500">
                                        {Math.round(meal.calories)} kcal ·{" "}
                                        {meal.protein.toFixed(1)}g protein
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                        week preview
                    </p>

                    <h2 className="mt-2 text-3xl font-black text-pink-500">
                        Next 7 days ♡
                    </h2>

                    <div className="mt-6 space-y-3">
                        <div className="rounded-2xl bg-orange-50 p-4">
                            <p className="text-xs font-bold uppercase text-orange-400">
                                Planned meals
                            </p>
                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {weeklyMealsCount}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-pink-50 p-4">
                            <p className="text-xs font-bold uppercase text-pink-400">
                                Estimated cost
                            </p>
                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {weeklyCost.toFixed(2)} €
                            </p>
                        </div>

                        <a
                            href="/meal-plan"
                            className="block rounded-full bg-pink-500 px-5 py-3 text-center font-black text-white transition hover:bg-pink-600"
                        >
                            Open meal plan
                        </a>
                    </div>
                </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                    <h2 className="text-3xl font-black text-pink-500">
                        Shopping preview ♡
                    </h2>

                    <div className="mt-6 space-y-3">
                        {shoppingItems.length === 0 ? (
                            <p className="rounded-2xl bg-rose-50 p-4 font-semibold text-rose-400">
                                Shopping list is clear.
                            </p>
                        ) : (
                            shoppingItems.slice(0, 5).map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between rounded-2xl bg-rose-50 p-4"
                                >
                                    <p className="font-black text-rose-950">{item.name}</p>
                                    {item.quantity && (
                                        <p className="text-sm font-bold text-rose-400">
                                            {item.quantity}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}

                        <a
                            href="/shopping-list"
                            className="block rounded-full bg-rose-400 px-5 py-3 text-center font-black text-white transition hover:bg-rose-500"
                        >
                            Open shopping list
                        </a>
                    </div>
                </div>

                <div className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                    <h2 className="text-3xl font-black text-pink-500">
                        Quick actions ♡
                    </h2>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <a
                            href="/create-recipe"
                            className="rounded-2xl bg-pink-500 p-5 text-white shadow-sm transition hover:scale-[1.02]"
                        >
                            <p className="text-2xl font-black">Create Recipe</p>
                            <p className="mt-1 text-sm font-semibold text-pink-100">
                                Add a new meal
                            </p>
                        </a>

                        <a
                            href="/create-ingredient"
                            className="rounded-2xl bg-purple-500 p-5 text-white shadow-sm transition hover:scale-[1.02]"
                        >
                            <p className="text-2xl font-black">Add Ingredient</p>
                            <p className="mt-1 text-sm font-semibold text-purple-100">
                                Expand your database
                            </p>
                        </a>

                        <a
                            href="/meal-plan"
                            className="rounded-2xl bg-orange-400 p-5 text-white shadow-sm transition hover:scale-[1.02]"
                        >
                            <p className="text-2xl font-black">Plan Week</p>
                            <p className="mt-1 text-sm font-semibold text-orange-100">
                                Schedule meals
                            </p>
                        </a>

                        <a
                            href="/shopping-list"
                            className="rounded-2xl bg-rose-400 p-5 text-white shadow-sm transition hover:scale-[1.02]"
                        >
                            <p className="text-2xl font-black">Shop</p>
                            <p className="mt-1 text-sm font-semibold text-rose-100">
                                Check groceries
                            </p>
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}