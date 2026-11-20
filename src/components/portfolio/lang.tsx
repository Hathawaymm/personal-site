"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "@/data/portfolio-data";
import { LANG_STORAGE_KEY, readStoredLang } from "@/lib/route-policy";

const STORAGE_KEY = LANG_STORAGE_KEY;

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    try {
      const saved = readStoredLang(localStorage.getItem(STORAGE_KEY));
      setLangState(saved);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used within LanguageProvider");
  return value;
}
