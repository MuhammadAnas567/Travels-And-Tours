import { SectionContactPage } from "@/components/shared/section-contact-page";

/** Original visa page preserved in `page.legacy.tsx`. */
export default function VisaPage() {
  return (
    <SectionContactPage
      eyebrow="Visa"
      title="Ask about a visa"
      description="Tell us your nationality and destination — we will guide you on visa requirements."
      defaultSubject="Visa inquiry"
      kind="VISA"
      heroVariant="visa"
    />
  );
}
