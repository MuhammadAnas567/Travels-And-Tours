import { SectionContactPage } from "@/components/shared/section-contact-page";

/** Original deals page preserved in `page.legacy.tsx`. */
export default function DealsPage() {
  return (
    <SectionContactPage
      eyebrow="Deals"
      title="Ask about current deals"
      description="Share your destination and dates — we will send deals that apply to your trip."
      defaultSubject="Deals inquiry"
      heroVariant="deals"
    />
  );
}
