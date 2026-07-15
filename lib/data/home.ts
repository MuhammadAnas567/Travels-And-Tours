import { connectDB } from "@/lib/db/connect";
import { Destination, Hotel } from "@/lib/models";
import { FALLBACK_DESTINATIONS, FALLBACK_HOTELS } from "@/lib/data/home-fallback";

export async function getTrendingDestinations(limit = 8) {
  try {
    await connectDB();
    const rows = await Destination.find()
      .sort({ popularity: -1 })
      .limit(limit)
      .lean();
    if (rows.length > 0) return rows;
  } catch (err) {
    console.error("[home] getTrendingDestinations:", err);
  }
  return FALLBACK_DESTINATIONS.slice(0, limit).map((d) => ({ ...d }));
}

export async function getPopularHotels(limit = 6) {
  try {
    await connectDB();
    const rows = await Hotel.find()
      .sort({ avgRating: -1, reviewCount: -1 })
      .limit(limit)
      .lean();
    if (rows.length > 0) return rows;
  } catch (err) {
    console.error("[home] getPopularHotels:", err);
  }
  return FALLBACK_HOTELS.slice(0, limit).map((h) => ({ ...h }));
}

export async function getDealOfWeek() {
  try {
    await connectDB();
    const deal = await Hotel.findOne().sort({ pricePerNight: 1 }).lean();
    if (deal) return deal;
  } catch (err) {
    console.error("[home] getDealOfWeek:", err);
  }
  return { ...FALLBACK_HOTELS[0] };
}
