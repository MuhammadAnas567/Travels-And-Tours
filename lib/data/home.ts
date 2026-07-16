import { connectDB } from "@/lib/db/connect";
import { Destination, Hotel } from "@/lib/models";
import { FALLBACK_DESTINATIONS, FALLBACK_HOTELS } from "@/lib/data/home-fallback";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function getTrendingDestinations(limit = 8) {
  try {
    await withTimeout(connectDB(), 800);
    const rows = await withTimeout(
      Destination.find().sort({ popularity: -1 }).limit(limit).lean().exec(),
      800
    );
    if (rows.length > 0) return rows;
  } catch (err) {
    console.error("[home] getTrendingDestinations:", err);
  }
  return FALLBACK_DESTINATIONS.slice(0, limit).map((d) => ({ ...d }));
}

export async function getPopularHotels(limit = 6) {
  try {
    await withTimeout(connectDB(), 800);
    const rows = await withTimeout(
      Hotel.find().sort({ avgRating: -1, reviewCount: -1 }).limit(limit).lean().exec(),
      800
    );
    if (rows.length > 0) return rows;
  } catch (err) {
    console.error("[home] getPopularHotels:", err);
  }
  return FALLBACK_HOTELS.slice(0, limit).map((h) => ({ ...h }));
}

export async function getDealOfWeek() {
  try {
    await withTimeout(connectDB(), 800);
    const deal = await withTimeout(
      Hotel.findOne().sort({ pricePerNight: 1 }).lean().exec(),
      800
    );
    if (deal) return deal;
  } catch (err) {
    console.error("[home] getDealOfWeek:", err);
  }
  return { ...FALLBACK_HOTELS[0] };
}
