import { Suspense } from "react";
import type { Metadata } from "next";
import { getCachedFlights } from "@/lib/catalog-cache";
import { SearchWidget } from "@/components/search/search-widget";
import { FlightResults } from "@/components/flights/flight-results";
import { CatalogHero } from "@/components/layout/catalog-hero";

export const dynamic = "force-static";
export const revalidate = 120;

export const metadata: Metadata = {
  title: "Flights",
  description: "Search flights worldwide and compare fares by cabin class.",
};

export default async function FlightsPage() {
  const flights = await getCachedFlights();

  const rows = flights.map((f) => ({
    _id: String(f._id),
    airline: f.airline,
    airlineLogo: f.airlineLogo,
    flightNumber: f.flightNumber,
    from: f.from,
    to: f.to,
    departTime: new Date(f.departTime).toISOString(),
    arriveTime: new Date(f.arriveTime).toISOString(),
    durationMins: f.durationMins,
    stops: f.stops,
    priceByClass: f.priceByClass
      ? {
          economy: f.priceByClass.economy,
          business: f.priceByClass.business,
        }
      : undefined,
  }));

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="flights"
        eyebrow="Flights"
        title="Compare routes and cabin fares"
        description="Search worldwide and book with flexible cabin options."
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <Suspense fallback={<div className="h-[220px] rounded-md bg-paper border border-line animate-pulse" />}>
          <SearchWidget />
        </Suspense>
      </div>

      <FlightResults flights={rows} />
    </div>
  );
}
