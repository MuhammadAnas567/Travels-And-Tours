import { cookies } from "next/headers";
import type { Currency } from "@prisma/client";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { CURRENCY_COOKIE } from "@/lib/constants";
import type { AppLocale } from "@/lib/i18n/dictionaries";

export async function getPreferredCurrency(): Promise<Currency> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENCY_COOKIE)?.value as Currency | undefined;
  if (value === "EUR" || value === "GBP") return "USD";
  if (value && SUPPORTED_CURRENCIES.includes(value)) return value;
  return "USD";
}

export async function getPreferredLocale(): Promise<AppLocale> {
  return "en";
}
