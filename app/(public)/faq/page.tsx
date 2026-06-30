import type { Metadata } from "next";

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
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ocean-900">Frequently Asked Questions</h1>
      <div className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-xl border border-ocean-100 bg-white p-5"
          >
            <summary className="cursor-pointer font-medium text-ocean-900 marker:content-none">
              {faq.q}
            </summary>
            <p className="mt-3 text-gray-600">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
