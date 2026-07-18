/** Used when Mongo is unreachable or empty (e.g. misconfigured Vercel env). */
export const FALLBACK_DESTINATIONS = [
  {
    _id: "fallback-santorini",
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800",
    priceFrom: 189,
    popularity: 98,
  },
  {
    _id: "fallback-dubai",
    name: "Dubai",
    country: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    priceFrom: 220,
    popularity: 95,
  },
  {
    _id: "fallback-bali",
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
    priceFrom: 145,
    popularity: 92,
  },
  {
    _id: "fallback-paris",
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    priceFrom: 210,
    popularity: 90,
  },
  {
    _id: "fallback-tokyo",
    name: "Tokyo",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    priceFrom: 235,
    popularity: 88,
  },
  {
    _id: "fallback-maldives",
    name: "Maldives",
    country: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800",
    priceFrom: 320,
    popularity: 87,
  },
  {
    _id: "fallback-alps",
    name: "Swiss Alps",
    country: "Switzerland",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
    priceFrom: 275,
    popularity: 85,
  },
  {
    _id: "fallback-capetown",
    name: "Cape Town",
    country: "South Africa",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
    priceFrom: 165,
    popularity: 82,
  },
] as const;

export type { FallbackHotel } from "@/lib/data/hotel-seed";
export { ALL_FALLBACK_HOTELS as FALLBACK_HOTELS } from "@/lib/data/hotel-seed";
