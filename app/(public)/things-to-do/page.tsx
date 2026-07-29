import { SectionContactPage } from "@/components/shared/section-contact-page";

/** Original destinations / things-to-do page preserved in `page.legacy.tsx`. */
export default function DestinationsPage() {
  return (
    <SectionContactPage
      eyebrow="Destinations"
      title="Ask about a destination"
      description="Tell us where you are considering — we will reply with ideas, timing, and next steps."
      defaultSubject="Destination inquiry"
      heroVariant="default"
    />
  );
}
