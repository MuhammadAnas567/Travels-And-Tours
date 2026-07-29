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

/**
 * Live currency control. Do not pass a server-rendered `value` — it freezes the
 * Select on the SSR snapshot and makes USD/PKR switching appear broken.
 */
export function CurrencySwitcher() {
  const { currency, setCurrency } = usePreferences();

  return (
    <Select value={currency} onValueChange={(c) => setCurrency(c as Currency)}>
      <SelectTrigger className="h-9 w-[88px] border-line bg-paper text-xs">
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
