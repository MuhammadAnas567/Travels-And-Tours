import type { Metadata } from "next";
import { listFlights } from "@/lib/data/catalog";
import { SearchWidget } from "@/components/search/search-widget";
import { FlightResults } from "@/components/flights/flight-results";
import { CatalogHero } from "@/components/layout/catalog-hero";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Flights",
  description: "Search flights worldwide and compare fares by cabin class.",
};

type Props = {
  searchParams: Promise<{ from?: string; to?: string; date?: string }>;
};

export default async function FlightsPage({ searchParams }: Props) {
  const params = await searchParams;
  const flights = await listFlights({ from: params.from, to: params.to });

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
        description={
          params.from || params.to
            ? `${params.from ?? "Any"} → ${params.to ?? "Any"}`
            : "Search worldwide and book with flexible cabin options."
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <SearchWidget />
      </div>

      <FlightResults flights={rows} from={params.from} to={params.to} />
    </div>
  );
}
