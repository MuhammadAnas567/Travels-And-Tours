import { FALLBACK_HOTELS } from "@/lib/data/home-fallback";

type FlightRow = {
  _id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  from: string;
  to: string;
  departTime: Date | string;
  arriveTime: Date | string;
  durationMins: number;
  stops: number;
  priceByClass?: { economy?: number; business?: number; first?: number };
};

/** Instant hotel catalogue for live — no Atlas wait on navbar clicks */
export async function getCachedHotels() {
  return FALLBACK_HOTELS.map((h) => ({ ...h }));
}

/** Typed empty catalogue — keeps /flights statically buildable */
export async function getCachedFlights(): Promise<FlightRow[]> {
  return [];
}
