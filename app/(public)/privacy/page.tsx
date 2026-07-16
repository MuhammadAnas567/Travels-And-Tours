import type { Metadata } from "next";
import { CatalogHero } from "@/components/layout/catalog-hero";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="bg-sand">
      <CatalogHero
        variant="default"
        eyebrow="Legal"
        title="Privacy Policy"
        description="Last updated June 2026. We respect your privacy and protect your personal data."
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="space-y-8 text-ink-700 leading-relaxed">
          <p>We respect your privacy and are committed to protecting your personal data.</p>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Data We Collect</h2>
            <p className="mt-3">
              We collect name, email, phone number, and booking information when you use our services.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">How We Use Data</h2>
            <p className="mt-3">
              Your data is used to process bookings, send confirmations, and improve our services. We do not sell your data to third parties.
            </p>
          </div>
          <div id="cookies">
            <h2 className="font-display text-xl font-semibold text-ink">Cookies</h2>
            <p className="mt-3">
              We use essential cookies for session and security. Analytics cookies are optional where offered.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">Contact</h2>
            <p className="mt-3">
              For privacy inquiries, contact{" "}
              <a href="mailto:hello@ueb3tours.com" className="text-pine-500 link-underline">
                hello@ueb3tours.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
