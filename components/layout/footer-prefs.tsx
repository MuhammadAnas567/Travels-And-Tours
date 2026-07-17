"use client";

import Link from "next/link";
import { usePreferences } from "@/components/providers/preferences-provider";
import { CurrencyMenu, LanguageMenu } from "@/components/layout/preference-menus";

export function FooterPrefs() {
  const { t } = usePreferences();

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 lg:justify-end">
      <CurrencyMenu tone="footer" />
      <span aria-hidden className="text-paper/25">
        ·
      </span>
      <LanguageMenu tone="footer" />
      <span aria-hidden className="text-paper/25">
        ·
      </span>
      <Link href="/cars" className="hover:text-pine-200 transition-colors">
        {t("nav.cars")}
      </Link>
    </div>
  );
}
