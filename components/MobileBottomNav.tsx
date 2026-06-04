"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChartColumn,
  Carrot,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: ChartColumn,
    matches: (pathname: string) =>
      pathname === "/" || pathname.startsWith("/dashboard"),
  },
  {
    href: "/meal-plan",
    label: "Meal Plan",
    icon: UtensilsCrossed,
    matches: (pathname: string) => pathname.startsWith("/meal-plan"),
  },
  {
    href: "/shopping-list",
    label: "Shopping",
    icon: ShoppingBag,
    matches: (pathname: string) => pathname.startsWith("/shopping-list"),
  },
  {
    href: "/ingredients",
    label: "Ingredients",
    icon: Carrot,
    matches: (pathname: string) =>
      pathname.startsWith("/ingredients") ||
      pathname.startsWith("/create-ingredient"),
  },
  {
    href: "/recipes",
    label: "Recipes",
    icon: BookOpen,
    matches: (pathname: string) =>
      pathname.startsWith("/recipes") || pathname.startsWith("/create-recipe"),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-pink-100 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-md md:hidden dark:border-pink-900/60 dark:bg-[#21131d]/95">
      <div className="mx-auto flex max-w-md items-end justify-between gap-1">
        {navItems.map(({ href, label, icon: Icon, matches }) => {
          const isActive = matches(pathname);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center transition ${
                isActive
                  ? "bg-pink-500 text-white shadow-[0_10px_24px_rgba(244,114,182,0.28)]"
                  : "text-rose-500 hover:bg-pink-50 hover:text-pink-500 dark:text-pink-200 dark:hover:bg-pink-950/40 dark:hover:text-pink-300"
              }`}
            >
              <Icon size={20} strokeWidth={2.4} />
              <span className="text-[11px] font-black leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
