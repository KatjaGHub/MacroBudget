export default function Home() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-4xl text-rose-950 font-bold">Dashboard</h1>

      <p className="mt-2 text-stone-600">
        Made for easier tracking during weight loss and budgeting.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-rose-500">Today&apos;s calories</p>
          <p className="mt-2 text-3xl font-black text-rose-950">0 kcal</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-rose-500">Today&apos;s protein</p>
          <p className="mt-2 text-3xl font-black text-rose-950">0 g</p>
          
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-rose-500">Today&apos;s cost</p>
          <p className="mt-2 text-3xl font-black text-rose-950">0.00 €</p>
        </div>
      </div>
    </main>
  );
}