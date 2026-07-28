import type { Metadata } from "next";
import { searchFlights } from "@/lib/providers/flights";
import { SearchWidgetLazy } from "@/components/search/search-widget-lazy";
import { FlightResults } from "@/components/flights/flight-results";
import { CatalogHero } from "@/components/layout/catalog-hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flights",
  description:
    "Search and book international flights — live fares when configured, plus curated catalogue routes.",
};

type Props = {
  searchParams: Promise<{
    from?: string;
    to?: string;
    date?: string;
    return?: string;
    trip?: string;
    adults?: string;
    children?: string;
    cabin?: string;
  }>;
};

function formatSearchDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function FlightsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const adults = sp.adults ? Math.min(9, Math.max(1, Number(sp.adults))) : 1;
  const children = sp.children ? Math.min(8, Math.max(0, Number(sp.children))) : 0;

  const flights = await searchFlights({
    from: sp.from,
    to: sp.to,
    date: sp.date,
    adults,
    cabin: sp.cabin,
  });

  const liveCount = flights.filter((f) => f.source === "amadeus" || f.source === "duffel").length;
  const hasRoute = Boolean(sp.from && sp.to);
  const departLabel = formatSearchDate(sp.date);
  const returnLabel = formatSearchDate(sp.return);
  const trip = sp.trip === "oneway" || (!sp.return && sp.date) ? "One-way" : "Round trip";
  const cabin = (sp.cabin ?? "Economy").replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="flights"
        eyebrow="Flights"
        title="Compare routes and cabin fares"
        description={
          liveCount > 0
            ? `${liveCount} live offers + catalogue routes.`
            : "Search worldwide airports by city or IATA code — same flow as major booking sites."
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-6">
        <SearchWidgetLazy />
      </div>

      {hasRoute ? (
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 mb-4">
          <div className="rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink-700 shadow-sm">
            <span className="font-semibold text-ink-900">
              {sp.from} → {sp.to}
            </span>
            <span className="text-ink-400"> · </span>
            {trip}
            {departLabel ? (
              <>
                <span className="text-ink-400"> · </span>
                Depart {departLabel}
              </>
            ) : null}
            {returnLabel ? (
              <>
                <span className="text-ink-400"> · </span>
                Return {returnLabel}
              </>
            ) : null}
            <span className="text-ink-400"> · </span>
            {adults + children} traveller{adults + children === 1 ? "" : "s"}
            <span className="text-ink-400"> · </span>
            {cabin}
          </div>
        </div>
      ) : null}

      <FlightResults flights={flights} />
    </div>
  );
}
