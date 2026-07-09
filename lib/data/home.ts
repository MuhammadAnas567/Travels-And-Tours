import { connectDB } from "@/lib/db/connect";
import { Destination, Hotel } from "@/lib/models";

export async function getTrendingDestinations(limit = 8) {
  try {
    await connectDB();
    return Destination.find().sort({ popularity: -1 }).limit(limit).lean();
  } catch {
    return [];
  }
}

export async function getPopularHotels(limit = 6) {
  try {
    await connectDB();
    return Hotel.find().sort({ avgRating: -1, reviewCount: -1 }).limit(limit).lean();
  } catch {
    return [];
  }
}

export async function getDealOfWeek() {
  try {
    await connectDB();
    return Hotel.findOne().sort({ pricePerNight: 1 }).lean();
  } catch {
    return null;
  }
}
