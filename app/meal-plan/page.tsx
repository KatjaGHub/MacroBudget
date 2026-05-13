import ScrollToTop from "@/components/ScrollToTop";

const days = [
  {
    day: "Monday",
    meals: [
      {
        type: "Breakfast",
        emoji: "🥣",
        name: "Greek Yogurt Bowl",
        extras: ["Banana", "Honey"],
        calories: 420,
        protein: 32,
        cost: "1.45 €",
      },
      {
        type: "Lunch",
        emoji: "🍛",
        name: "Chicken Curry",
        extras: ["Njoki", "Cucumber"],
        calories: 760,
        protein: 52,
        cost: "2.30 €",
      },
    ],
  },
  {
    day: "Tuesday",
    meals: [
      {
        type: "Dinner",
        emoji: "🍝",
        name: "Protein Pasta",
        extras: ["Parmesan"],
        calories: 640,
        protein: 41,
        cost: "2.10 €",
      },
    ],
  },
];

export default function MealPlanPage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <section className="rounded-[2rem] border border-pink-100 bg-white/80 p-8 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
          weekly planner
        </p>

        <h1 className="mt-2 text-5xl font-black text-pink-500">
          Meal Plan ♡
        </h1>

        <p className="mt-3 text-rose-700">
          Plan meals, add side dishes and track macros & costs.
        </p>
      </section>

      <section className="mt-10 space-y-10">
        {days.map((day) => (
          <div key={day.day}>
            <h2 className="mb-5 text-4xl font-black text-pink-500">
              {day.day} ♡
            </h2>

            <div className="grid gap-5">
              {day.meals.map((meal) => (
                <article
                  key={meal.name}
                  className="rounded-[2rem] border border-pink-100 bg-white p-6 shadow-[0_10px_30px_rgba(244,114,182,0.18)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex rounded-full bg-pink-100 px-4 py-2 text-2xl">
                        {meal.emoji}
                      </div>

                      <p className="mt-4 text-sm font-bold uppercase tracking-wide text-pink-400">
                        {meal.type}
                      </p>

                      <h3 className="mt-1 text-3xl font-black text-rose-950">
                        {meal.name}
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {meal.extras.map((extra) => (
                          <span
                            key={extra}
                            className="rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-500"
                          >
                            + {extra}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="rounded-full bg-pink-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-pink-600">
                      Edit ♡
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-orange-50 p-4 text-center">
                      <p className="text-xs font-bold uppercase text-orange-400">
                        Calories
                      </p>

                      <p className="mt-1 text-xl font-black text-rose-950">
                        {meal.calories}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-purple-50 p-4 text-center">
                      <p className="text-xs font-bold uppercase text-purple-400">
                        Protein
                      </p>

                      <p className="mt-1 text-xl font-black text-rose-950">
                        {meal.protein}g
                      </p>
                    </div>

                    <div className="rounded-2xl bg-pink-50 p-4 text-center">
                      <p className="text-xs font-bold uppercase text-pink-400">
                        Cost
                      </p>

                      <p className="mt-1 text-xl font-black text-rose-950">
                        {meal.cost}
                      </p>
                    </div>
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