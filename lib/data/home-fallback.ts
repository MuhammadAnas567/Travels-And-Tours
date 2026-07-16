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

export type FallbackHotel = {
  _id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  starRating: number;
  images: string[];
  avgRating: number;
  reviewCount: number;
  pricePerNight: number;
  amenities: string[];
  description: string;
};

export const FALLBACK_HOTELS: FallbackHotel[] = [
  {
    _id: "fallback-hotel-dubai",
    name: "Marina Bay Grand",
    slug: "marina-bay-grand",
    city: "Dubai",
    country: "UAE",
    starRating: 5,
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
    avgRating: 4.8,
    reviewCount: 312,
    pricePerNight: 289,
    amenities: ["Free WiFi", "Pool", "Spa"],
    description: "Marina-facing rooms with skyline views, spa, and late checkout on request.",
  },
  {
    _id: "fallback-hotel-paris",
    name: "Eiffel View Boutique",
    slug: "eiffel-view-boutique",
    city: "Paris",
    country: "France",
    starRating: 4,
    images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"],
    avgRating: 4.6,
    reviewCount: 188,
    pricePerNight: 198,
    amenities: ["Free WiFi", "Breakfast Included"],
    description: "A quiet Left Bank boutique with classic Parisian rooms and daily breakfast.",
  },
  {
    _id: "fallback-hotel-tokyo",
    name: "Shinjuku Sky Hotel",
    slug: "shinjuku-sky-hotel",
    city: "Tokyo",
    country: "Japan",
    starRating: 4,
    images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800"],
    avgRating: 4.5,
    reviewCount: 241,
    pricePerNight: 215,
    amenities: ["Free WiFi", "Gym", "Restaurant"],
    description: "Modern Shinjuku base with compact luxury rooms and easy metro access.",
  },
  {
    _id: "fallback-hotel-santorini",
    name: "Santorini Caldera Suites",
    slug: "santorini-caldera-suites",
    city: "Santorini",
    country: "Greece",
    starRating: 5,
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"],
    avgRating: 4.9,
    reviewCount: 156,
    pricePerNight: 340,
    amenities: ["Pool", "Spa", "Sea View"],
    description: "Cliffside suites overlooking the caldera — sunset terraces and private plunge pools.",
  },
  {
    _id: "fallback-hotel-bali",
    name: "Ubud Jungle Retreat",
    slug: "ubud-jungle-retreat",
    city: "Bali",
    country: "Indonesia",
    starRating: 5,
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
    avgRating: 4.7,
    reviewCount: 203,
    pricePerNight: 175,
    amenities: ["Pool", "Spa", "Breakfast Included"],
    description: "Jungle-edge villas near Ubud with open-air baths and daily yoga options.",
  },
  {
    _id: "fallback-hotel-maldives",
    name: "Maldives Overwater Resort",
    slug: "maldives-overwater-resort",
    city: "Malé",
    country: "Maldives",
    starRating: 5,
    images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"],
    avgRating: 4.9,
    reviewCount: 98,
    pricePerNight: 520,
    amenities: ["Beach Access", "Spa", "Restaurant"],
    description: "Overwater villas with glass floors, reef snorkeling, and all-day dining.",
  },
];
