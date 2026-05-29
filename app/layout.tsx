import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Settings } from "lucide-react";
import AuthGate from "@/components/AuthGate";
import MobileBottomNav from "@/components/MobileBottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MacroBudget",
  description: "Plan meals, track macros, and manage household groceries.",
  applicationName: "MacroBudget",
};

export const viewport: Viewport = {
  themeColor: "#ec4899",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-pink-50 pb-24 text-rose-950 md:pb-0">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ffe4ef,transparent_35%),radial-gradient(circle_at_top_right,#f3e8ff,transparent_30%),linear-gradient(#fff7fb,#fff)]">
          <nav className="sticky top-0 z-50 border-b border-pink-100 bg-white/70 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 p-4">
              <Link
                href="/dashboard"
                className="text-xl font-black text-pink-500 drop-shadow-sm sm:text-2xl"
              >
                MacroBudget ♡
              </Link>

              <div className="hidden gap-2 text-sm font-semibold md:flex">
                <Link
                  className="flex h-11 items-center rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  className="flex h-11 items-center rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
                  href="/ingredients"
                >
                  Ingredients
                </Link>
                <Link
                  className="flex h-11 items-center rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
                  href="/recipes"
                >
                  Recipes
                </Link>
                <Link
                  className="flex h-11 items-center rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
                  href="/meal-plan"
                >
                  Meal Plan
                </Link>
                <Link
                  className="flex h-11 items-center rounded-full px-4 py-2 text-rose-700 hover:bg-pink-100"
                  href="/shopping-list"
                >
                  Shopping List
                </Link>
                <Link
                  href="/settings"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-rose-700 transition hover:bg-pink-100"
                  aria-label="Settings"
                >
                  <Settings size={22} />
                </Link>
              </div>

              <Link
                href="/settings"
                className="flex h-11 w-11 items-center justify-center rounded-full text-rose-700 transition hover:bg-pink-100 md:hidden"
                aria-label="Settings"
              >
                <Settings size={22} />
              </Link>
            </div>
          </nav>

          <AuthGate>{children}</AuthGate>
          <MobileBottomNav />
        </div>
      </body>
    </html>
  );
}
