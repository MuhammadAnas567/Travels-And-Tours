import { SectionContactPage } from "@/components/shared/section-contact-page";

/** Original plan-a-trip page preserved in `page.legacy.tsx`. */
export default function PlanTripPage() {
  return (
    <SectionContactPage
      eyebrow="Plan a trip"
      title="Plan your trip with us"
      description="Share your destination, dates, and budget — we will help shape the itinerary."
      defaultSubject="Plan a trip inquiry"
      heroVariant="plan"
    />
  );
}