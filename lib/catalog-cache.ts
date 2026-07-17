import { FALLBACK_HOTELS } from "@/lib/data/home-fallback";
import { FALLBACK_FLIGHTS, type FallbackFlight } from "@/lib/data/flight-fallback";
import { HOTEL_CATALOGUE } from "@/lib/data/hotel-catalogue";
import { listFlights, listHotels } from "@/lib/data/catalog";

/** Instant hotel catalogue — DB + full offline catalogue (never empty detail links) */
export async function getCachedHotels() {
  try {
    const rows = await listHotels({ limit: 48 });
    if (rows.length > 0) {
      return rows.map((h) => ({
        _id: String(h._id),
        name: String(h.name),
        slug: String(h.slug),
        city: String(h.city),
        country: String(h.country),
        starRating: Number(h.starRating) || 4,
        images: Array.isArray(h.images) ? (h.images as string[]) : [],
        avgRating: Number(h.avgRating) || 4.5,
        reviewCount: Number(h.reviewCount) || 0,
        pricePerNight: Number(h.pricePerNight) || 0,
        amenities: Array.isArray(h.amenities) ? (h.amenities as string[]) : [],
        description:
          "description" in h && typeof h.description === "string"
            ? h.description
            : `${h.name} in ${h.city}`,
        tags: "tags" in h && Array.isArray(h.tags) ? (h.tags as string[]) : [],
      }));
    }
  } catch {
    // fall through
  }
  return HOTEL_CATALOGUE.map((h) => ({ ...h }));
}

/** Flights for live demo — DB first, then curated routes */
export async function getCachedFlights(): Promise<FallbackFlight[]> {
  try {
    const rows = await listFlights({ limit: 40 });
    if (rows.length > 0) {
      return rows.map((f) => ({
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
        priceByClass: {
          economy: f.priceByClass?.economy ?? 0,
          business: f.priceByClass?.business ?? 0,
          first:
            f.priceByClass && "first" in f.priceByClass
              ? (f.priceByClass as { first?: number }).first
              : undefined,
        },
      }));
    }
  } catch {
    // fall through
  }
  return FALLBACK_FLIGHTS.map((f) => ({ ...f }));
}

/** @deprecated prefer HOTEL_CATALOGUE — kept for imports */
export { FALLBACK_HOTELS };
