import { PlanTripForm } from "@/components/shared/plan-trip-form";
import { CatalogHero } from "@/components/layout/catalog-hero";

export const metadata = {
  title: "Build Your Trip",
  description: "Request a custom quote for your dream itinerary — outbound or inbound.",
};

export default function PlanTripPage() {
  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="plan"
        eyebrow="Custom travel"
        title="Build your perfect trip"
        description="Tell us where you want to go, and our experts will craft a personalised quote within 24 hours."
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="mx-auto max-w-2xl rounded-md border border-line bg-paper p-8 md:p-10 shadow-sm">
          <PlanTripForm />
        </div>
      </div>
    </div>
  );
}
