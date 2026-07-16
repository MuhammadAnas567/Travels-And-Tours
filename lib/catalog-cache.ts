import { FALLBACK_HOTELS } from "@/lib/data/home-fallback";
import { FALLBACK_FLIGHTS, type FallbackFlight } from "@/lib/data/flight-fallback";
import { listFlights, listHotels } from "@/lib/data/catalog";

/** Instant hotel catalogue — DB first, then curated fallbacks */
export async function getCachedHotels() {
  try {
    const rows = await listHotels({ limit: 24 });
    if (rows.length > 0) {
      return rows.map((h) => ({
        _id: String(h._id),
        name: h.name,
        slug: h.slug,
        city: h.city,
        country: h.country,
        starRating: h.starRating,
        images: h.images,
        avgRating: h.avgRating,
        reviewCount: h.reviewCount,
        pricePerNight: h.pricePerNight,
        amenities: h.amenities ?? [],
        description:
          "description" in h && typeof h.description === "string"
            ? h.description
            : `${h.name} in ${h.city}`,
        tags: "tags" in h && Array.isArray(h.tags) ? h.tags : [],
      }));
    }
  } catch {
    // fall through
  }
  return FALLBACK_HOTELS.map((h) => ({ ...h, tags: [] as string[] }));
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
