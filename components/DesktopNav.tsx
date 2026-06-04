"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function DesktopNav() {
  const { t } = useLanguage();

  return (
    <div className="hidden gap-2 text-sm font-semibold md:flex">
      <Link
        className="flex h-11 items-center rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
        href="/dashboard"
      >
        {t.nav.dashboard}
      </Link>
      <Link
        className="flex h-11 items-center rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
        href="/ingredients"
      >
        {t.nav.ingredients}
      </Link>
      <Link
        className="flex h-11 items-center rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
        href="/recipes"
      >
        {t.nav.recipes}
      </Link>
      <Link
        className="flex h-11 items-center rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
        href="/meal-plan"
      >
        {t.nav.mealPlan}
      </Link>
      <Link
        className="flex h-11 items-center rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
        href="/shopping-list"
      >
        {t.nav.shoppingList}
      </Link>
      <Link
        href="/settings"
        className="flex h-11 w-11 items-center justify-center rounded-full text-rose-700 transition hover:bg-pink-100"
        aria-label={t.nav.settings}
      >
        <Settings size={22} />
      </Link>
    </div>
  );
}
