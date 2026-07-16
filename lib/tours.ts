import { prisma, withDbTimeout } from "@/lib/db";
import type { Prisma, TourCategory } from "@prisma/client";
import { FALLBACK_TOURS, type FallbackTour } from "@/lib/data/tour-fallback";

const INTERNATIONAL_ONLY: Prisma.TourWhereInput = {
  NOT: { country: { equals: "Pakistan", mode: "insensitive" } },
};

export type TourFilters = {
  q?: string;
  category?: TourCategory;
  country?: string;
  audience?: "OUTBOUND" | "INBOUND";
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  date?: string;
  sort?: "price_asc" | "price_desc" | "rating" | "newest" | "popular";
  page?: number;
  limit?: number;
};

function filterFallbacks(filters: TourFilters): FallbackTour[] {
  let list = [...FALLBACK_TOURS];
  const q = filters.q?.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q)
    );
  }
  if (filters.country) {
    const c = filters.country.toLowerCase();
    list = list.filter((t) => t.country.toLowerCase() === c);
  }
  if (filters.category) {
    list = list.filter((t) => t.category === filters.category);
  }
  const limit = filters.limit ?? 12;
  const page = filters.page ?? 1;
  const start = (page - 1) * limit;
  return list.slice(start, start + limit);
}

export async function getTours(filters: TourFilters = {}) {
  const {
    q,
    category,
    country,
    minPrice,
    maxPrice,
    minDuration,
    maxDuration,
    minRating,
    date,
    sort = "popular",
    page = 1,
    limit = 12,
  } = filters;

  const empty = {
    tours: [] as FallbackTour[],
    total: 0,
    pages: 0,
    page,
  };

  try {
    const andFilters: Prisma.TourWhereInput[] = [];

    if (q) {
      andFilters.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
          { country: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    if (minPrice || maxPrice) {
      andFilters.push({
        OR: [
          {
            discountPrice: {
              ...(minPrice && { gte: minPrice }),
              ...(maxPrice && { lte: maxPrice }),
              not: null,
            },
          },
          {
            discountPrice: null,
            price: {
              ...(minPrice && { gte: minPrice }),
              ...(maxPrice && { lte: maxPrice }),
            },
          },
        ],
      });
    }

    const where: Prisma.TourWhereInput = {
      status: "ACTIVE",
      ...INTERNATIONAL_ONLY,
      ...(andFilters.length > 0 && { AND: andFilters }),
      ...(category && { category }),
      ...(country && { country: { equals: country, mode: "insensitive" } }),
      ...(minDuration && { durationDays: { gte: minDuration } }),
      ...(maxDuration && { durationDays: { lte: maxDuration } }),
      ...(minRating && { avgRating: { gte: minRating } }),
      ...(date && {
        availableDates: {
          some: {
            startDate: { gte: new Date(date) },
          },
        },
      }),
    };

    const orderBy: Prisma.TourOrderByWithRelationInput =
      sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
          ? { price: "desc" }
          : sort === "rating"
            ? { avgRating: "desc" }
            : sort === "newest"
              ? { createdAt: "desc" }
              : { avgRating: "desc" };

    const result = await withDbTimeout(
      Promise.all([
        prisma.tour.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.tour.count({ where }),
      ]).then(([tours, total]) => ({
        tours,
        total,
        pages: Math.ceil(total / limit),
        page,
      })),
      empty,
      6000
    );

    if (result.tours.length > 0 || result.total > 0) return result;

    // Empty Atlas — show curated fallbacks so live never looks broken
    const fallbacks = filterFallbacks(filters);
    const all = FALLBACK_TOURS.length;
    return {
      tours: fallbacks,
      total: q || country || category ? fallbacks.length : all,
      pages: Math.max(1, Math.ceil((q || country || category ? fallbacks.length : all) / limit)),
      page,
    };
  } catch (error) {
    console.error("[getTours]", error);
    const fallbacks = filterFallbacks(filters);
    return {
      tours: fallbacks,
      total: fallbacks.length,
      pages: Math.max(1, Math.ceil(fallbacks.length / (filters.limit ?? 12))),
      page,
    };
  }
}

export async function getTourBySlug(slug: string) {
  try {
    const tour = await withDbTimeout(
      prisma.tour.findUnique({
        where: { slug },
        include: {
          availableDates: {
            where: { startDate: { gte: new Date() } },
            orderBy: { startDate: "asc" },
          },
          reviews: {
            where: { approved: true },
            include: { user: { select: { id: true, name: true, image: true } } },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      }),
      null,
      6000
    );
    if (tour) return tour;
  } catch (error) {
    console.error("[getTourBySlug]", error);
  }

  const fb = FALLBACK_TOURS.find((t) => t.slug === slug);
  if (!fb) return null;
  return {
    ...fb,
    description: `${fb.title} — a curated UEB3 journey with stays, transfers, and local support.`,
    audience: "BOTH" as const,
    included: ["Accommodation", "Daily breakfast", "Airport transfers"],
    excluded: ["International flights", "Travel insurance", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Arrival", description: "Airport pickup and hotel check-in." },
      { day: 2, title: "City highlights", description: "Guided exploration of signature sights." },
      { day: Math.max(3, fb.durationDays), title: "Departure", description: "Transfer to the airport." },
    ],
    allowDeposit: false,
    depositPercent: 30,
    visaCountry: fb.country,
    availableDates: [],
    reviews: [],
    status: "ACTIVE" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getFeaturedTours(limit = 6) {
  try {
    const tours = await withDbTimeout(
      prisma.tour.findMany({
        where: { status: "ACTIVE", ...INTERNATIONAL_ONLY },
        orderBy: { avgRating: "desc" },
        take: limit,
      }),
      [] as Awaited<ReturnType<typeof prisma.tour.findMany>>,
      6000
    );
    if (tours.length > 0) return tours;
  } catch (error) {
    console.error("[getFeaturedTours]", error);
  }
  return FALLBACK_TOURS.slice(0, limit);
}

export async function getPopularDestinations() {
  try {
    return await withDbTimeout(
      prisma.tour.groupBy({
        by: ["country", "location"],
        where: { status: "ACTIVE", ...INTERNATIONAL_ONLY },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 6,
      }),
      [],
      6000
    );
  } catch {
    return [];
  }
}

export async function getTourCountries() {
  try {
    const results = await withDbTimeout(
      prisma.tour.findMany({
        where: { status: "ACTIVE", ...INTERNATIONAL_ONLY },
        select: { country: true },
        distinct: ["country"],
        orderBy: { country: "asc" },
      }),
      [] as { country: string }[],
      5000
    );
    if (results.length > 0) return results.map((r) => r.country);
  } catch (error) {
    console.error("[getTourCountries]", error);
  }
  return [...new Set(FALLBACK_TOURS.map((t) => t.country))].sort();
}
