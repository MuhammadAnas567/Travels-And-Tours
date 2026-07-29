import type { Metadata } from "next";
import { SearchWidgetLazy } from "@/components/search/search-widget-lazy";
import { FlightResults } from "@/components/flights/flight-results";
import { CatalogHero } from "@/components/layout/catalog-hero";
import {
  searchSerpApiFlights,
  type FlightSearchResponse,
} from "@/lib/flights/serpapi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flights",
  description:
    "Search and book international flights — live fares when configured, plus curated catalogue routes.",
};

type Props = {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    outboundDate?: string;
    returnDate?: string;
    tripType?: string;
    adults?: string;
    children?: string;
    cabinClass?: string;
    currency?: string;
    from?: string;
    to?: string;
    date?: string;
    return?: string;
    trip?: string;
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

function daysFromTodayISO(days: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Popular PK route shown when /flights opens with no query. */
const DEFAULT_ORIGIN = "KHI";
const DEFAULT_DESTINATION = "DXB";

export default async function FlightsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const origin = (sp.origin ?? sp.from ?? DEFAULT_ORIGIN).toUpperCase();
  const destination = (sp.destination ?? sp.to ?? DEFAULT_DESTINATION).toUpperCase();
  const outboundDate = sp.outboundDate ?? sp.date ?? daysFromTodayISO(7);
  const tripType = (sp.tripType ?? sp.trip ?? "roundtrip") === "oneway" ? "oneway" : "roundtrip";
  const returnDate =
    tripType === "oneway"
      ? undefined
      : (sp.returnDate ?? sp.return ?? daysFromTodayISO(14));
  const adults = sp.adults ? Math.min(9, Math.max(1, Number(sp.adults))) : 1;
  const children = sp.children ? Math.min(8, Math.max(0, Number(sp.children))) : 0;
  const cabinClass = sp.cabinClass
    ? Math.min(4, Math.max(1, Number(sp.cabinClass)))
    : sp.cabin?.toLowerCase().includes("first")
      ? 4
      : sp.cabin?.toLowerCase().includes("business")
        ? 3
        : 1;
  const currency = (() => {
    const raw = (sp.currency ?? "USD").toUpperCase();
    return raw === "PKR" || raw === "USD" ? raw : "USD";
  })();

  // Always search on /flights — default KHI→DXB when the URL has no route yet.
  const hasRoute = Boolean(origin && destination && outboundDate);
  const departLabel = formatSearchDate(outboundDate);
  const returnLabel = formatSearchDate(returnDate);
  const trip = tripType === "oneway" ? "One-way" : "Round trip";
  const cabin =
    cabinClass === 4
      ? "First"
      : cabinClass === 3
        ? "Business"
        : cabinClass === 2
          ? "Premium Economy"
          : "Economy";
  let payload: FlightSearchResponse | null = null;
  let errorMessage: string | null = null;

  if (hasRoute) {
    try {
      payload = await searchSerpApiFlights({
        origin,
        destination,
        outboundDate,
        returnDate: tripType === "roundtrip" ? returnDate ?? null : null,
        tripType,
        adults,
        children,
        cabinClass,
        currency,
      });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Flight search failed";
    }
  }

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="flights"
        eyebrow="Flights"
        title="Compare routes and cabin fares"
        description={
          hasRoute
            ? `Live Google Flights for ${origin} → ${destination}. Change the route above to compare other cities.`
            : "Search live Google Flights fares for Pakistani travellers, compare trends, and reveal booking options only when you choose an itinerary."
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-6">
        <SearchWidgetLazy />
      </div>

      {hasRoute ? (
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 mb-4">
          <div className="rounded-md border border-line bg-paper px-4 py-3 text-sm text-ink-700 shadow-sm">
            <span className="font-semibold text-ink-900">
              {origin} → {destination}
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
            <span className="text-ink-400"> · </span>
            {currency}
          </div>
        </div>
      ) : null}

      <FlightResults
        payload={payload}
        errorMessage={errorMessage}
        hasSearched={hasRoute}
        search={{
          origin,
          destination,
          outboundDate,
          returnDate: returnDate ?? null,
          tripType,
          adults,
          children,
          cabinClass,
          currency,
        }}
      />
    </div>
  );
}
