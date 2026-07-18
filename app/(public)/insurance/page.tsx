import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Travel Insurance",
  description: "Add travel insurance when you book flights, hotels, cars, or packages.",
};

const plans = [
  {
    id: "basic",
    name: "Basic",
    priceHint: "From 4.5% of trip fare",
    features: ["Trip cancellation", "Medical emergency cover", "24/7 assistance line"],
  },
  {
    id: "plus",
    name: "Plus",
    priceHint: "From 8% of trip fare",
    features: [
      "Everything in Basic",
      "Baggage delay cover",
      "Higher medical limits",
      "Adventure sports rider",
    ],
  },
];

export default function InsurancePage() {
  return (
    <div className="bg-sand min-h-[60vh]">
      <div className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="eyebrow">Protection</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl max-w-[18ch]">
            Travel insurance at checkout
          </h1>
          <p className="mt-4 max-w-xl text-ink-500 leading-relaxed">
            Add optional cover when you book a flight, hotel, car, or package. Premiums are
            calculated from your trip total and charged with Stripe in one payment.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="rounded-md border border-line bg-paper p-6 shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pine-50 text-pine-600">
                <Shield className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold text-ink">{plan.name}</h2>
              <p className="mt-1 text-sm text-ink-500">{plan.priceHint}</p>
              <ul className="mt-5 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-pine-500" strokeWidth={1.5} />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-md bg-pine-900 px-6 py-10 text-center sm:px-10">
          <h2 className="font-display text-2xl font-semibold text-paper">
            Start a booking, then toggle insurance
          </h2>
          <p className="mx-auto mt-3 max-w-md text-paper/70">
            Insurance is offered on every commerce checkout. Choose Basic or Plus before you pay.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-paper text-pine-800 hover:bg-pine-50">
              <Link href="/flights">Book a flight</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-paper/30 bg-transparent text-paper hover:bg-paper/10"
            >
              <Link href="/hotels">Book a hotel</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
