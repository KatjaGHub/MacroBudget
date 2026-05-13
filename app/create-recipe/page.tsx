import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateRecipePage() {
    return (
        <main className="mx-auto max-w-3xl p-6">
            <Link
                href="/recipes"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-pink-500 shadow-sm transition hover:bg-pink-50"
            >
                <ArrowLeft size={16} />
                Back to recipes
            </Link>

            <section className="mt-8 rounded-[2rem] border border-pink-100 bg-white/80 p-8 shadow-[0_10px_30px_rgba(244,114,182,0.15)]">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-pink-400">
                    recipe builder
                </p>

                <h1 className="mt-2 text-5xl font-black text-pink-500">
                    Create Recipe ♡
                </h1>

                <p className="mt-3 text-rose-700">
                    Build recipes from ingredients, servings and notes.
                </p>
            </section>
        </main>
    );
}