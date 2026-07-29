import { SectionContactPage } from "@/components/shared/section-contact-page";

/** Original tours catalogue preserved in `page.legacy.tsx`. */
export default function ToursPage() {
  return (
    <SectionContactPage
      eyebrow="Tours"
      title="Ask about a tour"
      description="Tell us where you want to go and when — we will suggest guided tours that match."
      defaultSubject="Tour inquiry"
      heroVariant="tours"
    />
  );
}
