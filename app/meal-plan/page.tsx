"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
type ItemType = "recipe" | "ingredient";

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
  mealType: MealType;
  itemType: ItemType;
  itemId: number;
  amount: number;
};

type MealPlanRow = {
  id: number;
  date: string;
  meal_type: MealType;
  item_type: ItemType;
  recipe_id: number | null;
  ingredient_id: number | null;
  amount: number;
  household_id: number | null;
};

const mealTypes: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function prettyDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function MealPlanPage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + weekOffset * 7 + index);

      return {
        date: formatDate(date),
        label: prettyDate(date),
        shortLabel: date.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
        }),
      };
    });
  }, [weekOffset]);

  const today = formatDate(new Date());
  const weekLabel = `${weekDays[0].label} - ${weekDays[6].label}`;

  const [selectedDate, setSelectedDate] = useState(today);
  const [mealType, setMealType] = useState<MealType>("Lunch");
  const [itemType, setItemType] = useState<ItemType>("recipe");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [amount, setAmount] = useState("1");
  const [expandedMeals, setExpandedMeals] = useState<MealType[]>([]);

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [planItems, setPlanItems] = useState<MealPlanItem[]>([]);
  const [householdId, setHouseholdId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) return;

      const { data: membershipData, error: membershipError } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (membershipError) {
        alert(membershipError.message);
        return;
      }

      const currentHouseholdId = membershipData.household_id;
      setHouseholdId(currentHouseholdId);

      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from("ingredients")
        .select("id, name, unit, calories, protein, cost")
        .eq("household_id", currentHouseholdId)
        .order("name", { ascending: true });

      if (ingredientsError) {
        alert(ingredientsError.message);
        return;
      }

      const { data: recipesData, error: recipesError } = await supabase
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
        .eq("household_id", currentHouseholdId)
        .order("name", { ascending: true });

      if (recipesError) {
        alert(recipesError.message);
        return;
      }

      const { data: mealPlanData, error: mealPlanError } = await supabase
        .from("meal_plan_items")
        .select("*")
        .eq("household_id", currentHouseholdId);

      if (mealPlanError) {
        alert(mealPlanError.message);
        return;
      }

      setIngredients((ingredientsData ?? []) as Ingredient[]);
      setRecipes((recipesData ?? []) as Recipe[]);
      setPlanItems(
        ((mealPlanData ?? []) as MealPlanRow[]).map((item) => ({
          id: item.id,
          date: item.date,
          mealType: item.meal_type,
          itemType: item.item_type,
          itemId:
            item.item_type === "recipe"
              ? Number(item.recipe_id)
              : Number(item.ingredient_id),
          amount: Number(item.amount),
        }))
      );
    };

    fetchData();
  }, []);

  const getItemDetails = (item: MealPlanItem) => {
    if (item.itemType === "ingredient") {
      const ingredient = ingredients.find(
        (ingredient) => ingredient.id === item.itemId
      );

      if (!ingredient) return null;

      const multiplier =
        ingredient.unit === "g" ? item.amount / 100 : item.amount;

      return {
        name: ingredient.name,
        subtitle: `${item.amount} ${ingredient.unit === "g" ? "g" : "pcs"}`,
        calories: ingredient.calories * multiplier,
        protein: ingredient.protein * multiplier,
        cost: ingredient.cost * multiplier,
      };
    }

    const recipe = recipes.find((recipe) => recipe.id === item.itemId);

    if (!recipe) return null;

    const totals = recipe.recipe_ingredients.reduce(
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
      name: recipe.name,
      subtitle: `${item.amount} serving${item.amount === 1 ? "" : "s"}`,
      calories: (totals.calories / recipe.servings) * item.amount,
      protein: (totals.protein / recipe.servings) * item.amount,
      cost: (totals.cost / recipe.servings) * item.amount,
    };
  };

  const getTotals = (items: MealPlanItem[]) => {
    return items.reduce(
      (sum, item) => {
        const details = getItemDetails(item);

        if (!details) return sum;

        return {
          calories: sum.calories + details.calories,
          protein: sum.protein + details.protein,
          cost: sum.cost + details.cost,
        };
      },
      { calories: 0, protein: 0, cost: 0 }
    );
  };

  const selectedDayItems = planItems.filter(
    (item) => item.date === selectedDate
  );

  const selectedDayTotals = getTotals(selectedDayItems);
  const selectedDayLabel = prettyDate(new Date(selectedDate));

  const addMealItem = async () => {
    if (!selectedItemId) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      alert("You need to be logged in.");
      return;
    }
    if (!householdId) {
      alert("No household found.");
      return;
    }

    const itemAmount = Number(amount) || 1;

    const { data, error } = await supabase
      .from("meal_plan_items")
      .insert({
        user_id: userId,
        household_id: householdId,
        date: selectedDate,
        meal_type: mealType,
        item_type: itemType,
        recipe_id: itemType === "recipe" ? Number(selectedItemId) : null,
        ingredient_id: itemType === "ingredient" ? Number(selectedItemId) : null,
        amount: itemAmount,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const savedItem = data as MealPlanRow;

    setPlanItems([
      ...planItems,
      {
        id: savedItem.id,
        date: savedItem.date,
        mealType: savedItem.meal_type,
        itemType: savedItem.item_type,
        itemId:
          savedItem.item_type === "recipe"
            ? Number(savedItem.recipe_id)
            : Number(savedItem.ingredient_id),
        amount: Number(savedItem.amount),
      },
    ]);

    setSelectedItemId("");
    setAmount("1");
  };

  const deleteMealItem = async (id: number) => {
    const { error } = await supabase
      .from("meal_plan_items")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setPlanItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  };

  const toggleMeal = (type: MealType) => {
    setExpandedMeals((currentMeals) =>
      currentMeals.includes(type)
        ? currentMeals.filter((meal) => meal !== type)
        : [...currentMeals, type]
    );
  };

  const availableItems = itemType === "recipe" ? recipes : ingredients;

  return (
    <main className="mx-auto max-w-6xl p-6">


      <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
          selected day
        </p>

        <h2 className="mt-2 text-4xl font-black text-pink-500">
          {selectedDayLabel} ♡
        </h2>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-orange-50 p-4">
            <p className="text-xs font-bold uppercase text-orange-400">
              Calories
            </p>
            <p className="mt-1 text-2xl font-black text-rose-950">
              {Math.round(selectedDayTotals.calories)} kcal
            </p>
          </div>

          <div className="rounded-2xl bg-purple-50 p-4">
            <p className="text-xs font-bold uppercase text-purple-400">
              Protein
            </p>
            <p className="mt-1 text-2xl font-black text-rose-950">
              {selectedDayTotals.protein.toFixed(1)} g
            </p>
          </div>

          <div className="rounded-2xl bg-pink-50 p-4">
            <p className="text-xs font-bold uppercase text-pink-400">
              Cost
            </p>
            <p className="mt-1 text-2xl font-black text-rose-950">
              {selectedDayTotals.cost.toFixed(2)} €
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {mealTypes.map((type) => {
            const items = selectedDayItems.filter(
              (item) => item.mealType === type
            );
            const totals = getTotals(items);
            const isExpanded = expandedMeals.includes(type);

            return (
              <div
                key={type}
                className="rounded-2xl border border-pink-100 bg-pink-50/60 p-4"
              >
                <button
                  onClick={() => toggleMeal(type)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div>
                    <p className="text-lg font-black text-rose-950">{type}</p>
                    <p className="text-sm font-semibold text-rose-500">
                      {items.length === 0
                        ? "No items planned"
                        : items
                          .map((item) => getItemDetails(item)?.name)
                          .join(", ")}
                    </p>
                  </div>

                  <span className="text-xl font-black text-pink-500">
                    {isExpanded ? "−" : "+"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    {items.length === 0 ? (
                      <p className="rounded-xl bg-white p-3 text-sm font-semibold text-rose-400">
                        Nothing planned for this meal yet.
                      </p>
                    ) : (
                      items.map((item) => {
                        const details = getItemDetails(item);

                        if (!details) return null;

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-xl bg-white p-3"
                          >
                            <div>
                              <p className="font-black text-rose-950">
                                {details.name}
                              </p>

                              <p className="text-sm font-semibold text-rose-500">
                                {details.subtitle}
                              </p>

                              <p className="mt-1 text-xs font-bold text-pink-400">
                                {Math.round(details.calories)} kcal ·{" "}
                                {details.protein.toFixed(1)}g protein ·{" "}
                                {details.cost.toFixed(2)} €
                              </p>
                            </div>

                            <button
                              onClick={() => deleteMealItem(item.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-500 transition hover:bg-rose-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })
                    )}

                    {items.length > 0 && (
                      <div className="rounded-xl bg-white p-3 text-sm font-black text-rose-700">
                        Total: {Math.round(totals.calories)} kcal ·{" "}
                        {totals.protein.toFixed(1)}g protein ·{" "}
                        {totals.cost.toFixed(2)} €
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 flex items-center justify-between rounded-[2rem] border border-pink-100 bg-white p-4 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
        <button
          onClick={() => setWeekOffset((current) => current - 1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 text-pink-500 transition hover:bg-pink-200"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-pink-400">
            week
          </p>
          <p className="mt-1 text-lg font-black text-rose-950">{weekLabel}</p>
        </div>

        <button
          onClick={() => setWeekOffset((current) => current + 1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 text-pink-500 transition hover:bg-pink-200"
        >
          <ChevronRight size={22} />
        </button>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {weekDays.map((day) => (
          <button
            key={day.date}
            onClick={() => setSelectedDate(day.date)}
            className={`rounded-2xl border p-4 text-left transition ${selectedDate === day.date
              ? "border-pink-400 bg-pink-500 text-white shadow-[0_10px_25px_rgba(244,114,182,0.3)]"
              : day.date === today
                ? "border-pink-300 bg-pink-100 text-rose-800 shadow-sm"
                : "border-pink-100 bg-white text-rose-700 hover:bg-pink-50"
              }`}
          >
            <p className="text-sm font-black">{day.shortLabel}</p>
            <p className="mt-1 text-xs font-semibold opacity-80">
              {planItems.filter((item) => item.date === day.date).length} items
            </p>
          </button>
        ))}
      </section>

      <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.12)]">
        <h2 className="text-3xl font-black text-pink-500">
          Add to plan ♡
        </h2>

        <p className="mt-2 text-sm font-semibold text-rose-500">
          Adding to: {selectedDayLabel}
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
              Meal
            </label>

            <select
              value={mealType}
              onChange={(event) => setMealType(event.target.value as MealType)}
              className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none"
            >
              {mealTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
              Type
            </label>

            <select
              value={itemType}
              onChange={(event) => {
                setItemType(event.target.value as ItemType);
                setSelectedItemId("");
                setAmount("1");
              }}
              className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none"
            >
              <option value="recipe">Recipe</option>
              <option value="ingredient">Ingredient</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
              {itemType === "recipe" ? "Recipe" : "Ingredient"}
            </label>

            <select
              value={selectedItemId}
              onChange={(event) => setSelectedItemId(event.target.value)}
              className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none"
            >
              <option value="">Choose item</option>

              {availableItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold uppercase tracking-wide text-pink-400">
              {itemType === "recipe" ? "Servings" : "Amount"}
            </label>

            <input
              type="number"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-2 w-full rounded-2xl bg-pink-50 px-5 py-4 font-semibold text-rose-950 outline-none"
            />
          </div>
        </div>

        <button
          onClick={addMealItem}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-pink-500 px-6 py-4 text-lg font-black text-white shadow-[0_10px_25px_rgba(244,114,182,0.35)] transition hover:scale-[1.01] hover:bg-pink-600"
        >
          <Plus size={20} strokeWidth={3} />
          Add meal
        </button>
      </section>
    </main>
  );
}