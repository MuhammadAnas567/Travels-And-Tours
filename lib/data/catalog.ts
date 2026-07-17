import { connectDB } from "@/lib/db/connect";
import { Hotel, Flight, Destination } from "@/lib/models";
import { FALLBACK_DESTINATIONS, FALLBACK_HOTELS } from "@/lib/data/home-fallback";

async function withTimeoutFallback<T>(promise: Promise<T>, fallback: T, ms = 600): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export type HotelListFilters = {
  city?: string;
  q?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
};

export async function listHotels(filters: HotelListFilters = {}) {
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false, 600);
    if (connected) {
      const query: Record<string, unknown> = {};
      if (filters.city) query.city = new RegExp(filters.city, "i");
      if (filters.tag) query.tags = new RegExp(filters.tag, "i");
      if (filters.q) {
        query.$or = [
          { name: new RegExp(filters.q, "i") },
          { city: new RegExp(filters.q, "i") },
          { country: new RegExp(filters.q, "i") },
        ];
      }
      if (filters.minPrice != null || filters.maxPrice != null) {
        const price: Record<string, number> = {};
        if (filters.minPrice != null) price.$gte = filters.minPrice;
        if (filters.maxPrice != null) price.$lte = filters.maxPrice;
        query.pricePerNight = price;
      }
      const rows = await withTimeoutFallback(
        Hotel.find(query)
          .sort({ avgRating: -1, reviewCount: -1 })
          .limit(filters.limit ?? 24)
          .lean()
          .exec(),
        [] as Awaited<ReturnType<typeof Hotel.find>>,
        600
      );
      if (Array.isArray(rows) && rows.length > 0) return rows;
    }
  } catch {
    // fall through
  }
  let fallback = FALLBACK_HOTELS.map((h) => ({ ...h }));
  if (filters.city) {
    const c = filters.city.toLowerCase();
    fallback = fallback.filter((h) => h.city.toLowerCase().includes(c));
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    fallback = fallback.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.country.toLowerCase().includes(q)
    );
  }
  return fallback.slice(0, filters.limit ?? 24);
}

export async function getHotelBySlug(slug: string) {
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false, 600);
    if (connected) {
      const hotel = await withTimeoutFallback(
        Hotel.findOne({ slug }).lean().exec(),
        null,
        600
      );
      if (hotel) return hotel;
    }
  } catch {
    // fall through
  }
  return FALLBACK_HOTELS.find((h) => h.slug === slug) ?? null;
}

export type FlightListFilters = {
  from?: string;
  to?: string;
  limit?: number;
};

export async function listFlights(filters: FlightListFilters = {}) {
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false, 600);
    if (!connected) return [];
    const query: Record<string, unknown> = {};
    if (filters.from) query.from = new RegExp(filters.from, "i");
    if (filters.to) query.to = new RegExp(filters.to, "i");
    const rows = await withTimeoutFallback(
      Flight.find(query)
        .sort({ departTime: 1 })
        .limit(filters.limit ?? 30)
        .lean()
        .exec(),
      [] as Awaited<ReturnType<typeof Flight.find>>,
      600
    );
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export async function listDestinations(limit = 12) {
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false, 600);
    if (connected) {
      const rows = await withTimeoutFallback(
        Destination.find().sort({ popularity: -1 }).limit(limit).lean().exec(),
        [] as Awaited<ReturnType<typeof Destination.find>>,
        600
      );
      if (Array.isArray(rows) && rows.length > 0) return rows;
    }
  } catch {
    // fall through
  }
  return FALLBACK_DESTINATIONS.slice(0, limit).map((d) => ({ ...d }));
}
