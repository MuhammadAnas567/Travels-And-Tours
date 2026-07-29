import { SectionContactPage } from "@/components/shared/section-contact-page";

/** Original hotels catalogue preserved in `page.legacy.tsx`. */
export default function HotelsPage() {
  return (
    <SectionContactPage
      eyebrow="Hotels"
      title="Ask about a hotel stay"
      description="Tell us your city, dates, and room needs — we will reply with options that fit."
      defaultSubject="Hotel inquiry"
      heroVariant="hotels"
    />
  );
}
