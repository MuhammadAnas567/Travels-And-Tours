import type { Metadata } from "next";
import { searchFlights } from "@/lib/providers/flights";
import { SearchWidgetLazy } from "@/components/search/search-widget-lazy";
import { FlightResults } from "@/components/flights/flight-results";
import { CatalogHero } from "@/components/layout/catalog-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flights",
  description: "Search flights worldwide — live Amadeus fares when configured, plus catalogue routes.",
};

type Props = {
  searchParams: Promise<{
    from?: string;
    to?: string;
    date?: string;
    adults?: string;
    cabin?: string;
  }>;
};

export default async function FlightsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const flights = await searchFlights({
    from: sp.from,
    to: sp.to,
    date: sp.date,
    adults: sp.adults ? Number(sp.adults) : 1,
    cabin: sp.cabin,
  });

  const liveCount = flights.filter((f) => f.source === "amadeus").length;

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="flights"
        eyebrow="Flights"
        title="Compare routes and cabin fares"
        description={
          liveCount > 0
            ? `${liveCount} live Amadeus offers + catalogue routes.`
            : "Search worldwide. Connect Amadeus test keys for live fares."
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <SearchWidgetLazy />
      </div>

      <FlightResults flights={flights} />
    </div>
  );
}
