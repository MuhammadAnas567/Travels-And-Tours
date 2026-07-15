import type { Metadata } from "next";
import { CatalogHero } from "@/components/layout/catalog-hero";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="bg-sand">
      <CatalogHero
        eyebrow="Legal"
        title="Terms of Service"
        description="Last updated June 2026. By using UEB3 Travel, you agree to these terms."
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="space-y-8 text-ink-700 leading-relaxed">
          <p>By using UEB3 Travel, you agree to these terms. Please read them carefully.</p>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Bookings & Payments</h2>
            <p className="mt-3">
              All prices are in USD unless stated otherwise. Payment is processed securely through Stripe. Bookings are confirmed upon successful payment.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Cancellations</h2>
            <p className="mt-3">
              Free cancellation is available up to 7 days before departure on eligible products. Later cancellations may be subject to fees shown at checkout.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Liability</h2>
            <p className="mt-3">
              UEB3 Travel acts as an intermediary between travellers and local operators. We are not liable for events beyond our control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
