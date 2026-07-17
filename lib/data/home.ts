import { connectDB } from "@/lib/db/connect";
import { Destination, Hotel } from "@/lib/models";
import { FALLBACK_DESTINATIONS, FALLBACK_HOTELS } from "@/lib/data/home-fallback";

function homeTimeoutMs() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production" ? 10_000 : 3_000;
}

/** Resolve with fallback on timeout — never reject (avoids Next.js red console noise) */
async function withTimeoutFallback<T>(
  promise: Promise<T>,
  fallback: T,
  ms = homeTimeoutMs()
): Promise<T> {
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
    const connected = await withTimeoutFallback(connectDB().then(() => true), false);
    if (!connected) return fallback;
    const rows = await withTimeoutFallback(
      Destination.find().sort({ popularity: -1 }).limit(limit).lean().exec(),
      [] as Awaited<ReturnType<typeof Destination.find>>
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
    const connected = await withTimeoutFallback(connectDB().then(() => true), false);
    if (!connected) return fallback;
    const rows = await withTimeoutFallback(
      Hotel.find().sort({ avgRating: -1, reviewCount: -1 }).limit(limit).lean().exec(),
      [] as Awaited<ReturnType<typeof Hotel.find>>
    );
    if (Array.isArray(rows) && rows.length > 0) return rows;
  } catch {
    // use fallback
  }
  return fallback;
}

export async function getDealOfTheWeek() {
  const fallback = { ...FALLBACK_HOTELS[0] };
  try {
    const connected = await withTimeoutFallback(connectDB().then(() => true), false);
    if (!connected) return fallback;
    const row = await withTimeoutFallback(
      Hotel.findOne().sort({ avgRating: -1 }).lean().exec(),
      null
    );
    if (row) return row;
  } catch {
    // use fallback
  }
  return fallback;
}
