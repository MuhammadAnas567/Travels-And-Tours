"use client";

import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function PaymentForm({
  bookingId,
  onBack,
}: {
  bookingId: string;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage(null);

    const appUrl = window.location.origin;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${appUrl}/booking/success?booking_id=${bookingId}`,
      },
    });

    // Only reached if immediate error (3DS redirects away)
    if (error) {
      setMessage(error.message ?? "Payment failed. Please try again.");
      toast.error(error.message ?? "Payment failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      {message && (
        <p className="rounded-[var(--radius-sm)] bg-error/10 px-3 py-2 text-sm text-error" role="alert">
          {message}
        </p>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-primary-500 hover:bg-primary-700"
          disabled={!stripe || !elements || loading}
        >
          {loading ? "Processing…" : "Pay securely"}
        </Button>
      </div>
      <p className="text-center text-xs text-ink-500">
        Secured by Stripe · Cards, wallets &amp; 3D Secure supported
      </p>
    </form>
  );
}

export function StripePaymentElement({
  clientSecret,
  bookingId,
  onBack,
}: {
  clientSecret: string;
  bookingId: string;
  onBack: () => void;
}) {
  if (!stripePromise) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Stripe publishable key is missing. Set{" "}
        <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
        in <code className="rounded bg-amber-100 px-1">.env.local</code>.
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#1668E3",
        colorBackground: "#ffffff",
        colorText: "#0F172A",
        colorDanger: "#DC2626",
        borderRadius: "12px",
        fontFamily: "Inter, system-ui, sans-serif",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm bookingId={bookingId} onBack={onBack} />
    </Elements>
  );
}
