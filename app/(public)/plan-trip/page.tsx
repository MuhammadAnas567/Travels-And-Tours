import { Container, Section, SectionHeader } from "@/components/ui/section";
import { PlanTripForm } from "@/components/shared/plan-trip-form";

export const metadata = {
  title: "Build Your Trip",
  description: "Request a custom quote for your dream itinerary — outbound or inbound.",
};

export default function PlanTripPage() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-2xl">
          <SectionHeader
            eyebrow="Custom Travel"
            title="Build your perfect trip"
            description="Tell us where you want to go, and our experts will craft a personalised quote within 24 hours."
            align="center"
          />
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-8 shadow-md">
            <PlanTripForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
