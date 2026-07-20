import { FALLBACK_RATES } from "@/lib/currency";
import type { NormalizedFlight } from "@/lib/providers/amadeus/flights";
import { duffelFetch, isDuffelConfigured } from "./client";

type DuffelPlace = { iata_code?: string; name?: string };
type DuffelCarrier = { iata_code?: string; name?: string };

type DuffelSegment = {
  origin?: DuffelPlace;
  destination?: DuffelPlace;
  departing_at?: string;
  arriving_at?: string;
  marketing_carrier_flight_number?: string;
  marketing_carrier?: DuffelCarrier;
  operating_carrier?: DuffelCarrier;
};

type DuffelOffer = {
  id: string;
  total_amount?: string;
  total_currency?: string;
  owner?: DuffelCarrier;
  slices?: Array<{
    duration?: string;
    segments?: DuffelSegment[];
  }>;
};

type OfferRequestResponse = {
  data?: {
    id?: string;
    offers?: DuffelOffer[];
  };
};

function parseDurationMins(isoDuration?: string) {
  if (!isoDuration) return 0;
  const m = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0);
}

/** Normalize offer total to USD for DisplayPrice */
function toUsd(amount: number, currency: string) {
  const c = currency.toUpperCase();
  if (c === "USD") return Math.round(amount);
  const rate = FALLBACK_RATES[c as keyof typeof FALLBACK_RATES];
  if (rate && rate > 0) return Math.round(amount / rate);
  return Math.round(amount);
}

export async function searchDuffelFlightOffers(input: {
  origin: string;
  destination: string;
  departureDate: string;
  adults?: number;
  cabin?: "economy" | "premium_economy" | "business" | "first";
}): Promise<NormalizedFlight[]> {
  if (!isDuffelConfigured()) return [];

  const origin = input.origin.trim().toUpperCase();
  const destination = input.destination.trim().toUpperCase();
  if (origin.length !== 3 || destination.length !== 3) return [];

  const adults = Math.max(1, Math.min(9, input.adults ?? 1));
  const cabin = input.cabin ?? "economy";

  const body = {
    data: {
      slices: [
        {
          origin,
          destination,
          departure_date: input.departureDate,
        },
      ],
      passengers: Array.from({ length: adults }, () => ({ type: "adult" })),
      cabin_class: cabin,
    },
  };

  const data = await duffelFetch<OfferRequestResponse>("/air/offer_requests", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const offers = data?.data?.offers ?? [];
  if (!offers.length) return [];

  return offers.slice(0, 20).map((offer, idx) => {
    const segments = offer.slices?.[0]?.segments ?? [];
    const first = segments[0];
    const last = segments[segments.length - 1];
    const carrier =
      first?.marketing_carrier?.iata_code ??
      offer.owner?.iata_code ??
      "XX";
    const airline =
      first?.operating_carrier?.name ??
      first?.marketing_carrier?.name ??
      offer.owner?.name ??
      carrier;
    const rawAmount = Number(offer.total_amount ?? 0);
    const currency = offer.total_currency ?? "USD";
    const priceUsd = toUsd(rawAmount, currency);
    const priceByClass: NormalizedFlight["priceByClass"] = {};
    if (cabin === "business") priceByClass.business = priceUsd;
    else if (cabin === "first") priceByClass.first = priceUsd;
    else priceByClass.economy = priceUsd;

    const flightNo = first?.marketing_carrier_flight_number;
    return {
      _id: `duffel-${offer.id}-${idx}`,
      airline,
      flightNumber: flightNo ? `${carrier}${flightNo}` : `${carrier}${idx + 1}`,
      from: first?.origin?.iata_code ?? origin,
      to: last?.destination?.iata_code ?? destination,
      departTime: first?.departing_at ?? new Date().toISOString(),
      arriveTime: last?.arriving_at ?? new Date().toISOString(),
      durationMins: parseDurationMins(offer.slices?.[0]?.duration),
      stops: Math.max(0, segments.length - 1),
      priceByClass,
      source: "duffel" as const,
    };
  });
}
