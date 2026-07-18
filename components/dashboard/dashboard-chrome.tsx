"use client";

import { usePreferences } from "@/components/providers/preferences-provider";

export function DashboardWelcome({ name }: { name: string }) {
  const { t } = usePreferences();
  return (
    <div>
      <p className="eyebrow text-pine-600">{t("dash.account")}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
        {t("dash.welcome", { name })}
      </h1>
      <p className="mt-2 text-ink-500">{t("dash.subtitle")}</p>
    </div>
  );
}

export function DashLabel({ k }: { k: string }) {
  const { t } = usePreferences();
  return <>{t(k)}</>;
}
