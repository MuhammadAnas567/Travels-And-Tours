"use client";

import { useState } from "react";
import { CreditCard, Landmark, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type PaymentMethodChoice = "stripe" | "bank" | "jazzcash" | "easypaisa";

export type PaymentMethodPickerProps = {
  bookingId?: string | null;
  enabled: {
    stripe?: boolean;
    bank?: boolean;
    jazzcash?: boolean;
    easypaisa?: boolean;
  };
  /** Called when Stripe is selected (parent creates PaymentIntent). */
  onSelectStripe?: () => void | Promise<void>;
  /** Called when bank transfer is selected. */
  onSelectBank?: () => void | Promise<void>;
  /** Optional — parent creates booking then initiates wallet. */
  onSelectJazzcash?: () => void | Promise<void>;
  onSelectEasypaisa?: () => void | Promise<void>;
  className?: string;
};

const OPTIONS: {
  id: PaymentMethodChoice;
  label: string;
  hint: string;
  icon: typeof CreditCard;
}[] = [
  {
    id: "stripe",
    label: "Card (Stripe)",
    hint: "Visa, Mastercard & international cards",
    icon: CreditCard,
  },
  {
    id: "bank",
    label: "Bank transfer",
    hint: "Pay to our account — we verify manually",
    icon: Landmark,
  },
  {
    id: "jazzcash",
    label: "JazzCash",
    hint: "Mobile wallet (Pakistan)",
    icon: Smartphone,
  },
  {
    id: "easypaisa",
    label: "EasyPaisa",
    hint: "Mobile wallet (Pakistan)",
    icon: Smartphone,
  },
];

/**
 * Client UI for choosing Stripe / Bank / JazzCash / EasyPaisa.
 * Import into booking-flow or any checkout step.
 */
export function PaymentMethodPicker({
  bookingId,
  enabled,
  onSelectStripe,
  onSelectBank,
  onSelectJazzcash,
  onSelectEasypaisa,
  className,
}: PaymentMethodPickerProps) {
  const [selected, setSelected] = useState<PaymentMethodChoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = OPTIONS.filter((o) => {
    if (o.id === "stripe") return enabled.stripe !== false;
    if (o.id === "bank") return !!enabled.bank;
    if (o.id === "jazzcash") return !!enabled.jazzcash;
    if (o.id === "easypaisa") return !!enabled.easypaisa;
    return false;
  });

  async function continueWith(method: PaymentMethodChoice) {
    setError(null);
    setSelected(method);
    setLoading(true);
    try {
      if (method === "stripe") {
        await onSelectStripe?.();
        return;
      }
      if (method === "bank") {
        await onSelectBank?.();
        return;
      }
      if (method === "jazzcash" && onSelectJazzcash) {
        await onSelectJazzcash();
        return;
      }
      if (method === "easypaisa" && onSelectEasypaisa) {
        await onSelectEasypaisa();
        return;
      }
      if (!bookingId) {
        setError("Booking is not ready yet. Continue from traveler details first.");
        return;
      }
      const res = await fetch("/api/payments/wallets/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, provider: method }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start wallet payment");
        return;
      }
      window.location.href = data.redirectUrl as string;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (visible.length === 0) {
    return (
      <p className="text-sm text-ink-500">No payment methods are available right now.</p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-ink-700">Choose how to pay</p>
      <ul className="space-y-2" role="list">
        {visible.map((opt) => {
          const Icon = opt.icon;
          const active = selected === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                disabled={loading}
                onClick={() => void continueWith(opt.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500",
                  active
                    ? "border-pine-500 bg-pine-50"
                    : "border-line bg-paper hover:border-pine-300 hover:bg-sand"
                )}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-sand text-pine-700">
                  <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink-900">
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-500">{opt.hint}</span>
                </span>
                {loading && active ? (
                  <span className="text-xs text-ink-500">Starting…</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {error ? <p className="text-sm text-error">{error}</p> : null}
      {bookingId && (enabled.jazzcash || enabled.easypaisa) ? (
        <p className="text-xs text-ink-500">
          Wallet sandbox confirms instantly in development.
        </p>
      ) : null}
      {!onSelectStripe && !onSelectBank && !bookingId ? (
        <Button type="button" variant="outline" disabled className="w-full">
          Select a method above
        </Button>
      ) : null}
    </div>
  );
}
