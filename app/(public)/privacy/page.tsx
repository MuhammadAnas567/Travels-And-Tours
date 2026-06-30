import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ocean-900">Privacy Policy</h1>
      <p className="mt-4 text-gray-600">Last updated: June 2026</p>
      <div className="mt-8 space-y-4 text-gray-600">
        <p>We respect your privacy and are committed to protecting your personal data.</p>
        <h2 className="text-xl font-semibold text-ocean-800">Data We Collect</h2>
        <p>We collect name, email, phone number, and booking information when you use our services.</p>
        <h2 className="text-xl font-semibold text-ocean-800">How We Use Data</h2>
        <p>Your data is used to process bookings, send confirmations, and improve our services. We do not sell your data to third parties.</p>
        <h2 className="text-xl font-semibold text-ocean-800">Contact</h2>
        <p>For privacy inquiries, contact hello@ueb3tours.com.</p>
      </div>
    </div>
  );
}
