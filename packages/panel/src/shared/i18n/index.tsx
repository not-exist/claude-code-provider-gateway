import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { http } from "../api/http.js";
import en from "./locales/en.js";
import zhCN from "./locales/zh-CN.js";
import type { Locale, TranslationDict } from "./types.js";

const dictionaries: Record<Locale, TranslationDict> = { en, "zh-CN": zhCN };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [ready, setReady] = useState(false);

  // Load persisted locale from daemon on mount
  useEffect(() => {
    http
      .get<{ panelSettings: { locale?: Locale } }>("/config")
      .then((cfg) => {
        const saved = cfg.panelSettings?.locale;
        if (saved === "en" || saved === "zh-CN") {
          setLocaleState(saved);
        }
      })
      .catch(() => {
        // Keep default "en" on error
      })
      .finally(() => setReady(true));
  }, []);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    // Persist to daemon
    try {
      await http.put("/config", { panelSettings: { locale: next } });
    } catch {
      // Best-effort persistence
    }
  }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string>): string => {
      const dict = dictionaries[locale];
      let value: string = dict[key] ?? dictionaries.en[key] ?? key;
      if (replacements) {
        for (const [rk, rv] of Object.entries(replacements)) {
          value = value.replace(`{${rk}}`, rv);
        }
      }
      return value;
    },
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {ready ? children : null}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
