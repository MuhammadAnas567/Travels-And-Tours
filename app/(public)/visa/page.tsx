import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveVisaCountries } from "@/lib/visa";
import { CatalogHero, EmptyCatalog } from "@/components/layout/catalog-hero";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";

export const revalidate = 60;

export const metadata = {
  title: "Visa Assistance",
  description:
    "Expert visa help for Pakistanis travelling to Dubai, Turkey, Saudi, Malaysia, Europe and more.",
};

export default async function VisaIndexPage() {
  const countries = await getActiveVisaCountries();

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="visa"
        eyebrow="Visa Services"
        title="Visa assistance for every destination"
        description="Documents, fees, and submission — so you travel with confidence, not confusion."
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 pb-20">
        {countries.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((visa) => (
              <Link
                key={visa.id}
                href={`/visa/${visa.countrySlug}`}
                className="group rounded-md border border-line bg-paper p-6 shadow-sm transition-[box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-brand)] hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
              >
                <div className="flex items-start justify-between">
                  <span
                    className="flex h-11 min-w-11 items-center justify-center rounded-sm border border-line bg-sand px-2 font-display text-sm font-semibold tracking-wide text-pine-500"
                    aria-hidden
                  >
                    {(visa.countrySlug ?? visa.country).slice(0, 2).toUpperCase()}
                  </span>
                  <Badge variant="secondary">{visa.visaType}</Badge>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink group-hover:text-pine-500">
                  {visa.country}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-ink-500">
                  {visa.processingTime} · Service from{" "}
                  {formatCurrency(visa.serviceFee, "PKR")}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-pine-500">
                  View requirements{" "}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyCatalog
            title="Visa information coming soon"
            description="Check back shortly or contact our team for destination-specific guidance."
          />
        )}
      </div>
    </div>
  );
}
