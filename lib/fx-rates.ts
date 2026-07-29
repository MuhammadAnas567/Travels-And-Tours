import type { Currency } from "@prisma/client";
import { prisma } from "@/lib/db";
import { FALLBACK_RATES } from "@/lib/currency";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Server-only FX lookup (DB cache + optional ExchangeRate API). */
export async function getFxRates(): Promise<Record<Currency, number>> {
  try {
    const latest = await prisma.fxRate.findFirst({
      orderBy: { fetchedAt: "desc" },
    });

    if (latest && Date.now() - latest.fetchedAt.getTime() < CACHE_TTL_MS) {
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
