import { getCachedFlights } from "@/lib/catalog-cache";
import { searchAmadeusFlightOffers, type NormalizedFlight } from "@/lib/providers/amadeus/flights";
import { isAmadeusConfigured } from "@/lib/providers/amadeus/client";
import { searchDuffelFlightOffers } from "@/lib/providers/duffel/flights";
import { isDuffelConfigured } from "@/lib/providers/duffel/client";

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export async function searchFlights(input: {
  from?: string;
  to?: string;
  date?: string;
  adults?: number;
  cabin?: string;
}): Promise<NormalizedFlight[]> {
  const from = (input.from ?? "").trim().toUpperCase();
  const to = (input.to ?? "").trim().toUpperCase();
  const date = input.date || tomorrowISO();

  const cabinRaw = (input.cabin ?? "economy").toLowerCase();
  const duffelCabin =
    cabinRaw.includes("business")
      ? ("business" as const)
      : cabinRaw.includes("first")
        ? ("first" as const)
        : ("economy" as const);
  const amadeusClass =
    duffelCabin === "business"
      ? "BUSINESS"
      : duffelCabin === "first"
        ? "FIRST"
        : "ECONOMY";

  const live: NormalizedFlight[] = [];
  if (from.length === 3 && to.length === 3) {
    // Prefer Duffel (self-serve) when configured; then Amadeus.
    if (isDuffelConfigured()) {
      try {
        const offers = await searchDuffelFlightOffers({
          origin: from,
          destination: to,
          departureDate: date,
          adults: input.adults ?? 1,
          cabin: duffelCabin,
        });
        live.push(...offers);
      } catch (e) {
        console.error("[searchFlights] duffel", e);
      }
    }

    if (!live.length && isAmadeusConfigured()) {
      try {
        const offers = await searchAmadeusFlightOffers({
          origin: from,
          destination: to,
          departureDate: date,
          adults: input.adults ?? 1,
          travelClass: amadeusClass,
        });
        live.push(...offers);
      } catch (e) {
        console.error("[searchFlights] amadeus", e);
      }
    }
  }

  const catalog = await getCachedFlights();
  const catalogRows: NormalizedFlight[] = catalog.map((f) => ({
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
          first: f.priceByClass.first,
        }
      : undefined,
    source: "catalog" as const,
  }));

  const filteredCatalog =
    from && to
      ? catalogRows.filter(
          (f) =>
            f.from.toUpperCase() === from && f.to.toUpperCase() === to
        )
      : catalogRows;

  if (live.length) {
    return [...live, ...filteredCatalog];
  }
  return filteredCatalog.length ? filteredCatalog : catalogRows;
}
