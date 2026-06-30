import type { Currency } from "@prisma/client";
import { prisma } from "@/lib/db";

const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  PKR: 278,
  EUR: 0.92,
  GBP: 0.79,
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export const SUPPORTED_CURRENCIES: Currency[] = ["PKR", "USD", "EUR", "GBP"];

export async function getFxRates(): Promise<Record<Currency, number>> {
  try {
    const latest = await prisma.fxRate.findFirst({
      orderBy: { fetchedAt: "desc" },
    });

    if (
      latest &&
      Date.now() - latest.fetchedAt.getTime() < CACHE_TTL_MS
    ) {
      return latest.rates as Record<Currency, number>;
    }

    const rates = await fetchFxRatesFromApi();
    await prisma.fxRate.create({
      data: { base: "USD", rates },
    });
    return rates;
  } catch {
    return FALLBACK_RATES;
  }
}

async function fetchFxRatesFromApi(): Promise<Record<Currency, number>> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) return FALLBACK_RATES;

  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return FALLBACK_RATES;

  const data = await res.json();
  return {
    USD: 1,
    PKR: data.conversion_rates?.PKR ?? FALLBACK_RATES.PKR,
    EUR: data.conversion_rates?.EUR ?? FALLBACK_RATES.EUR,
    GBP: data.conversion_rates?.GBP ?? FALLBACK_RATES.GBP,
  };
}

export function convertPrice(
  amount: number,
  from: Currency,
  to: Currency,
  rates: Record<Currency, number>
): number {
  if (from === to) return amount;
  const inUsd = amount / rates[from];
  return Math.round(inUsd * rates[to]);
}

export function formatCurrency(amount: number, currency: Currency, locale = "en") {
  const localeMap: Record<Currency, string> = {
    PKR: "en-PK",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
  };
  return new Intl.NumberFormat(localeMap[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "PKR" ? 0 : 2,
  }).format(amount);
}
