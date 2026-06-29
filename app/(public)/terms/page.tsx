import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 prose prose-ocean">
      <h1 className="text-3xl font-bold text-ocean-900">Terms of Service</h1>
      <p className="mt-4 text-gray-600">Last updated: June 2026</p>
      <div className="mt-8 space-y-4 text-gray-600">
        <p>By using Wanderlust Tours, you agree to these terms. Please read them carefully.</p>
        <h2 className="text-xl font-semibold text-ocean-800">Bookings & Payments</h2>
        <p>All prices are in USD. Payment is processed securely through Stripe. Bookings are confirmed upon successful payment.</p>
        <h2 className="text-xl font-semibold text-ocean-800">Cancellations</h2>
        <p>Free cancellation is available up to 7 days before departure. Later cancellations may be subject to fees.</p>
        <h2 className="text-xl font-semibold text-ocean-800">Liability</h2>
        <p>Wanderlust Tours acts as an intermediary between travelers and local operators. We are not liable for events beyond our control.</p>
      </div>
    </div>
  );
}
