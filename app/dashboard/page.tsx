"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Scale, ShoppingBag, Sparkles, Utensils } from "lucide-react";
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

type MealDetails = {
    id: number;
    name: string;
    mealType: string;
    date: string;
    calories: number;
    protein: number;
    cost: number;
};

type ShoppingItem = {
    id: number;
    name: string;
    quantity: string | null;
    added_by: string | null;
    is_checked: boolean;
    profiles: {
        id: string;
        full_name: string;
    } | null;
};

type WeightLog = {
    id: number;
    date: string;
    weight: number;
    user_id: string;
    profiles: {
        id: string;
        full_name: string;
    } | null;
};

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export default function DashboardPage() {
    const [name, setName] = useState("");
    const [householdId, setHouseholdId] = useState<number | null>(null);
    const [userId, setUserId] = useState("");

    const [todayMeals, setTodayMeals] = useState<MealDetails[]>([]);
    const [weeklyMeals, setWeeklyMeals] = useState<MealDetails[]>([]);
    const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);

    const [newWeight, setNewWeight] = useState("");
    const [heightCm, setHeightCm] = useState("");

    const loadDashboard = async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData.session?.user.id;

        if (!currentUserId) return;

        setUserId(currentUserId);

        const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, height_cm")
            .eq("id", currentUserId)
            .maybeSingle();

        setName(profileData?.full_name ?? "there");
        setHeightCm(profileData?.height_cm ? String(profileData.height_cm) : "");

        const currentHouseholdId = await getHouseholdId();

        if (!currentHouseholdId) return;

        setHouseholdId(currentHouseholdId);

        const today = formatDate(new Date());
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const { data: ingredientsData } = await supabase
            .from("ingredients")
            .select("id, name, unit, calories, protein, cost")
            .eq("household_id", currentHouseholdId);

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
            .eq("household_id", currentHouseholdId);

        const { data: mealData } = await supabase
            .from("meal_plan_items")
            .select("*")
            .eq("household_id", currentHouseholdId)
            .gte("date", today)
            .lte("date", formatDate(endOfWeek));

        const { data: shoppingData, error: shoppingError } = await supabase
            .from("shopping_items")
            .select("id, name, quantity, added_by, is_checked")
            .eq("household_id", currentHouseholdId)
            .eq("is_checked", false)
            .order("created_at", { ascending: false });

        if (shoppingError) {
            alert(shoppingError.message);
            return;
        }

        const shoppingAddedByIds = Array.from(
            new Set((shoppingData ?? []).map((item) => item.added_by).filter(Boolean))
        ) as string[];

        let shoppingProfiles: { id: string; full_name: string }[] = [];

        if (shoppingAddedByIds.length > 0) {
            const { data: profilesData } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", shoppingAddedByIds);

            shoppingProfiles = profilesData ?? [];
        }

        const shoppingItemsWithProfiles = (shoppingData ?? []).map((item) => ({
            ...item,
            profiles:
                shoppingProfiles.find((profile) => profile.id === item.added_by) ??
                null,
        }));

        const { data: weightData, error: weightError } = await supabase
            .from("weight_logs")
            .select("id, date, weight, user_id")
            .eq("household_id", currentHouseholdId)
            .order("date", { ascending: true })
            .order("created_at", { ascending: true });

        if (weightError) {
            alert(weightError.message);
            return;
        }

        const weightUserIds = Array.from(
            new Set((weightData ?? []).map((log) => log.user_id).filter(Boolean))
        ) as string[];

        let weightProfiles: { id: string; full_name: string }[] = [];

        if (weightUserIds.length > 0) {
            const { data: profilesData } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", weightUserIds);

            weightProfiles = profilesData ?? [];
        }

        const weightLogsWithProfiles = (weightData ?? []).map((log) => ({
            ...log,
            profiles:
                weightProfiles.find((profile) => profile.id === log.user_id) ?? null,
        }));

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
                    date: meal.date,
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
                date: meal.date,
                calories: (recipeTotals.calories / recipe.servings) * meal.amount,
                protein: (recipeTotals.protein / recipe.servings) * meal.amount,
                cost: (recipeTotals.cost / recipe.servings) * meal.amount,
            };
        };

        const calculatedMeals = mealItems
            .map(calculateMeal)
            .filter(Boolean) as MealDetails[];

        setWeeklyMeals(calculatedMeals);
        setTodayMeals(calculatedMeals.filter((meal) => meal.date === today));
        setShoppingItems(shoppingItemsWithProfiles as ShoppingItem[]);
        setWeightLogs(weightLogsWithProfiles as WeightLog[]);
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const todayCalories = todayMeals.reduce(
        (sum, meal) => sum + meal.calories,
        0
    );
    const todayProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const todayCost = todayMeals.reduce((sum, meal) => sum + meal.cost, 0);
    const weeklyCost = weeklyMeals.reduce((sum, meal) => sum + meal.cost, 0);

    const myWeightLogs = weightLogs.filter((log) => log.user_id === userId);
    const latestWeight = myWeightLogs.at(-1)?.weight ?? 0;

    const bmi = useMemo(() => {
        const height = Number(heightCm);
        if (!height || !latestWeight) return 0;

        const heightMeters = height / 100;
        return latestWeight / (heightMeters * heightMeters);
    }, [heightCm, latestWeight]);

    const bmiLabel = !bmi
        ? "Add height in settings"
        : bmi < 18.5
            ? "Underweight"
            : bmi < 25
                ? "Normal range"
                : bmi < 30
                    ? "Overweight"
                    : "Obese";

    const weightChange =
        myWeightLogs.length >= 2 ? latestWeight - myWeightLogs[0].weight : 0;

    const saveWeight = async () => {
        if (!householdId || !userId || !newWeight) return;

        const { error } = await supabase.from("weight_logs").insert({
            household_id: householdId,
            user_id: userId,
            date: formatDate(new Date()),
            weight: Number(newWeight),
        });

        if (error) {
            alert(error.message);
            return;
        }

        setNewWeight("");
        loadDashboard();
    };

    const userColors = [
        "#ec4899",
        "#3b82f6",
        "#a855f7",
        "#f97316",
        "#10b981",
        "#ef4444",
        "#14b8a6",
    ];

    const weightUsers = Array.from(
        new Map(
            weightLogs.map((log) => [
                log.user_id,
                {
                    id: log.user_id,
                    name:
                        log.user_id === userId
                            ? name || "You"
                            : log.profiles?.full_name ?? "User",
                },
            ])
        ).values()
    );

    const allWeights = weightLogs.map((log) => log.weight);
    const minWeight = allWeights.length > 0 ? Math.min(...allWeights) : 0;
    const maxWeight = allWeights.length > 0 ? Math.max(...allWeights) : 1;
    const graphRange = Math.max(maxWeight - minWeight, 1);
    const graphWidth = 300;

    const getUserLogs = (selectedUserId: string) =>
        weightLogs.filter((log) => log.user_id === selectedUserId).slice(-8);

    const getPoint = (logs: WeightLog[], log: WeightLog, index: number) => {
        const x =
            logs.length === 1 ? graphWidth / 2 : (index / (logs.length - 1)) * graphWidth;

        const y = 120 - ((log.weight - minWeight) / graphRange) * 100;

        return { x, y };
    };

    const getPoints = (logs: WeightLog[]) =>
        logs
            .map((log, index) => {
                const point = getPoint(logs, log, index);
                return `${point.x},${point.y}`;
            })
            .join(" ");

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
                    Today&apos;s plan, costs, shopping and progress.
                </p>
            </section>

            <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[2rem] bg-orange-50 p-6 shadow-sm">
                    <Utensils className="text-orange-400" />
                    <p className="mt-3 text-sm font-black uppercase text-orange-400">
                        Today calories
                    </p>
                    <p className="mt-2 text-4xl font-black text-rose-950">
                        {Math.round(todayCalories)}
                    </p>
                    <p className="text-sm font-semibold text-rose-500">kcal planned</p>
                </div>

                <div className="rounded-[2rem] bg-purple-50 p-6 shadow-sm">
                    <Sparkles className="text-purple-400" />
                    <p className="mt-3 text-sm font-black uppercase text-purple-400">
                        Protein
                    </p>
                    <p className="mt-2 text-4xl font-black text-rose-950">
                        {todayProtein.toFixed(1)}g
                    </p>
                    <p className="text-sm font-semibold text-rose-500">planned today</p>
                </div>

                <div className="rounded-[2rem] bg-pink-50 p-6 shadow-sm">
                    <LineChart className="text-pink-400" />
                    <p className="mt-3 text-sm font-black uppercase text-pink-400">
                        Daily cost
                    </p>
                    <p className="mt-2 text-4xl font-black text-rose-950">
                        {todayCost.toFixed(2)}€
                    </p>
                    <p className="text-sm font-semibold text-rose-500">
                        weekly {weeklyCost.toFixed(2)}€
                    </p>
                </div>

                <div className="rounded-[2rem] bg-rose-50 p-6 shadow-sm">
                    <ShoppingBag className="text-rose-400" />
                    <p className="mt-3 text-sm font-black uppercase text-rose-400">
                        Shopping
                    </p>
                    <p className="mt-2 text-4xl font-black text-rose-950">
                        {shoppingItems.length}
                    </p>
                    <p className="text-sm font-semibold text-rose-500">items left</p>
                </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                    <h2 className="text-3xl font-black text-pink-500">
                        Today&apos;s meal plan ♡
                    </h2>

                    <div className="mt-5 space-y-3">
                        {todayMeals.length === 0 ? (
                            <p className="rounded-2xl bg-pink-50 p-4 font-semibold text-rose-400">
                                No meals planned for today.
                            </p>
                        ) : (
                            todayMeals.map((meal) => (
                                <div key={meal.id} className="rounded-2xl bg-pink-50 p-4">
                                    <div className="flex justify-between gap-4">
                                        <div>
                                            <p className="text-lg font-black text-rose-950">
                                                {meal.name}
                                            </p>
                                            <p className="text-sm font-semibold text-rose-500">
                                                {meal.mealType}
                                            </p>
                                        </div>

                                        <p className="font-black text-pink-500">
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

                    <a
                        href="/meal-plan"
                        className="mt-5 block rounded-full bg-pink-500 px-5 py-3 text-center font-black text-white transition hover:bg-pink-600"
                    >
                        View full meal plan
                    </a>
                </div>

                <div className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                    <h2 className="text-3xl font-black text-pink-500">
                        Shopping preview ♡
                    </h2>

                    <div className="mt-5 space-y-3">
                        {shoppingItems.length === 0 ? (
                            <p className="rounded-2xl bg-rose-50 p-4 font-semibold text-rose-400">
                                Shopping list is clear.
                            </p>
                        ) : (
                            shoppingItems.slice(0, 6).map((item) => (
                                <div key={item.id} className="rounded-2xl bg-rose-50 p-4">
                                    <div className="flex justify-between gap-3">
                                        <p className="font-black text-rose-950 ">{item.name}</p>
                                        {item.quantity && (
                                            <p className="text-xl font-bold text-rose-700 ">
                                                {item.quantity}
                                            </p>
                                        )}
                                    </div>

                                    <p className="mt-1 text-xs font-bold text-rose-400">
                                        added by{" "}
                                        {item.added_by === userId
                                            ? "you"
                                            : item.profiles?.full_name ?? "Someone"}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    <a
                        href="/shopping-list"
                        className="mt-5 block rounded-full bg-rose-400 px-5 py-3 text-center font-black text-white transition hover:bg-rose-500"
                    >
                        Open shopping list
                    </a>
                </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                    <Scale className="text-pink-400" />

                    <h2 className="mt-3 text-3xl font-black text-pink-500">
                        Daily weight ♡
                    </h2>

                    <div className="mt-5 grid gap-3">
                        <input
                            type="number"
                            value={newWeight}
                            onChange={(event) => setNewWeight(event.target.value)}
                            placeholder="Weight kg"
                            className="rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none placeholder:text-rose-300"
                        />

                        <button
                            onClick={saveWeight}
                            className="rounded-full bg-pink-500 px-5 py-3 font-black text-white transition hover:bg-pink-600"
                        >
                            Log weight
                        </button>
                    </div>

                    <div className="mt-5 rounded-2xl bg-pink-50 p-4">
                        <p className="text-xs font-bold uppercase text-pink-400">BMI</p>
                        <p className="mt-1 text-2xl font-black text-rose-950">
                            {bmi ? bmi.toFixed(1) : "—"}
                        </p>
                        <p className="mt-1 text-sm font-bold text-rose-500">{bmiLabel}</p>
                    </div>

                    {!heightCm && (
                        <a
                            href="/settings"
                            className="mt-3 block rounded-2xl bg-purple-50 p-4 text-sm font-bold text-purple-500"
                        >
                            For more fitness stats, update your information in settings ♡
                        </a>
                    )}
                </div>

                <div className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
                    <h2 className="text-3xl font-black text-pink-500">
                        Household weight progress ♡
                    </h2>

                    <div className="mt-5 rounded-2xl bg-pink-50 p-4">
                        {weightLogs.length < 2 ? (
                            <p className="font-semibold text-rose-400">
                                Log at least 2 weights to see household progress.
                            </p>
                        ) : (
                            <>
                                <svg viewBox="0 0 300 130" className="h-48 w-full">
                                    {weightUsers.map((user, userIndex) => {
                                        const logs = getUserLogs(user.id);
                                        const color = userColors[userIndex % userColors.length];

                                        if (logs.length < 2) return null;

                                        return (
                                            <g key={user.id}>
                                                <polyline
                                                    fill="none"
                                                    stroke={color}
                                                    strokeWidth="5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    points={getPoints(logs)}
                                                />

                                                {logs.map((log, index) => {
                                                    const point = getPoint(logs, log, index);

                                                    return (
                                                        <circle
                                                            key={log.id}
                                                            cx={point.x}
                                                            cy={point.y}
                                                            r="5"
                                                            fill={color}
                                                        />
                                                    );
                                                })}
                                            </g>
                                        );
                                    })}
                                </svg>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    {weightUsers.map((user, index) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-rose-700"
                                        >
                                            <span
                                                className="h-3 w-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        userColors[index % userColors.length],
                                                }}
                                            />
                                            {user.name}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl bg-pink-50 p-4">
                            <p className="text-xs font-bold uppercase text-pink-400">
                                Latest weight
                            </p>
                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {latestWeight ? `${latestWeight} kg` : "—"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 p-4">
                            <p className="text-xs font-bold uppercase text-purple-400">
                                Change
                            </p>
                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {myWeightLogs.length >= 2
                                    ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(
                                        1
                                    )} kg`
                                    : "—"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-2">
                        {myWeightLogs.slice(-5).map((log) => (
                            <div
                                key={log.id}
                                className="flex justify-between rounded-2xl bg-purple-50 p-3 text-sm font-bold text-rose-700"
                            >
                                <span>{log.profiles?.full_name ?? name ?? "You"}</span>
                                <span>
                                    {log.weight} kg · {log.date}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}