"use client";

import { useRouter } from "next/navigation";
import type { Currency } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCY_COOKIE } from "@/lib/constants";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

export function CurrencySwitcher({ value }: { value: Currency }) {
  const router = useRouter();

  function onChange(currency: string) {
    document.cookie = `${CURRENCY_COOKIE}=${currency};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <Select value={value} onValueChange={onChange}>
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
