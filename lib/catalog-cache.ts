import { FALLBACK_HOTELS } from "@/lib/data/home-fallback";

/** Instant hotel catalogue for live — no Atlas wait on navbar clicks */
export async function getCachedHotels() {
  return FALLBACK_HOTELS.map((h) => ({ ...h }));
}

/** Flights need live DB rows; return empty quickly when Atlas is cold */
export async function getCachedFlights() {
  return [];
}
