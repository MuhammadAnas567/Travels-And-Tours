import { InfoPage, infoMetadata } from "@/components/shared/info-page";

export const metadata = infoMetadata(
  "Investor Relations",
  "Information for investors interested in UEB3 Travel."
);

export default function InvestorsPage() {
  return (
    <InfoPage
      title="Investor relations"
      description="Updates for current and prospective investors."
      body={[
        "UEB3 Travel is a privately held travel technology company. We share financial and product updates with investors on a scheduled basis.",
        "If you represent an investment firm and would like an introduction, please reach out through our contact form with your firm name and focus area.",
      ]}
      ctaLabel="Contact IR"
    />
  );
}
