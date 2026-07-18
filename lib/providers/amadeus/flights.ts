import { amadeusFetch, isAmadeusConfigured } from "./client";

export type NormalizedFlight = {
  _id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  durationMins: number;
  stops: number;
  priceByClass?: { economy?: number; business?: number; first?: number };
  source: "amadeus" | "catalog";
};

type AmadeusOffer = {
  id: string;
  source?: string;
  itineraries?: Array<{
    duration?: string;
    segments?: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
      numberOfStops?: number;
    }>;
  }>;
  price?: { total?: string; currency?: string };
  travelerPricings?: Array<{
    fareDetailsBySegment?: Array<{ cabin?: string }>;
  }>;
};

function parseDurationMins(isoDuration?: string) {
  if (!isoDuration) return 0;
  const m = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0);
}

function cabinBucket(cabin?: string): "economy" | "business" | "first" {
  const c = (cabin ?? "").toUpperCase();
  if (c.includes("BUSINESS") || c === "C" || c === "J") return "business";
  if (c.includes("FIRST") || c === "F") return "first";
  return "economy";
}

export async function searchAmadeusFlightOffers(input: {
  origin: string;
  destination: string;
  departureDate: string;
  adults?: number;
  travelClass?: string;
}): Promise<NormalizedFlight[]> {
  if (!isAmadeusConfigured()) return [];

  const origin = input.origin.trim().toUpperCase();
  const destination = input.destination.trim().toUpperCase();
  if (origin.length !== 3 || destination.length !== 3) return [];

  const params = new URLSearchParams({
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate: input.departureDate,
    adults: String(input.adults ?? 1),
    currencyCode: "USD",
    max: "20",
  });
  if (input.travelClass) {
    params.set("travelClass", input.travelClass.toUpperCase());
  }

  const data = await amadeusFetch<{ data?: AmadeusOffer[] }>(
    `/v2/shopping/flight-offers?${params.toString()}`
  );

  if (!data?.data?.length) return [];

  return data.data.map((offer, idx) => {
    const segments = offer.itineraries?.[0]?.segments ?? [];
    const first = segments[0];
    const last = segments[segments.length - 1];
    const price = Number(offer.price?.total ?? 0);
    const cabin = cabinBucket(
      offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin
    );
    const priceByClass: NormalizedFlight["priceByClass"] = {};
    if (cabin === "business") priceByClass.business = price;
    else if (cabin === "first") priceByClass.first = price;
    else priceByClass.economy = price;

    return {
      _id: `amadeus-${offer.id}-${idx}`,
      airline: first?.carrierCode ?? "XX",
      flightNumber: `${first?.carrierCode ?? "XX"}${first?.number ?? ""}`,
      from: first?.departure.iataCode ?? origin,
      to: last?.arrival.iataCode ?? destination,
      departTime: first?.departure.at ?? new Date().toISOString(),
      arriveTime: last?.arrival.at ?? new Date().toISOString(),
      durationMins: parseDurationMins(offer.itineraries?.[0]?.duration),
      stops: Math.max(0, segments.length - 1),
      priceByClass,
      source: "amadeus" as const,
    };
  });
}
