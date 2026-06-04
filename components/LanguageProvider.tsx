"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionary, isLanguage, type Language } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

type Translation = typeof dictionary.en;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: Translation;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    let active = true;
    const savedLanguage = localStorage.getItem("macrobudget-language");
    const fallbackLanguage = isLanguage(savedLanguage) ? savedLanguage : "en";

    const timeoutId = window.setTimeout(() => {
      if (active) {
        setLanguageState(fallbackLanguage);
      }
    }, 0);

    const loadLanguage = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) return;

      const { data } = await supabase
        .from("profiles")
        .select("language")
        .eq("id", userId)
        .maybeSingle();

      const profileLanguage = data?.language;

      if (!active || !isLanguage(profileLanguage)) return;

      localStorage.setItem("macrobudget-language", profileLanguage);
      setLanguageState(profileLanguage);
    };

    loadLanguage();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const setLanguage = async (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    localStorage.setItem("macrobudget-language", nextLanguage);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({ language: nextLanguage })
      .eq("id", userId);

    if (error) {
      alert(error.message);
    }
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: {
        ...dictionary.en,
        ...dictionary[language],
      } as Translation,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
