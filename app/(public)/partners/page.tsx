import { InfoPage, infoMetadata } from "@/components/shared/info-page";

export const metadata = infoMetadata(
  "Partners",
  "List your property or become a UEB3 Travel supply partner."
);

export default function PartnersPage() {
  return (
    <InfoPage
      title="Partner with UEB3"
      description="Hotels, tour operators, and local experiences — grow with our travellers."
      body={[
        "Property owners and operators can list stays and packages on UEB3 Travel. We focus on clear rates, reliable availability, and fair cancellation policies.",
        "Tell us about your inventory and markets you serve. Our partnerships team will follow up with next steps.",
      ]}
      ctaLabel="Become a partner"
    />
  );
}
