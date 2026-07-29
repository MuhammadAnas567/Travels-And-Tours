import { SectionContactPage } from "@/components/shared/section-contact-page";

/** Original packages catalogue preserved in `page.legacy.tsx`. */
export default function PackagesPage() {
  return (
    <SectionContactPage
      eyebrow="Packages"
      title="Ask about a package"
      description="Share your destination and travel window — we will outline a package that fits."
      defaultSubject="Package inquiry"
      heroVariant="packages"
    />
  );
}
