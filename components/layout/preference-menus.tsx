"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Languages, ChevronDown, Check } from "lucide-react";
import type { Currency } from "@prisma/client";
import { cn } from "@/lib/utils";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { LOCALE_NAMES, SUPPORTED_LOCALES, type AppLocale } from "@/lib/i18n/dictionaries";
import { usePreferences } from "@/components/providers/preferences-provider";

type Tone = "header" | "footer";

function useOutsideClose(open: boolean, onClose: () => void) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return rootRef;
}

function DropdownPanel({
  children,
  align = "end",
}: {
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  return (
    <div
      role="listbox"
      className={cn(
        "absolute top-full z-[120] mt-2 min-w-[11rem] overflow-hidden rounded-md border border-white/10 bg-pine-900 py-1.5 text-paper shadow-lg",
        align === "end" ? "right-0" : "left-0"
      )}
    >
      {children}
    </div>
  );
}

const triggerClass: Record<Tone, string> = {
  header:
    "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-600 hover:bg-sand-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500",
  footer:
    "inline-flex min-h-9 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-paper/80 hover:text-paper hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-300",
};

export function CurrencyMenu({
  className,
  tone = "header",
}: {
  className?: string;
  tone?: Tone;
}) {
  const { currency, setCurrency, t } = usePreferences();
  const [open, setOpen] = useState(false);
  const rootRef = useOutsideClose(open, () => setOpen(false));

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("prefs.currency")}: ${currency}`}
        onClick={() => setOpen((o) => !o)}
        className={cn(triggerClass[tone], "tabular-nums")}
      >
        <Globe className="h-4 w-4" aria-hidden />
        {tone === "footer" ? `${t("footer.currency")}: ${currency}` : currency}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <DropdownPanel>
          <p className="px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-pine-200">
            {t("prefs.currency")}
          </p>
          {SUPPORTED_CURRENCIES.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={currency === code}
              className={cn(
                "flex w-full min-h-10 items-center justify-between gap-3 px-3 text-left text-sm",
                currency === code
                  ? "bg-pine-500/90 font-semibold text-paper"
                  : "text-paper/90 hover:bg-pine-800"
              )}
              onClick={() => {
                setCurrency(code as Currency);
                setOpen(false);
              }}
            >
              <span className="tabular-nums">{code}</span>
              {currency === code ? <Check className="h-4 w-4" strokeWidth={2} /> : null}
            </button>
          ))}
        </DropdownPanel>
      ) : null}
    </div>
  );
}

export function LanguageMenu({
  className,
  tone = "header",
}: {
  className?: string;
  tone?: Tone;
}) {
  const { locale, setLocale, t } = usePreferences();
  const [open, setOpen] = useState(false);
  const rootRef = useOutsideClose(open, () => setOpen(false));

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("prefs.language")}: ${LOCALE_NAMES[locale]}`}
        onClick={() => setOpen((o) => !o)}
        className={triggerClass[tone]}
      >
        <Languages className="h-4 w-4" aria-hidden />
        {tone === "footer"
          ? `${t("footer.language")}: ${LOCALE_NAMES[locale]}`
          : LOCALE_NAMES[locale]}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <DropdownPanel>
          <p className="px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-pine-200">
            {t("prefs.language")}
          </p>
          {SUPPORTED_LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={locale === code}
              className={cn(
                "flex w-full min-h-10 items-center justify-between gap-3 px-3 text-left text-sm",
                locale === code
                  ? "bg-pine-500/90 font-semibold text-paper"
                  : "text-paper/90 hover:bg-pine-800"
              )}
              onClick={() => {
                setLocale(code as AppLocale);
                setOpen(false);
              }}
            >
              <span>{LOCALE_NAMES[code]}</span>
              {locale === code ? <Check className="h-4 w-4" strokeWidth={2} /> : null}
            </button>
          ))}
        </DropdownPanel>
      ) : null}
    </div>
  );
}
