import { cookies } from "next/headers";
import type { Currency } from "@prisma/client";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { CURRENCY_COOKIE, LOCALE_COOKIE } from "@/lib/constants";
import { SUPPORTED_LOCALES, type AppLocale } from "@/lib/i18n/dictionaries";

export async function getPreferredCurrency(): Promise<Currency> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENCY_COOKIE)?.value as Currency | undefined;
  if (value && SUPPORTED_CURRENCIES.includes(value)) return value;
  return "USD";
}

export async function getPreferredLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value === "ur" || value === "ar") return "en";
  if (value && SUPPORTED_LOCALES.includes(value as AppLocale)) {
    return value as AppLocale;
  }
  return "en";
}
