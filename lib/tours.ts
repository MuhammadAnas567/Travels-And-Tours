import { prisma } from "@/lib/db";
import type { Prisma, TourCategory } from "@prisma/client";

const INTERNATIONAL_ONLY: Prisma.TourWhereInput = {
  NOT: { country: { equals: "Pakistan", mode: "insensitive" } },
};

function isDbConnectionError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name.includes("Prisma")
  );
}

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

export async function getTours(filters: TourFilters = {}) {
  const {
    q,
    category,
    country,
    audience: _audience,
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

  const [tours, total] = await Promise.all([
    prisma.tour.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tour.count({ where }),
  ]);

  return { tours, total, pages: Math.ceil(total / limit), page };
}

export async function getTourBySlug(slug: string) {
  return prisma.tour.findUnique({
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
  });
}

export async function getFeaturedTours(limit = 6) {
  try {
    return await prisma.tour.findMany({
      where: { status: "ACTIVE", ...INTERNATIONAL_ONLY },
      orderBy: { avgRating: "desc" },
      take: limit,
    });
  } catch (error) {
    if (isDbConnectionError(error)) return [];
    throw error;
  }
}

export async function getPopularDestinations() {
  try {
    const tours = await prisma.tour.groupBy({
      by: ["country", "location"],
      where: { status: "ACTIVE", ...INTERNATIONAL_ONLY },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    });
    return tours;
  } catch (error) {
    if (isDbConnectionError(error)) return [];
    throw error;
  }
}

export async function getTourCountries() {
  const results = await prisma.tour.findMany({
    where: { status: "ACTIVE", ...INTERNATIONAL_ONLY },
    select: { country: true },
    distinct: ["country"],
    orderBy: { country: "asc" },
  });
  return results.map((r) => r.country);
}
