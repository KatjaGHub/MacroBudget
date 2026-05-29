"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Scale, Sparkles, Utensils } from "lucide-react";
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

function calculateAge(birthDate: string) {
    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
        age--;
    }

    return age;
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
    const [birthDate, setBirthDate] = useState("");
    const [sex, setSex] = useState("");

    const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
    const [proteinTarget, setProteinTarget] = useState<number | null>(null);
    const [calorieTargetMode, setCalorieTargetMode] = useState<"auto" | "manual">("auto");
    const [proteinTargetMode, setProteinTargetMode] = useState<"auto" | "manual">("auto");
    const [goalWeight, setGoalWeight] = useState<number | null>(null);
    const [goalStartWeight, setGoalStartWeight] = useState<number | null>(null);
    const [showGoalAchievement, setShowGoalAchievement] = useState(false);

    const loadDashboard = async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData.session?.user.id;

        if (!currentUserId) return;

        setUserId(currentUserId);

        const { data: profileData } = await supabase
            .from("profiles")
            .select(
                "full_name, height_cm, birth_date, sex, calorie_target, protein_target, calorie_target_mode, protein_target_mode, goal_weight, goal_start_weight"
            )
            .eq("id", currentUserId)
            .maybeSingle();

        setName(profileData?.full_name ?? "there");
        setHeightCm(profileData?.height_cm ? String(profileData.height_cm) : "");
        setBirthDate(profileData?.birth_date ?? "");
        setSex(profileData?.sex ?? "");
        setCalorieTarget(profileData?.calorie_target ?? null);
        setProteinTarget(profileData?.protein_target ?? null);
        setCalorieTargetMode(profileData?.calorie_target_mode === "manual" ? "manual" : "auto");
        setProteinTargetMode(profileData?.protein_target_mode === "manual" ? "manual" : "auto");
        setGoalWeight(profileData?.goal_weight ?? null);
        setGoalStartWeight(profileData?.goal_start_weight ?? null);

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

    const todayCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const todayProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const todayCost = todayMeals.reduce((sum, meal) => sum + meal.cost, 0);
    const weeklyCost = weeklyMeals.reduce((sum, meal) => sum + meal.cost, 0);

    const myWeightLogs = weightLogs.filter((log) => log.user_id === userId);
    const latestWeight = myWeightLogs.at(-1)?.weight ?? 0;
    const age = birthDate ? calculateAge(birthDate) : 0;
    const hasFitnessProfile = Boolean(heightCm && birthDate && sex);

    const bmi = useMemo(() => {
        const height = Number(heightCm);
        if (!height || !latestWeight) return 0;

        const heightMeters = height / 100;
        return latestWeight / (heightMeters * heightMeters);
    }, [heightCm, latestWeight]);

    const healthyWeightRange = useMemo(() => {
        const height = Number(heightCm);
        if (!height) return null;

        const heightMeters = height / 100;
        return {
            min: 18.5 * heightMeters * heightMeters,
            max: 24.9 * heightMeters * heightMeters,
        };
    }, [heightCm]);

    const recommendedCalories = useMemo(() => {
        const height = Number(heightCm);
        const weight = Number(latestWeight);

        if (!height || !weight || !age) return 0;

        let bmr = 10 * weight + 6.25 * height - 5 * age - 78;

        if (sex === "male") {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        }

        if (sex === "female") {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        return Math.round(bmr * 1.2);
    }, [heightCm, latestWeight, age, sex]);

    const recommendedProtein = latestWeight ? Math.round(latestWeight * 1.6) : 0;

    const activeCalorieTarget =
        calorieTargetMode === "manual" && calorieTarget
            ? calorieTarget
            : recommendedCalories;

    const activeProteinTarget =
        proteinTargetMode === "manual" && proteinTarget
            ? proteinTarget
            : recommendedProtein;

    const calorieProgress = activeCalorieTarget
        ? Math.min((todayCalories / activeCalorieTarget) * 100, 100)
        : 0;

    const proteinProgress = activeProteinTarget
        ? Math.min((todayProtein / activeProteinTarget) * 100, 100)
        : 0;
    const calorieProgressWidth = hasFitnessProfile
        ? calorieProgress
        : todayCalories > 0
            ? 100
            : 0;
    const proteinProgressWidth = hasFitnessProfile
        ? proteinProgress
        : todayProtein > 0
            ? 100
            : 0;

    const dailyDeficit =
        recommendedCalories && activeCalorieTarget
            ? recommendedCalories - activeCalorieTarget
            : 0;

    const weeklyWeightChangeKg = (dailyDeficit * 7) / 7700;
    const goalWeightDifference = latestWeight && goalWeight ? latestWeight - goalWeight : 0;
    const goalWeightDirection =
        !goalWeightDifference ? "maintain" : goalWeightDifference > 0 ? "lose" : "gain";
    const goalWeightAligned =
        (goalWeightDirection === "lose" && weeklyWeightChangeKg > 0) ||
        (goalWeightDirection === "gain" && weeklyWeightChangeKg < 0);
    const estimatedGoalWeeks =
        goalWeightAligned && weeklyWeightChangeKg
            ? Math.abs(goalWeightDifference) / Math.abs(weeklyWeightChangeKg)
            : 0;
    const goalStartDifference =
        goalStartWeight && goalWeight ? goalStartWeight - goalWeight : 0;
    const goalStartDirection =
        !goalStartDifference ? "maintain" : goalStartDifference > 0 ? "lose" : "gain";
    const goalTotalDistance = Math.abs(goalStartDifference);
    const rawGoalProgress =
        goalStartWeight && latestWeight
            ? goalStartDirection === "lose"
                ? goalStartWeight - latestWeight
                : latestWeight - goalStartWeight
            : 0;
    const goalProgressKg = goalTotalDistance
        ? Math.min(Math.max(rawGoalProgress, 0), goalTotalDistance)
        : 0;
    const goalMilestoneStep = goalTotalDistance <= 5 ? 1 : 5;
    const goalMilestoneKg = goalTotalDistance
        ? Math.floor(goalProgressKg / goalMilestoneStep) * goalMilestoneStep
        : 0;
    const nextGoalMilestoneKg = goalTotalDistance
        ? Math.min(goalMilestoneKg + goalMilestoneStep, goalTotalDistance)
        : 0;
    const goalProgressPercent = goalTotalDistance
        ? Math.min((goalProgressKg / goalTotalDistance) * 100, 100)
        : 0;
    const goalAchievementMessage =
        goalMilestoneKg >= goalTotalDistance
            ? "Goal reached. That is a huge moment."
            : goalMilestoneKg >= 10
                ? "You are building real momentum."
                : goalMilestoneKg >= 5
                    ? "That progress is starting to stack up."
                    : "Small steps count. This one counts too.";

    useEffect(() => {
        if (!userId || !goalStartWeight || !goalWeight || goalMilestoneKg <= 0) {
            setShowGoalAchievement(false);
            return;
        }

        const achievementKey = [
            "macrobudget-goal-achievement",
            userId,
            goalStartWeight,
            goalWeight,
            goalMilestoneKg,
        ].join("-");

        if (localStorage.getItem(achievementKey)) {
            setShowGoalAchievement(false);
            return;
        }

        localStorage.setItem(achievementKey, "seen");
        setShowGoalAchievement(true);
    }, [goalMilestoneKg, goalStartWeight, goalWeight, userId]);

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

    const deleteWeightLog = async (log: WeightLog) => {
        const shouldDelete = window.confirm(
            `Remove the ${log.weight} kg entry from ${log.date}?`
        );

        if (!shouldDelete) return;

        const { error } = await supabase
            .from("weight_logs")
            .delete()
            .eq("id", log.id);

        if (error) {
            alert(error.message);
            return;
        }

        loadDashboard();
    };

    const userColors = [
        "#3b82f6",
        "#ec4899",
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
            logs.length === 1
                ? graphWidth / 2
                : (index / (logs.length - 1)) * graphWidth;

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
        <main className="mx-auto max-w-6xl px-4 py-4 sm:p-6">
            <section className="rounded-[2rem] border border-pink-100 bg-white/80 p-5 shadow-[0_10px_30px_rgba(244,114,182,0.15)] sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    dashboard
                </p>

                <h1 className="mt-2 text-3xl font-black text-pink-500 sm:text-5xl">
                    Welcome, {name} ♡
                </h1>

                <p className="mt-3 text-base font-semibold text-rose-600 sm:text-lg">
                    Today&apos;s plan, costs, shopping and progress.
                </p>
            </section>

            <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[2rem] bg-orange-50 p-5 shadow-sm sm:p-6">
                    <Utensils className="text-orange-400" />
                    <p className="mt-3 text-sm font-black uppercase text-orange-400">
                        Calories
                    </p>
                    <p className="mt-2 text-3xl font-black text-rose-950 sm:text-4xl">
                        {Math.round(todayCalories)}
                    </p>
                    <p className="text-sm font-semibold text-rose-500">
                        {hasFitnessProfile
                            ? `of ${activeCalorieTarget || "—"} kcal`
                            : "tracked today"}
                    </p>
                </div>

                <div className="rounded-[2rem] bg-purple-50 p-5 shadow-sm sm:p-6">
                    <Sparkles className="text-purple-400" />
                    <p className="mt-3 text-sm font-black uppercase text-purple-400">
                        Protein
                    </p>
                    <p className="mt-2 text-3xl font-black text-rose-950 sm:text-4xl">
                        {todayProtein.toFixed(1)}g
                    </p>
                    <p className="text-sm font-semibold text-rose-500">
                        {hasFitnessProfile
                            ? `of ${activeProteinTarget || "—"}g`
                            : "tracked today"}
                    </p>
                </div>

                <div className="rounded-[2rem] bg-pink-50 p-5 shadow-sm sm:p-6">
                    <LineChart className="text-pink-400" />
                    <p className="mt-3 text-sm font-black uppercase text-pink-400">
                        Daily cost
                    </p>
                    <p className="mt-2 text-3xl font-black text-rose-950 sm:text-4xl">
                        {todayCost.toFixed(2)}€
                    </p>
                    <p className="text-sm font-semibold text-rose-500">
                        estimated today
                    </p>
                </div>

                <div className="rounded-[2rem] bg-rose-50 p-5 shadow-sm sm:p-6">
                    <LineChart className="text-rose-400" />
                    <p className="mt-3 text-sm font-black uppercase text-rose-400">
                        Weekly cost
                    </p>
                    <p className="mt-2 text-3xl font-black text-rose-950 sm:text-4xl">
                        {weeklyCost.toFixed(2)}€
                    </p>
                    <p className="text-sm font-semibold text-rose-500">next 7 days</p>
                </div>
            </section>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
                <h2 className="text-3xl font-black text-pink-500">Daily goals ♡</h2>

                <div className="mt-5 space-y-5">
                    <div>
                        <div className="flex justify-between text-sm font-black text-rose-700">
                            <span>Calories</span>
                            <span>
                                {hasFitnessProfile
                                    ? `${Math.round(todayCalories)} / ${activeCalorieTarget || "—"} kcal`
                                    : `${Math.round(todayCalories)} kcal tracked`}
                            </span>
                        </div>

                        <div className="mt-2 h-4 overflow-hidden rounded-full bg-orange-50">
                            <div
                                className="h-full rounded-full bg-orange-400 transition-all"
                                style={{ width: `${calorieProgressWidth}%` }}
                            />
                        </div>

                        <p className="mt-2 text-sm font-semibold text-rose-500">
                            {hasFitnessProfile
                                ? calorieTargetMode === "auto"
                                    ? "Auto target updates with your latest weight."
                                    : "Manual target is fixed from settings."
                                : "Add your fitness details in settings to unlock a calorie target."}
                        </p>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm font-black text-rose-700">
                            <span>Protein</span>
                            <span>
                                {hasFitnessProfile
                                    ? `${todayProtein.toFixed(1)} / ${activeProteinTarget || "—"}g`
                                    : `${todayProtein.toFixed(1)}g tracked`}
                            </span>
                        </div>

                        <div className="mt-2 h-4 overflow-hidden rounded-full bg-purple-50">
                            <div
                                className="h-full rounded-full bg-purple-400 transition-all"
                                style={{ width: `${proteinProgressWidth}%` }}
                            />
                        </div>

                        <p className="mt-2 text-sm font-semibold text-rose-500">
                            {hasFitnessProfile
                                ? proteinTargetMode === "auto"
                                    ? "Auto target uses latest weight × 1.6g."
                                    : "Manual protein target is fixed from settings."
                                : "Add your fitness details in settings to unlock a protein target."}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-pink-50 p-4">
                        <p className="text-xs font-bold uppercase text-pink-400">
                            Estimated weekly change
                        </p>

                        <p className="mt-1 text-2xl font-black text-rose-950">
                            {!hasFitnessProfile || !recommendedCalories || !activeCalorieTarget
                                ? "Add settings info ✨"
                                : weeklyWeightChangeKg > 0
                                    ? `-${weeklyWeightChangeKg.toFixed(2)} kg/week`
                                    : weeklyWeightChangeKg < 0
                                        ? `+${Math.abs(weeklyWeightChangeKg).toFixed(2)} kg/week`
                                        : "Maintain"}
                        </p>

                        <p className="mt-1 text-sm font-bold text-rose-500">
                            {hasFitnessProfile
                                ? "based on calorie target vs estimated maintenance"
                                : "We will estimate this after you add your fitness details in settings."}
                        </p>
                    </div>
                </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
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

                <div className="rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
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
                                        <p className="font-black text-rose-950">{item.name}</p>
                                        {item.quantity && (
                                            <p className="text-xl font-bold text-rose-700">
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

            <section className="mt-8 grid items-stretch gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                {hasFitnessProfile ? (
                    <>
                        <div className="flex h-full flex-col rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
                    <Scale className="text-pink-400" />

                    <h2 className="mt-3 text-2xl font-black text-pink-500 sm:text-3xl">
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

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-orange-50 p-4">
                            <p className="text-xs font-bold uppercase text-orange-400">
                                Recommended calories
                            </p>
                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {recommendedCalories ? `${recommendedCalories} kcal` : "—"}
                            </p>
                            <p className="mt-1 text-sm font-bold text-rose-500">
                                estimated maintenance
                            </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 p-4">
                            <p className="text-xs font-bold uppercase text-purple-400">
                                Recommended protein
                            </p>
                            <p className="mt-1 text-2xl font-black text-rose-950">
                                {recommendedProtein ? `${recommendedProtein} g` : "—"}
                            </p>
                            <p className="mt-1 text-sm font-bold text-rose-500">
                                based on latest weight × 1.6g
                            </p>
                        </div>

                        <div className="rounded-2xl bg-rose-50 p-4 sm:col-span-2">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase text-rose-400">
                                        Goal weight
                                    </p>
                                    <p className="mt-1 text-2xl font-black text-rose-950">
                                        {goalWeight ? `${goalWeight} kg` : "—"}
                                    </p>
                                </div>

                                {goalStartWeight && goalWeight && latestWeight ? (
                                    <p className="rounded-full bg-white px-3 py-2 text-xs font-black text-rose-400">
                                        {goalProgressKg.toFixed(1)} / {goalTotalDistance.toFixed(1)} kg
                                    </p>
                                ) : null}
                            </div>

                            <p className="mt-2 text-sm font-bold text-rose-500">
                                {!goalWeight
                                    ? "Add a goal weight in settings."
                                    : !latestWeight
                                        ? "Log your current weight to estimate progress."
                                        : goalWeightDirection === "maintain"
                                            ? "You are at your goal weight."
                                            : goalWeightAligned
                                                ? `${Math.abs(goalWeightDifference).toFixed(1)} kg to ${goalWeightDirection}; around ${Math.ceil(estimatedGoalWeeks)} weeks`
                                                : "Adjust your calorie target to estimate this goal."}
                            </p>

                            {goalStartWeight && goalWeight && latestWeight ? (
                                <div className="mt-4">
                                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
                                        <div
                                            className="h-full rounded-full bg-pink-400 transition-all"
                                            style={{ width: `${goalProgressPercent}%` }}
                                        />
                                    </div>

                                    <p className="mt-2 text-xs font-bold text-rose-400">
                                        Next achievement at {nextGoalMilestoneKg.toFixed(1)} kg progress.
                                    </p>
                                </div>
                            ) : null}

                            {showGoalAchievement && (
                                <div className="rounded-2xl border border-pink-200 bg-pink-500 p-4 text-white shadow-[0_10px_25px_rgba(244,114,182,0.35)]">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-100">
                                        Achievement unlocked
                                    </p>

                                    <p className="mt-1 text-2xl font-black">
                                        {goalMilestoneKg.toFixed(0)} kg closer ♡
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-pink-50">
                                        {goalAchievementMessage}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl bg-pink-50 p-4 sm:col-span-2">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-bold uppercase text-pink-400">BMI</p>
                                    <p className="mt-1 text-2xl font-black text-rose-950">
                                        {bmi ? bmi.toFixed(1) : "—"}
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-rose-500">{bmiLabel}</p>
                                </div>

                                <div className="rounded-2xl bg-white/70 p-4">
                                    <p className="text-xs font-bold uppercase text-pink-400">
                                        Healthy weight range
                                    </p>
                                    <p className="mt-1 text-2xl font-black text-rose-950">
                                        {healthyWeightRange
                                            ? `${healthyWeightRange.min.toFixed(1)}-${healthyWeightRange.max.toFixed(1)} kg`
                                            : "—"}
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-rose-500">
                                        based on your height
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(!heightCm || !birthDate || !sex) && (
                        <a
                            href="/settings"
                            className="mt-3 block rounded-2xl bg-purple-50 p-4 text-sm font-bold text-purple-500"
                        >
                            For more fitness stats, update your information in settings ♡
                        </a>
                    )}
                </div>

                <div className="flex h-full flex-col rounded-[2rem] border border-pink-100 bg-white p-5 shadow-[0_10px_30px_rgba(244,114,182,0.12)] sm:p-6">
                    <h2 className="text-2xl font-black text-pink-500 sm:text-3xl">
                        Household weight progress ♡
                    </h2>

                    <div className="mt-5 flex min-h-[18rem] flex-1 flex-col rounded-2xl bg-pink-50 p-3 sm:min-h-[22rem] sm:p-4">
                        {weightLogs.length === 0 ? (
                            <p className="flex flex-1 items-center justify-center text-center font-semibold text-rose-400">
                                Log your first weight to start the graph.
                            </p>
                        ) : (
                            <>
                                <svg viewBox="0 0 300 130" className="h-56 w-full flex-1 overflow-visible sm:h-72">
                                    {weightUsers.map((user, userIndex) => {
                                        const logs = getUserLogs(user.id);
                                        const color = userColors[userIndex % userColors.length];

                                        if (logs.length === 0) return null;

                                        return (
                                            <g key={user.id}>
                                                {logs.length >= 2 ? (
                                                    <polyline
                                                        fill="none"
                                                        stroke={color}
                                                        strokeWidth="5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        points={getPoints(logs)}
                                                    />
                                                ) : null}

                                                {logs.map((log, index) => {
                                                    const point = getPoint(logs, log, index);

                                                    return (
                                                        <g key={log.id} className="group">
                                                            <circle
                                                                cx={point.x}
                                                                cy={point.y}
                                                                r="12"
                                                                fill="transparent"
                                                                className="cursor-pointer"
                                                                onClick={() => deleteWeightLog(log)}
                                                            />

                                                            <circle
                                                                cx={point.x}
                                                                cy={point.y}
                                                                r="6"
                                                                fill={color}
                                                                className="cursor-pointer"
                                                                onClick={() => deleteWeightLog(log)}
                                                            />

                                                            <foreignObject
                                                                x={point.x - 55}
                                                                y={point.y - 48}
                                                                width="110"
                                                                height="42"
                                                                className="pointer-events-none opacity-0 transition group-hover:opacity-100"
                                                            >
                                                                <div className="rounded-xl bg-white px-3 py-2 text-center text-xs font-black text-rose-700 shadow-lg">
                                                                    <p>{log.date}</p>
                                                                    <p>{log.weight} kg</p>
                                                                </div>
                                                            </foreignObject>
                                                        </g>
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
                                                    backgroundColor: userColors[index % userColors.length],
                                                }}
                                            />
                                            {user.name}
                                        </div>
                                    ))}
                                </div>

                                {weightLogs.length === 1 ? (
                                    <p className="mt-4 text-center text-sm font-bold text-rose-400">
                                        Your first weight entry is in. Log another one to draw the trend line ♡
                                    </p>
                                ) : null}
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
                                    ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg`
                                    : "—"}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 rounded-2xl bg-pink-50 p-4">
                        <p className="text-xs font-bold uppercase text-pink-400">
                            Weight lost this month
                        </p>

                        <p className="mt-1 text-2xl font-black text-rose-950">
                            {(() => {
                                const currentMonth = new Date().getMonth();
                                const currentYear = new Date().getFullYear();

                                const monthlyLogs = myWeightLogs.filter((log) => {
                                    const logDate = new Date(log.date);

                                    return (
                                        logDate.getMonth() === currentMonth &&
                                        logDate.getFullYear() === currentYear
                                    );
                                });

                                if (monthlyLogs.length < 2) {
                                    return "—";
                                }

                                const firstWeight = monthlyLogs[0].weight;
                                const latestWeight =
                                    monthlyLogs[monthlyLogs.length - 1].weight;

                                const difference = latestWeight - firstWeight;

                                if (difference < 0) {
                                    return `${Math.abs(difference).toFixed(1)} kg lost`;
                                }

                                if (difference > 0) {
                                    return `${difference.toFixed(1)} kg gained`;
                                }

                                return "No change";
                            })()}
                        </p>

                        <p className="mt-1 text-sm font-bold text-rose-500">
                            {new Date().toLocaleString("default", { month: "long" })} progress
                        </p>
                    </div>
                </div>
                    </>
                ) : (
                    <div className="rounded-[2rem] border border-pink-100 bg-gradient-to-br from-white via-pink-50 to-rose-50 p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)] lg:col-span-2 sm:p-8">
                        <p className="text-sm font-black uppercase tracking-[0.35em] text-pink-400">
                            Fitness insights
                        </p>
                        <h2 className="mt-3 text-3xl font-black text-pink-500 sm:text-4xl">
                            More fitness info is waiting ✨
                        </h2>
                        <p className="mt-3 max-w-2xl text-base font-semibold text-rose-600 sm:text-lg">
                            For more fitness information, go to settings and input some information ♡
                        </p>
                        <a
                            href="/settings"
                            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-pink-500 px-6 py-3 text-base font-black text-white transition hover:bg-pink-600 sm:w-auto"
                        >
                            Go to settings
                        </a>
                    </div>
                )}
            </section>
        </main>
    );
}
