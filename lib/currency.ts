import type { Currency } from "@prisma/client";

/** USD-based rates (1 USD = rate units of currency). */
export const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  PKR: 278,
  EUR: 0.92,
  GBP: 0.79,
};

export const SUPPORTED_CURRENCIES: Currency[] = ["PKR", "USD"];

export function convertPrice(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<Currency, number> = FALLBACK_RATES
): number {
  const value = Number(amount) || 0;
  if (from === to) return value;
  const fromRate = rates[from] || FALLBACK_RATES[from] || 1;
  const toRate = rates[to] || FALLBACK_RATES[to] || 1;
  const inUsd = value / fromRate;
  const converted = inUsd * toRate;
  // Keep cents for USD/EUR/GBP; whole units for PKR
  if (to === "PKR") return Math.round(converted);
  return Math.round(converted * 100) / 100;
}

export function formatCurrency(amount: number, currency: Currency, locale = "en") {
  const localeMap: Record<Currency, string> = {
    PKR: "en-PK",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
  };
  return new Intl.NumberFormat(localeMap[currency] ?? "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "PKR" ? 0 : 2,
  }).format(Number(amount) || 0);
}

export function isSupportedCurrency(value: string | null | undefined): value is Currency {
  return Boolean(value && SUPPORTED_CURRENCIES.includes(value as Currency));
}

/** Whole-number % off vs a strikethrough “was” price. */
export function discountPercentOff(compareAtPrice: number, buyPrice: number): number {
  if (!Number.isFinite(compareAtPrice) || !Number.isFinite(buyPrice)) return 0;
  if (compareAtPrice <= 0 || buyPrice <= 0 || compareAtPrice <= buyPrice) return 0;
  return Math.round(((compareAtPrice - buyPrice) / compareAtPrice) * 100);
}

