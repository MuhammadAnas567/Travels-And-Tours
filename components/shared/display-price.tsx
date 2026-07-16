"use client";

import { useSyncExternalStore } from "react";
import type { Currency } from "@prisma/client";
import { CURRENCY_COOKIE } from "@/lib/constants";
import { convertPrice, FALLBACK_RATES, formatCurrency, SUPPORTED_CURRENCIES } from "@/lib/currency";

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

export function notifyCurrencyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CURRENCY_EVENT));
  }
}

export function useDisplayCurrency(): Currency {
  return useSyncExternalStore(subscribe, readCookieCurrency, () => "USD" as Currency);
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
  const converted = convertPrice(amount, from, currency, FALLBACK_RATES);
  return <>{formatCurrency(converted, currency)}</>;
}
