import { connectDB } from "@/lib/db/connect";
import { Hotel, Flight, Destination } from "@/lib/models";
import { FALLBACK_DESTINATIONS, FALLBACK_HOTELS } from "@/lib/data/home-fallback";
import { FALLBACK_FLIGHTS } from "@/lib/data/flight-fallback";

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
    const c = filters.city.toLowerCase();
    fallback = fallback.filter(
      (h) =>
        h.city.toLowerCase().includes(c) ||
        h.country.toLowerCase().includes(c) ||
        h.name.toLowerCase().includes(c)
    );
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
          .limit(filters.limit ?? 48)
          .lean()
          .exec(),
        [] as Awaited<ReturnType<typeof Hotel.find>>
      );
      if (Array.isArray(rows) && rows.length > 0) return rows;
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
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false);
    if (connected) {
      const query: Record<string, unknown> = {};
      if (filters.from) query.from = new RegExp(filters.from, "i");
      if (filters.to) query.to = new RegExp(filters.to, "i");
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
  if (filters.from) {
    const from = filters.from.toUpperCase();
    fallback = fallback.filter((f) => f.from.toUpperCase().includes(from));
  }
  if (filters.to) {
    const to = filters.to.toUpperCase();
    fallback = fallback.filter((f) => f.to.toUpperCase().includes(to));
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
