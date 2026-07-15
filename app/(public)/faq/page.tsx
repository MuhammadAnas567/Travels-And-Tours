import type { Metadata } from "next";
import { CatalogHero } from "@/components/layout/catalog-hero";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about booking tours with UEB3 Tours.",
};

const faqs = [
  {
    q: "How do I book a tour?",
    a: "Browse our tours, select your preferred dates and number of travelers, then complete the secure checkout via Stripe.",
  },
  {
    q: "What is your cancellation policy?",
    a: "You can cancel free of charge up to 7 days before departure. Cancellations within 7 days may incur fees.",
  },
  {
    q: "Are flights included?",
    a: "International flights are typically not included unless stated in the tour package. Check the included/excluded items on each tour page.",
  },
  {
    q: "How do I get my e-ticket?",
    a: "After payment confirmation, you'll receive an email with a link to your e-ticket. You can also access it from your dashboard.",
  },
  {
    q: "Can I leave a review?",
    a: "Yes! After completing a tour, you can leave a star rating and comment from your dashboard.",
  },
];

export default function FAQPage() {
  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        eyebrow="Help"
        title="Frequently asked questions"
        description="Answers about booking, cancellations, tickets, and reviews."
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-md border border-line bg-paper p-5 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none font-display text-base font-semibold text-ink marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded-sm [&::-webkit-details-marker]:hidden">
                {faq.q}
              </summary>
              <p className="mt-3 max-w-prose text-sm text-ink-500 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
