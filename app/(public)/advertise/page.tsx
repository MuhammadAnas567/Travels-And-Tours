import { InfoPage, infoMetadata } from "@/components/shared/info-page";

export const metadata = infoMetadata(
  "Advertise",
  "Advertise destinations and travel products to UEB3 travellers."
);

export default function AdvertisePage() {
  return (
    <InfoPage
      title="Advertise with us"
      description="Reach travellers actively planning their next trip."
      body={[
        "Sponsored placements appear on destination and search surfaces where intent is high. Formats include featured stays, package highlights, and newsletter spots.",
        "Share your campaign goals and markets — our ads team will propose inventory and pricing.",
      ]}
      ctaLabel="Request media kit"
    />
  );
}
