import { connectDB } from "@/lib/db/connect";
import { Destination, Hotel } from "@/lib/models";
import { FALLBACK_DESTINATIONS, FALLBACK_HOTELS } from "@/lib/data/home-fallback";

/** Resolve with fallback on timeout — never reject (avoids Next.js red console noise) */
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

export async function getTrendingDestinations(limit = 8) {
  const fallback = FALLBACK_DESTINATIONS.slice(0, limit).map((d) => ({ ...d }));
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false, 600);
    if (!connected) return fallback;
    const rows = await withTimeoutFallback(
      Destination.find().sort({ popularity: -1 }).limit(limit).lean().exec(),
      [] as Awaited<ReturnType<typeof Destination.find>>,
      600
    );
    if (Array.isArray(rows) && rows.length > 0) return rows;
  } catch {
    // use fallback
  }
  return fallback;
}

export async function getPopularHotels(limit = 6) {
  const fallback = FALLBACK_HOTELS.slice(0, limit).map((h) => ({ ...h }));
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false, 600);
    if (!connected) return fallback;
    const rows = await withTimeoutFallback(
      Hotel.find().sort({ avgRating: -1, reviewCount: -1 }).limit(limit).lean().exec(),
      [] as Awaited<ReturnType<typeof Hotel.find>>,
      600
    );
    if (Array.isArray(rows) && rows.length > 0) return rows;
  } catch {
    // use fallback
  }
  return fallback;
}

export async function getDealOfWeek() {
  const fallback = { ...FALLBACK_HOTELS[0] };
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false, 600);
    if (!connected) return fallback;
    const deal = await withTimeoutFallback(
      Hotel.findOne().sort({ pricePerNight: 1 }).lean().exec(),
      null,
      600
    );
    if (deal) return deal;
  } catch {
    // use fallback
  }
  return fallback;
}
