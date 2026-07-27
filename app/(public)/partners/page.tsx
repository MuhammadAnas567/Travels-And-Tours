import { InfoPage, infoMetadata } from "@/components/shared/info-page";

export const metadata = infoMetadata(
  "Partners",
  "List your property or become a Arreat Travels & Tours supply partner."
);

export default function PartnersPage() {
  return (
    <InfoPage
      title="Partner with Arreat"
      description="Hotels, tour operators, and local experiences — grow with our travellers."
      body={[
        "Property owners and operators can list stays and packages on Arreat Travels & Tours. We focus on clear rates, reliable availability, and fair cancellation policies.",
        "Tell us about your inventory and markets you serve. Our partnerships team will follow up with next steps.",
      ]}
      ctaLabel="Become a partner"
    />
  );
}
