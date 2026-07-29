import { SectionContactPage } from "@/components/shared/section-contact-page";

/** Original car hire page preserved in `page.legacy.tsx`. */
export default function CarsPage() {
  return (
    <SectionContactPage
      eyebrow="Car hire"
      title="Ask about car hire"
      description="Share pickup city, dates, and travellers — we will reply with car options."
      defaultSubject="Car hire inquiry"
      heroVariant="cars"
    />
  );
}
