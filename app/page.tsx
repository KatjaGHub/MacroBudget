export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 p-8">
      <h1 className="text-4xl font-bold text-stone-900">
        MacroBudget 🍽️
      </h1>

      <p className="mt-4 text-lg text-stone-700">
        Track meals, macros and food costs.
      </p>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Today</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-stone-100 p-4">
            <p className="text-sm text-stone-500">Calories</p>
            <p className="text-2xl font-bold">0 kcal</p>
          </div>

          <div className="rounded-xl bg-stone-100 p-4">
            <p className="text-sm text-stone-500">Protein</p>
            <p className="text-2xl font-bold">0 g</p>
          </div>

          <div className="rounded-xl bg-stone-100 p-4">
            <p className="text-sm text-stone-500">Cost</p>
            <p className="text-2xl font-bold">0.00 €</p>
          </div>
        </div>
      </div>
    </main>
  );
}