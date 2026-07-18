import type { Tour, TourCategory } from "@prisma/client";

/** Lightweight tour rows for when Atlas is slow/unavailable on Vercel */
export type FallbackTour = Pick<
  Tour,
  | "id"
  | "slug"
  | "title"
  | "location"
  | "country"
  | "durationDays"
  | "price"
  | "discountPrice"
  | "images"
  | "avgRating"
  | "category"
  | "baseCurrency"
  | "isFeatured"
  | "maxGroupSize"
>;

export const FALLBACK_TOURS: FallbackTour[] = [
  {
    id: "fallback-dubai-escape",
    slug: "dubai-city-escape",
    title: "Dubai City Escape",
    location: "Dubai",
    country: "United Arab Emirates",
    durationDays: 5,
    price: 1299,
    discountPrice: 1099,
    images: ["https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80"],
    avgRating: 4.8,
    category: "LUXURY" as TourCategory,
    baseCurrency: "USD",
    isFeatured: true,
    maxGroupSize: 12,
  },
  {
    id: "fallback-paris-romance",
    slug: "paris-romance",
    title: "Paris Romance Week",
    location: "Paris",
    country: "France",
    durationDays: 7,
    price: 1899,
    discountPrice: null,
    images: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80"],
    avgRating: 4.9,
    category: "HONEYMOON" as TourCategory,
    baseCurrency: "USD",
    isFeatured: true,
    maxGroupSize: 10,
  },
  {
    id: "fallback-maldives-retreat",
    slug: "maldives-island-retreat",
    title: "Maldives Island Retreat",
    location: "Male",
    country: "Maldives",
    durationDays: 6,
    price: 2499,
    discountPrice: 2199,
    images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80"],
    avgRating: 4.9,
    category: "BEACH" as TourCategory,
    baseCurrency: "USD",
    isFeatured: true,
    maxGroupSize: 8,
  },
  {
    id: "fallback-tokyo-lights",
    slug: "tokyo-neon-nights",
    title: "Tokyo Neon Nights",
    location: "Tokyo",
    country: "Japan",
    durationDays: 8,
    price: 2199,
    discountPrice: null,
    images: ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80"],
    avgRating: 4.7,
    category: "CULTURAL" as TourCategory,
    baseCurrency: "USD",
    isFeatured: false,
    maxGroupSize: 14,
  },
  {
    id: "fallback-bali-wellness",
    slug: "bali-wellness-escape",
    title: "Bali Wellness Escape",
    location: "Ubud",
    country: "Indonesia",
    durationDays: 6,
    price: 1199,
    discountPrice: 999,
    images: ["https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80"],
    avgRating: 4.8,
    category: "BEACH" as TourCategory,
    baseCurrency: "USD",
    isFeatured: true,
    maxGroupSize: 12,
  },
  {
    id: "fallback-swiss-alps",
    slug: "swiss-alps-panorama",
    title: "Swiss Alps Panorama",
    location: "Interlaken",
    country: "Switzerland",
    durationDays: 7,
    price: 2599,
    discountPrice: null,
    images: ["https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80"],
    avgRating: 4.9,
    category: "ADVENTURE" as TourCategory,
    baseCurrency: "USD",
    isFeatured: false,
    maxGroupSize: 10,
  },
];
