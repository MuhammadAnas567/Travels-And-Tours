"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StripePaymentElement } from "@/components/shared/stripe-payment-element";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DisplayPrice } from "@/components/shared/display-price";
import { insurancePremium } from "@/lib/commerce";
import { Shield } from "lucide-react";

export type CommerceCheckoutKind = "FLIGHT" | "HOTEL" | "CAR" | "PACKAGE";

type Passenger = { firstName: string; lastName: string; dateOfBirth?: string };

type Props = {
  kind: CommerceCheckoutKind;
  title: string;
  subtitle: string;
  /** Base trip total before insurance (per booking, not per person display) */
  subtotal: number;
  summaryRows?: Array<{ label: string; value: string }>;
  /** Payload fields merged into create-commerce-intent (without traveler/insurance) */
  bookingPayload: Record<string, unknown>;
  /** For flights: number of passenger forms */
  passengerCount?: number;
  requireAuthHref?: string;
};

export function CommerceCheckout({
  kind,
  title,
  subtitle,
  subtotal,
  summaryRows = [],
  bookingPayload,
  passengerCount = 1,
  requireAuthHref,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [addInsurance, setAddInsurance] = useState(false);
  const [insurancePlan, setInsurancePlan] = useState<"basic" | "plus">("basic");
  const [traveler, setTraveler] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });
  const [passengers, setPassengers] = useState<Passenger[]>(() =>
    Array.from({ length: passengerCount }, () => ({ firstName: "", lastName: "" }))
  );

  const insAmount = useMemo(
    () => (addInsurance ? insurancePremium(subtotal, insurancePlan) : 0),
    [addInsurance, insurancePlan, subtotal]
  );
  const total = Math.round((subtotal + insAmount) * 100) / 100;

  void requireAuthHref; // reserved for optional account linking UX

  async function startPayment() {
    setError("");
    if (!traveler.name.trim() || traveler.name.trim().length < 2) {
      setError("Enter the lead traveller’s full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(traveler.email.trim())) {
      setError("Enter a valid email for booking confirmation.");
      return;
    }
    if (traveler.phone.trim().length < 7) {
      setError("Enter a phone number with country code.");
      return;
    }
    if (kind === "FLIGHT") {
      for (let i = 0; i < passengerCount; i++) {
        const p = passengers[i];
        if (!p?.firstName.trim() || !p?.lastName.trim()) {
          setError(`Complete passenger ${i + 1} first and last name.`);
          return;
        }
      }
    }

    // Guest checkout allowed — account is created from traveller email if needed
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        ...bookingPayload,
        type: kind,
        travelerInfo: {
          name: traveler.name.trim(),
          email: traveler.email.trim().toLowerCase(),
          phone: traveler.phone.trim(),
        },
        specialRequests: traveler.specialRequests.trim() || undefined,
        insurance: addInsurance
          ? { selected: true, plan: insurancePlan }
          : { selected: false, plan: "basic" },
      };
      if (kind === "FLIGHT") {
        body.passengers = passengers.slice(0, passengerCount);
      }

      const res = await fetch("/api/payments/create-commerce-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start payment");
        toast.error(data.error ?? "Could not start payment");
        setLoading(false);
        return;
      }
      setClientSecret(data.clientSecret);
      setBookingId(data.bookingId);
      setStep(2);
    } catch {
      setError("Network error — try again.");
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-6">
        {step === 1 ? (
          <>
            <section className="rounded-md border border-line bg-paper p-5 shadow-sm sm:p-6">
              <h2 className="font-display text-xl font-semibold text-ink">Traveller details</h2>
              <p className="mt-1 text-sm text-ink-500">
                Used for confirmation and e-ticket delivery.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="lead-name">Full name</Label>
                  <Input
                    id="lead-name"
                    className="mt-1"
                    value={traveler.name}
                    onChange={(e) => setTraveler((t) => ({ ...t, name: e.target.value }))}
                    placeholder="As on passport"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <Label htmlFor="lead-email">Email</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    className="mt-1"
                    value={traveler.email}
                    onChange={(e) => setTraveler((t) => ({ ...t, email: e.target.value }))}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="lead-phone">Phone</Label>
                  <Input
                    id="lead-phone"
                    type="tel"
                    className="mt-1"
                    value={traveler.phone}
                    onChange={(e) => setTraveler((t) => ({ ...t, phone: e.target.value }))}
                    placeholder="+92 42 37260405"
                    autoComplete="tel"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="lead-notes">Special requests (optional)</Label>
                  <Textarea
                    id="lead-notes"
                    className="mt-1"
                    rows={3}
                    value={traveler.specialRequests}
                    onChange={(e) =>
                      setTraveler((t) => ({ ...t, specialRequests: e.target.value }))
                    }
                    placeholder="Meal preference, accessibility, seating…"
                  />
                </div>
              </div>
            </section>

            {kind === "FLIGHT" ? (
              <section className="rounded-md border border-line bg-paper p-5 shadow-sm sm:p-6">
                <h2 className="font-display text-xl font-semibold text-ink">Passengers</h2>
                <div className="mt-5 space-y-4">
                  {passengers.slice(0, passengerCount).map((p, i) => (
                    <div key={i} className="grid gap-3 rounded-md border border-line p-4 sm:grid-cols-2">
                      <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                        Passenger {i + 1}
                      </p>
                      <div>
                        <Label htmlFor={`pfn-${i}`}>First name</Label>
                        <Input
                          id={`pfn-${i}`}
                          className="mt-1"
                          value={p.firstName}
                          onChange={(e) => {
                            const next = [...passengers];
                            next[i] = { ...next[i], firstName: e.target.value };
                            setPassengers(next);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`pln-${i}`}>Last name</Label>
                        <Input
                          id={`pln-${i}`}
                          className="mt-1"
                          value={p.lastName}
                          onChange={(e) => {
                            const next = [...passengers];
                            next[i] = { ...next[i], lastName: e.target.value };
                            setPassengers(next);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-md border border-line bg-paper p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pine-50 text-pine-600">
                  <Shield className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-semibold text-ink">Travel insurance</h2>
                  <p className="mt-1 text-sm text-ink-500">
                    Optional cover for cancellation and medical emergencies.
                  </p>
                  <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addInsurance}
                      onChange={(e) => setAddInsurance(e.target.checked)}
                      className="h-4 w-4 accent-[var(--color-pine-500)]"
                    />
                    <span className="text-sm font-medium text-ink">Add insurance to this booking</span>
                  </label>
                  {addInsurance ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(
                        [
                          { id: "basic", label: "Basic", hint: "4.5% of trip" },
                          { id: "plus", label: "Plus", hint: "8% of trip" },
                        ] as const
                      ).map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setInsurancePlan(plan.id)}
                          className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                            insurancePlan === plan.id
                              ? "border-pine-500 bg-pine-50 text-pine-800"
                              : "border-line bg-sand/40 text-ink-700 hover:border-taupe-400"
                          }`}
                        >
                          <span className="font-semibold">{plan.label}</span>
                          <span className="mt-0.5 block text-xs text-ink-500">{plan.hint}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            {error ? (
              <p className="text-sm text-ink-600" role="status">
                {error}
              </p>
            ) : null}

            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              disabled={loading}
              onClick={() => void startPayment()}
            >
              {loading ? "Preparing checkout…" : "Continue to secure payment"}
            </Button>
            <p className="text-sm text-ink-500">
              No account needed — we email your e-ticket to the address above.
            </p>
          </>
        ) : clientSecret && bookingId ? (
          <section className="rounded-md border border-line bg-paper p-5 shadow-sm sm:p-6">
            <h2 className="font-display text-xl font-semibold text-ink">Pay securely</h2>
            <p className="mt-1 text-sm text-ink-500">
              Stripe test mode — use card <span className="tabular-nums">4242 4242 4242 4242</span>.
            </p>
            <div className="mt-6">
              <StripePaymentElement
                clientSecret={clientSecret}
                bookingId={bookingId}
                onBack={() => {
                  setStep(1);
                  setClientSecret(null);
                  setBookingId(null);
                }}
              />
            </div>
          </section>
        ) : null}
      </div>

      <aside className="lg:sticky lg:top-24 h-fit rounded-md border border-line bg-paper p-5 shadow-sm">
        <p className="eyebrow">Booking summary</p>
        <h3 className="mt-2 font-display text-xl font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          {summaryRows.map((row) => (
            <div key={row.label} className="flex justify-between gap-3">
              <dt className="text-ink-500">{row.label}</dt>
              <dd className="text-right font-medium text-ink">{row.value}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500">Trip fare</dt>
            <dd className="tabular-nums font-medium text-ink">
              <DisplayPrice amount={subtotal} />
            </dd>
          </div>
          {addInsurance ? (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">Insurance ({insurancePlan})</dt>
              <dd className="tabular-nums font-medium text-ink">
                <DisplayPrice amount={insAmount} />
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-3 border-t border-line pt-3 text-base">
            <dt className="font-semibold text-ink">Total</dt>
            <dd className="tabular-nums font-semibold text-ink" data-price>
              <DisplayPrice amount={total} />
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
