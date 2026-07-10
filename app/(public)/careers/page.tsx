import { InfoPage, infoMetadata } from "@/components/shared/info-page";

export const metadata = infoMetadata(
  "Careers",
  "Join UEB3 Travel — roles in product, operations, and destination partnerships."
);

export default function CareersPage() {
  return (
    <InfoPage
      title="Careers at UEB3 Travel"
      description="We're building a global travel platform with a small, ambitious team."
      body={[
        "We hire for product engineering, customer experience, and destination partnerships. Open roles are shared here as they open.",
        "Prefer to introduce yourself first? Send a short note and CV via our contact form — we read every application.",
      ]}
      ctaLabel="Get in touch"
    />
  );
}
