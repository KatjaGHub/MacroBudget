"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function ScrollToTop() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label={t.auth.scrollToTop}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-pink-500 p-4 text-2xl text-white shadow-[0_10px_25px_rgba(244,114,182,0.35)] transition hover:scale-110 hover:bg-pink-600"
    >
      <ArrowUp size={28} strokeWidth={3} />
    </button>
  );
}
