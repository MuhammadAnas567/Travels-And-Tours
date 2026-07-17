import type { HotelAvailabilityOffer, HotelAvailabilityQuery } from "./types";
import { getSandboxHotelAvailability } from "./sandbox";
import { getHotelbedsAvailability } from "./hotelbeds";

export async function getHotelAvailability(
  q: HotelAvailabilityQuery
): Promise<{ offers: HotelAvailabilityOffer[]; provider: "hotelbeds" | "sandbox" }> {
  if (process.env.HOTELBEDS_API_KEY && process.env.HOTELBEDS_API_SECRET) {
    const offers = await getHotelbedsAvailability(q);
    const provider = offers[0]?.provider === "hotelbeds" ? "hotelbeds" : "sandbox";
    return { offers, provider };
  }
  return { offers: getSandboxHotelAvailability(q), provider: "sandbox" };
}

export type { HotelAvailabilityOffer, HotelAvailabilityQuery };
