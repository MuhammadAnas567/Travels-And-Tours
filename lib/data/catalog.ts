import { connectDB } from "@/lib/db/connect";
import { Hotel, Flight, Destination } from "@/lib/models";
import { FALLBACK_DESTINATIONS, FALLBACK_HOTELS } from "@/lib/data/home-fallback";
import {
  filterCatalogueHotels,
  getCatalogueHotelBySlug,
  HOTEL_CATALOGUE,
} from "@/lib/data/hotel-catalogue";

const DETAIL_TIMEOUT_MS = process.env.VERCEL ? 8000 : 3000;
const LIST_TIMEOUT_MS = process.env.VERCEL ? 4000 : 1500;

async function withTimeoutFallback<T>(promise: Promise<T>, fallback: T, ms: number): Promise<T> {
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

function mergeHotelsBySlug(
  primary: Array<Record<string, unknown>>,
  secondary: Array<Record<string, unknown>>
) {
  const map = new Map<string, Record<string, unknown>>();
  for (const h of secondary) {
    const slug = String(h.slug ?? "");
    if (slug) map.set(slug, h);
  }
  for (const h of primary) {
    const slug = String(h.slug ?? "");
    if (slug) map.set(slug, h);
  }
  return Array.from(map.values());
}

export async function listHotels(filters: HotelListFilters = {}) {
  let dbRows: Array<Record<string, unknown>> = [];
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false, 1200);
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
        [] as Awaited<ReturnType<typeof Hotel.find>>,
        LIST_TIMEOUT_MS
      );
      if (Array.isArray(rows)) dbRows = rows as Array<Record<string, unknown>>;
    }
  } catch {
    // continue with catalogue
  }

  const catalogue = filterCatalogueHotels(filters).map((h) => ({ ...h }));
  const legacy = FALLBACK_HOTELS.map((h) => ({ ...h, tags: [] as string[] }));
  const merged = mergeHotelsBySlug(
    dbRows,
    mergeHotelsBySlug(catalogue as unknown as Array<Record<string, unknown>>, legacy as unknown as Array<Record<string, unknown>>)
  );

  // Client-side style filter on merged (covers DB rows missing tags filter etc.)
  let list = merged;
  if (filters.city) {
    const c = filters.city.toLowerCase();
    list = list.filter((h) => {
      const city = String(h.city ?? "").toLowerCase();
      const country = String(h.country ?? "").toLowerCase();
      const name = String(h.name ?? "").toLowerCase();
      return city.includes(c) || country.includes(c) || name.includes(c);
    });
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter((h) => {
      const name = String(h.name ?? "").toLowerCase();
      const city = String(h.city ?? "").toLowerCase();
      const country = String(h.country ?? "").toLowerCase();
      return name.includes(q) || city.includes(q) || country.includes(q);
    });
  }
  if (filters.tag) {
    const t = filters.tag.toLowerCase();
    list = list.filter((h) => {
      const tags = Array.isArray(h.tags) ? (h.tags as string[]) : [];
      return tags.some((x) => x.toLowerCase().includes(t));
    });
  }

  return list.slice(0, filters.limit ?? 48);
}

export async function getHotelBySlug(slug: string) {
  const key = slug.trim().toLowerCase();

  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false, 2000);
    if (connected) {
      const hotel = await withTimeoutFallback(
        Hotel.findOne({ slug: key }).lean().exec(),
        null,
        DETAIL_TIMEOUT_MS
      );
      if (hotel) return hotel;
    }
  } catch {
    // fall through
  }

  const fromCatalogue = getCatalogueHotelBySlug(key);
  if (fromCatalogue) return fromCatalogue;

  return FALLBACK_HOTELS.find((h) => h.slug === key) ?? null;
}

export type FlightListFilters = {
  from?: string;
  to?: string;
  limit?: number;
};

export async function listFlights(filters: FlightListFilters = {}) {
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false, 1200);
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
      LIST_TIMEOUT_MS
    );
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export async function listDestinations(limit = 12) {
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false, 1200);
    if (connected) {
      const rows = await withTimeoutFallback(
        Destination.find().sort({ popularity: -1 }).limit(limit).lean().exec(),
        [] as Awaited<ReturnType<typeof Destination.find>>,
        LIST_TIMEOUT_MS
      );
      if (Array.isArray(rows) && rows.length > 0) return rows;
    }
  } catch {
    // fall through
  }
  return FALLBACK_DESTINATIONS.slice(0, limit).map((d) => ({ ...d }));
}

export { HOTEL_CATALOGUE };
