import { InfoPage, infoMetadata } from "@/components/shared/info-page";

export const metadata = infoMetadata(
  "Affiliate Program",
  "Earn commission by referring travellers to UEB3 Travel."
);

export default function AffiliatesPage() {
  return (
    <InfoPage
      title="Affiliate program"
      description="Share UEB3 with your audience and earn on qualified bookings."
      body={[
        "Creators, blogs, and travel communities can join our affiliate program. You get tracked links, creative assets, and commission on completed bookings.",
        "Apply with your site or social channels and expected monthly traffic. We'll send program terms once approved.",
      ]}
      ctaLabel="Apply to join"
    />
  );
}
