"use client";

import Link from "next/link";
import { usePreferences } from "@/components/providers/preferences-provider";
import { LOCALE_NAMES } from "@/lib/i18n/dictionaries";

export function FooterPrefs() {
  const { currency, locale, cycleCurrency, cycleLocale, t } = usePreferences();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 lg:justify-end">
      <button
        type="button"
        onClick={cycleCurrency}
        className="hover:text-pine-200 transition-colors tabular-nums"
      >
        {t("footer.currency")}: {currency}
      </button>
      <span aria-hidden className="text-paper/25">
        ·
      </span>
      <button
        type="button"
        onClick={cycleLocale}
        className="hover:text-pine-200 transition-colors"
      >
        {t("footer.language")}: {LOCALE_NAMES[locale]}
      </button>
      <span aria-hidden className="text-paper/25">
        ·
      </span>
      <Link href="/cars" className="hover:text-pine-200 transition-colors">
        {t("nav.cars")}
      </Link>
    </div>
  );
}
