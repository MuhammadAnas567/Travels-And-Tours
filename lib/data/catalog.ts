import { connectDB } from "@/lib/db/connect";
import { Hotel, Flight, Destination } from "@/lib/models";

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
    await connectDB();
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
    return Hotel.find(query)
      .sort({ avgRating: -1, reviewCount: -1 })
      .limit(filters.limit ?? 24)
      .lean();
  } catch {
    return [];
  }
}

export async function getHotelBySlug(slug: string) {
  try {
    await connectDB();
    return Hotel.findOne({ slug }).lean();
  } catch {
    return null;
  }
}

export type FlightListFilters = {
  from?: string;
  to?: string;
  limit?: number;
};

export async function listFlights(filters: FlightListFilters = {}) {
  try {
    await connectDB();
    const query: Record<string, unknown> = {};
    if (filters.from) query.from = new RegExp(filters.from, "i");
    if (filters.to) query.to = new RegExp(filters.to, "i");
    return Flight.find(query)
      .sort({ departTime: 1 })
      .limit(filters.limit ?? 30)
      .lean();
  } catch {
    return [];
  }
}

export async function listDestinations(limit = 12) {
  try {
    await connectDB();
    return Destination.find().sort({ popularity: -1 }).limit(limit).lean();
  } catch {
    return [];
  }
}
