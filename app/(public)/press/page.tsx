import { InfoPage, infoMetadata } from "@/components/shared/info-page";

export const metadata = infoMetadata(
  "Press",
  "Media resources and press contact for Arreat Travels & Tours."
);

export default function PressPage() {
  return (
    <InfoPage
      title="Press & media"
      description="Brand assets and interview requests for journalists and creators."
      body={[
        "Arreat Travels & Tours helps travellers book flights, hotels, and vacation packages worldwide.",
        "For press kits, founder interviews, or product announcements, contact our communications team. We typically respond within two business days.",
      ]}
      ctaLabel="Media enquiry"
    />
  );
}
