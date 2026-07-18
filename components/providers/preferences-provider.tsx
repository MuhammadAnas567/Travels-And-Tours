"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { Currency } from "@prisma/client";
import { toast } from "sonner";
import { CURRENCY_COOKIE, LOCALE_COOKIE } from "@/lib/constants";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import {
  LOCALE_LABELS,
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  translate,
  type AppLocale,
} from "@/lib/i18n/dictionaries";

const CURRENCY_EVENT = "ueb3-currency-change";
const LOCALE_EVENT = "ueb3-locale-change";

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}

function writeCookie(name: string, value: string) {
  // No encodeURIComponent for simple codes — avoids mismatch with older readers
  document.cookie = `${name}=${value};path=/;max-age=31536000;SameSite=Lax`;
}

function readCurrency(): Currency {
  const value = readCookie(CURRENCY_COOKIE) as Currency;
  // Drop EUR/GBP — only PKR + USD
  if (value === "EUR" || value === "GBP") return "USD";
  return SUPPORTED_CURRENCIES.includes(value) ? value : "USD";
}

function readLocale(): AppLocale {
  return "en";
}

function subscribeCurrency(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CURRENCY_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CURRENCY_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function subscribeLocale(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(LOCALE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(LOCALE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function notifyCurrencyChange() {
  window.dispatchEvent(new CustomEvent(CURRENCY_EVENT));
}

export function notifyLocaleChange() {
  window.dispatchEvent(new CustomEvent(LOCALE_EVENT));
}

type PreferencesContextValue = {
  currency: Currency;
  locale: AppLocale;
  localeLabel: string;
  dir: "ltr" | "rtl";
  setCurrency: (c: Currency) => void;
  cycleCurrency: () => void;
  setLocale: (l: AppLocale) => void;
  cycleLocale: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const currency = useSyncExternalStore(subscribeCurrency, readCurrency, () => "USD" as Currency);
  const locale = useSyncExternalStore(subscribeLocale, readLocale, () => "en" as AppLocale);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    writeCookie(LOCALE_COOKIE, "en");
    const cur = readCookie(CURRENCY_COOKIE);
    if (cur === "EUR" || cur === "GBP" || !SUPPORTED_CURRENCIES.includes(cur as Currency)) {
      writeCookie(CURRENCY_COOKIE, "USD");
      notifyCurrencyChange();
    }
  }, [hydrated]);

  const setCurrency = useCallback((next: Currency) => {
    writeCookie(CURRENCY_COOKIE, next);
    notifyCurrencyChange();
    toast.success(translate(readLocale(), "currency.toast", { code: next }));
  }, []);

  const cycleCurrency = useCallback(() => {
    const idx = SUPPORTED_CURRENCIES.indexOf(readCurrency());
    const next = SUPPORTED_CURRENCIES[(idx + 1) % SUPPORTED_CURRENCIES.length] ?? "USD";
    setCurrency(next);
  }, [setCurrency]);

  const setLocale = useCallback((next: AppLocale) => {
    writeCookie(LOCALE_COOKIE, next);
    notifyLocaleChange();
    toast.success(translate(next, "locale.toast", { name: LOCALE_NAMES[next] }));
  }, []);

  const cycleLocale = useCallback(() => {
    const idx = SUPPORTED_LOCALES.indexOf(readLocale());
    const next = SUPPORTED_LOCALES[(idx + 1) % SUPPORTED_LOCALES.length] ?? "en";
    setLocale(next);
  }, [setLocale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale]
  );

  const value = useMemo<PreferencesContextValue>(
    () => ({
      currency,
      locale,
      localeLabel: LOCALE_LABELS[locale],
      dir: "ltr",
      setCurrency,
      cycleCurrency,
      setLocale,
      cycleLocale,
      t,
    }),
    [currency, locale, setCurrency, cycleCurrency, setLocale, cycleLocale, t]
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return ctx;
}

export function useOptionalPreferences() {
  return useContext(PreferencesContext);
}
