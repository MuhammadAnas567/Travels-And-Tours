import { InfoPage, infoMetadata } from "@/components/shared/info-page";

export const metadata = infoMetadata(
  "Travel Insurance",
  "Add travel insurance to your UEB3 booking for medical and trip protection."
);

export default function InsurancePage() {
  return (
    <InfoPage
      title="Travel insurance"
      description="Protect your trip against cancellations, delays, and medical emergencies."
      body={[
        "We partner with licensed insurers to offer optional cover when you book. Policies vary by destination and trip length.",
        "Need help choosing cover? Our support team can walk you through options before you pay — start with a message on the contact page.",
      ]}
      ctaHref="/faq"
      ctaLabel="Read FAQs"
    />
  );
}
