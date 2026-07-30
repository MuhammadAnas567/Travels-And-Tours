import { SectionContactPage } from "@/components/shared/section-contact-page";

/** Original guides / blog page preserved in `page.legacy.tsx`. */
export default function GuidesPage() {
  return (
    <SectionContactPage
      eyebrow="Guides"
      title="Ask a travel question"
      description="Looking for advice on a route or city? Write us and we will point you in the right direction."
      defaultSubject="Guides inquiry"
      kind="BLOG"
      heroVariant="blog"
    />
  );
}
