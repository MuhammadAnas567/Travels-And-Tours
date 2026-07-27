import { connectDB } from "@/lib/db/connect";
import { Hotel, Flight, Destination } from "@/lib/models";
import { FALLBACK_DESTINATIONS, FALLBACK_HOTELS } from "@/lib/data/home-fallback";
import { FALLBACK_FLIGHTS } from "@/lib/data/flight-fallback";
import { matchesPlace, resolveAirport } from "@/lib/airports";

function catalogTimeoutMs() {
  // Vercel cold start + Atlas often exceeds 600ms — that caused hotel detail 404s
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production" ? 12_000 : 4_000;
}

async function withTimeoutFallback<T>(promise: Promise<T>, fallback: T, ms = catalogTimeoutMs()): Promise<T> {
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

function filterFallbackHotels(filters: HotelListFilters) {
  let fallback = FALLBACK_HOTELS.map((h) => ({ ...h }));
  if (filters.city) {
    const c = filters.city;
    fallback = fallback.filter(
      (h) =>
        matchesPlace(h.city, c) ||
        matchesPlace(h.country, c) ||
        matchesPlace(h.name, c)
    );
  }
  if (filters.q) {
    const q = filters.q;
    fallback = fallback.filter(
      (h) =>
        matchesPlace(h.name, q) ||
        matchesPlace(h.city, q) ||
        matchesPlace(h.country, q)
    );
  }
  if (filters.tag) {
    const t = filters.tag.toLowerCase();
    fallback = fallback.filter((h) =>
      ("tags" in h && Array.isArray(h.tags) ? h.tags : []).some((tag) =>
        String(tag).toLowerCase().includes(t)
      )
    );
  }
  if (filters.minPrice != null) {
    fallback = fallback.filter((h) => h.pricePerNight >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    fallback = fallback.filter((h) => h.pricePerNight <= filters.maxPrice!);
  }
  return fallback.slice(0, filters.limit ?? 48);
}

export async function listHotels(filters: HotelListFilters = {}) {
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false);
    if (connected) {
      const query: Record<string, unknown> = {};
      // City/q filtered in memory via matchesPlace (accents: Male ↔ Malé)
      if (filters.tag) query.tags = new RegExp(filters.tag, "i");
      if (filters.minPrice != null || filters.maxPrice != null) {
        const price: Record<string, number> = {};
        if (filters.minPrice != null) price.$gte = filters.minPrice;
        if (filters.maxPrice != null) price.$lte = filters.maxPrice;
        query.pricePerNight = price;
      }
      const rows = await withTimeoutFallback(
        Hotel.find(query)
          .sort({ avgRating: -1, reviewCount: -1 })
          .limit(Math.max(filters.limit ?? 48, 120))
          .lean()
          .exec(),
        [] as Awaited<ReturnType<typeof Hotel.find>>
      );
      if (Array.isArray(rows) && rows.length > 0) {
        let list = rows as Array<{
          name: string;
          city: string;
          country: string;
          pricePerNight: number;
          tags?: string[];
        }>;
        if (filters.city) {
          const c = filters.city;
          list = list.filter(
            (h) =>
              matchesPlace(h.city, c) ||
              matchesPlace(h.country, c) ||
              matchesPlace(h.name, c)
          );
        }
        if (filters.q) {
          const q = filters.q;
          list = list.filter(
            (h) =>
              matchesPlace(h.name, q) ||
              matchesPlace(h.city, q) ||
              matchesPlace(h.country, q)
          );
        }
        return list.slice(0, filters.limit ?? 48);
      }
    }
  } catch {
    // fall through
  }
  return filterFallbackHotels(filters);
}

export async function getHotelBySlug(slug: string) {
  const normalized = decodeURIComponent(slug).trim();
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false);
    if (connected) {
      const hotel = await withTimeoutFallback(
        Hotel.findOne({ slug: normalized }).lean().exec(),
        null
      );
      if (hotel) return hotel;
    }
  } catch {
    // fall through
  }
  return FALLBACK_HOTELS.find((h) => h.slug === normalized) ?? null;
}

export type FlightListFilters = {
  from?: string;
  to?: string;
  limit?: number;
};

function isMongoObjectId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}

export async function listFlights(filters: FlightListFilters = {}) {
  const fromCode = filters.from ? resolveAirport(filters.from) : "";
  const toCode = filters.to ? resolveAirport(filters.to) : "";
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false);
    if (connected) {
      const query: Record<string, unknown> = {};
      if (fromCode) query.from = new RegExp(`^${fromCode}$`, "i");
      if (toCode) query.to = new RegExp(`^${toCode}$`, "i");
      const rows = await withTimeoutFallback(
        Flight.find(query)
          .sort({ departTime: 1 })
          .limit(filters.limit ?? 40)
          .lean()
          .exec(),
        [] as Awaited<ReturnType<typeof Flight.find>>
      );
      if (Array.isArray(rows) && rows.length > 0) return rows;
    }
  } catch {
    // fall through
  }
  let fallback = FALLBACK_FLIGHTS.map((f) => ({ ...f }));
  if (fromCode) {
    fallback = fallback.filter((f) => f.from.toUpperCase() === fromCode);
  }
  if (toCode) {
    fallback = fallback.filter((f) => f.to.toUpperCase() === toCode);
  }
  return fallback.slice(0, filters.limit ?? 40);
}

/** Resolve DB ObjectId or curated fallback ids like `fb-flight-khi-doj-1`. */
export async function getFlightById(id: string) {
  const normalized = decodeURIComponent(id).trim();
  if (!normalized) return null;

  const fallback = FALLBACK_FLIGHTS.find((f) => f._id === normalized);
  if (fallback) {
    return { ...fallback, seatsAvailable: 100 };
  }

  if (!isMongoObjectId(normalized)) return null;

  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false);
    if (connected) {
      const flight = await withTimeoutFallback(
        Flight.findById(normalized).lean().exec(),
        null
      );
      if (flight) return flight;
    }
  } catch {
    // fall through
  }
  return null;
}

export async function listDestinations(limit = 12) {
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false);
    if (connected) {
      const rows = await withTimeoutFallback(
        Destination.find().sort({ popularity: -1 }).limit(limit).lean().exec(),
        [] as Awaited<ReturnType<typeof Destination.find>>
      );
      if (Array.isArray(rows) && rows.length > 0) return rows;
    }
  } catch {
    // fall through
  }
  return FALLBACK_DESTINATIONS.slice(0, limit).map((d) => ({ ...d }));
}
