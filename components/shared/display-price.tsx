"use client";

import type { Currency } from "@prisma/client";
import { convertPrice, FALLBACK_RATES, formatCurrency } from "@/lib/currency";
import { useOptionalPreferences } from "@/components/providers/preferences-provider";
import { useSyncExternalStore } from "react";
import { CURRENCY_COOKIE } from "@/lib/constants";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

const CURRENCY_EVENT = "ueb3-currency-change";

function readCookieCurrency(): Currency {
  if (typeof document === "undefined") return "USD";
  const match = document.cookie.match(new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`));
  const value = match?.[1] as Currency | undefined;
  if (value && SUPPORTED_CURRENCIES.includes(value)) return value;
  return "USD";
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(CURRENCY_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CURRENCY_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

/** @deprecated prefer PreferencesProvider.notify via usePreferences */
export function notifyCurrencyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CURRENCY_EVENT));
  }
}

export function useDisplayCurrency(): Currency {
  const prefs = useOptionalPreferences();
  const fallback = useSyncExternalStore(subscribe, readCookieCurrency, () => "USD" as Currency);
  return prefs?.currency ?? fallback;
}

/** Client price that follows the header currency cookie */
export function DisplayPrice({
  amount,
  from = "USD",
}: {
  amount: number;
  from?: Currency;
}) {
  const currency = useDisplayCurrency();
  const converted = convertPrice(Number(amount) || 0, from, currency, FALLBACK_RATES);
  return <span className="tabular-nums">{formatCurrency(converted, currency)}</span>;
}
