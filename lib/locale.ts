import { cookies } from "next/headers";
import type { Currency } from "@prisma/client";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { CURRENCY_COOKIE, LOCALE_COOKIE } from "@/lib/constants";

export async function getPreferredCurrency(): Promise<Currency> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENCY_COOKIE)?.value as Currency | undefined;
  if (value && SUPPORTED_CURRENCIES.includes(value)) return value;
  return "USD";
}

export async function getPreferredLocale(): Promise<"en" | "ur"> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === "ur" ? "ur" : "en";
}
