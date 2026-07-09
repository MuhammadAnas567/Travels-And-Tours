import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveVisaCountries } from "@/lib/visa";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Visa Assistance",
  description:
    "Expert visa help for Pakistanis travelling to Dubai, Turkey, Saudi, Malaysia, Europe and more.",
};

export default async function VisaIndexPage() {
  const countries = await getActiveVisaCountries();

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Visa Services"
          title="Visa assistance for every destination"
          description="We guide you through documents, fees, and submission — so you travel with confidence, not confusion."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((visa) => (
            <Link
              key={visa.id}
              href={`/visa/${visa.countrySlug}`}
              className="group rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{visa.flagEmoji ?? "🌍"}</span>
                <Badge variant="secondary">{visa.visaType}</Badge>
              </div>
              <h3 className="mt-4 font-display text-xl font-medium text-ink group-hover:text-primary">
                {visa.country}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted">
                {visa.processingTime} · Service from{" "}
                {formatCurrency(visa.serviceFee, "PKR")}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                View requirements <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
        {countries.length === 0 && (
          <p className="text-center text-muted">Visa information coming soon.</p>
        )}
      </Container>
    </Section>
  );
}
