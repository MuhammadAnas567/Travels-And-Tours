"use client";

import type { Currency } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { usePreferences } from "@/components/providers/preferences-provider";

export function CurrencySwitcher({ value }: { value?: Currency }) {
  const { currency, setCurrency } = usePreferences();
  const current = value ?? currency;

  return (
    <Select value={current} onValueChange={(c) => setCurrency(c as Currency)}>
      <SelectTrigger className="h-9 w-[88px] border-line bg-surface text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CURRENCIES.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
