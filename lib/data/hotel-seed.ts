import { slugify } from "@/lib/utils";

export type SeedHotelDef = {
  name: string;
  city: string;
  country: string;
  stars: number;
  price: number;
  tags: string[];
};

/** Canonical hotel catalogue used by seed + public fallbacks (slug-stable). */
export const SEED_HOTEL_DEFS: SeedHotelDef[] = [
  { name: "Marina Bay Grand", city: "Dubai", country: "UAE", stars: 5, price: 289, tags: ["luxury", "pool", "spa"] },
  { name: "Eiffel View Boutique", city: "Paris", country: "France", stars: 4, price: 198, tags: ["boutique", "romantic"] },
  { name: "Shinjuku Sky Hotel", city: "Tokyo", country: "Japan", stars: 4, price: 215, tags: ["city", "business"] },
  { name: "Santorini Caldera Suites", city: "Santorini", country: "Greece", stars: 5, price: 340, tags: ["luxury", "view"] },
  { name: "Ubud Jungle Retreat", city: "Bali", country: "Indonesia", stars: 5, price: 175, tags: ["wellness", "nature"] },
  { name: "Times Square Central", city: "New York", country: "USA", stars: 4, price: 265, tags: ["city", "theatre"] },
  { name: "Maldives Overwater Resort", city: "Malé", country: "Maldives", stars: 5, price: 520, tags: ["beach", "luxury"] },
  { name: "Interlaken Alpine Lodge", city: "Interlaken", country: "Switzerland", stars: 4, price: 310, tags: ["mountains", "ski"] },
  { name: "Barcelona Gothic Quarter Inn", city: "Barcelona", country: "Spain", stars: 3, price: 142, tags: ["culture", "walkable"] },
  { name: "Cape Grace Waterfront", city: "Cape Town", country: "South Africa", stars: 5, price: 228, tags: ["harbour", "fine-dining"] },
  { name: "Reykjavik Northern Lights Hotel", city: "Reykjavik", country: "Iceland", stars: 4, price: 245, tags: ["adventure", "spa"] },
  { name: "Mara Safari Camp", city: "Maasai Mara", country: "Kenya", stars: 5, price: 385, tags: ["wildlife", "safari"] },
  { name: "London Thames Riverside", city: "London", country: "UK", stars: 4, price: 232, tags: ["historic", "river"] },
  { name: "Singapore Orchard Luxe", city: "Singapore", country: "Singapore", stars: 5, price: 278, tags: ["shopping", "rooftop"] },
  { name: "Rome Colosseum View", city: "Rome", country: "Italy", stars: 4, price: 189, tags: ["historic", "culture"] },
  { name: "Sydney Harbour Hotel", city: "Sydney", country: "Australia", stars: 5, price: 295, tags: ["harbour", "luxury"] },
  { name: "Bangkok Riverside Palace", city: "Bangkok", country: "Thailand", stars: 4, price: 98, tags: ["budget", "spa"] },
  { name: "Istanbul Sultanahmet Suites", city: "Istanbul", country: "Turkey", stars: 4, price: 156, tags: ["culture", "historic"] },
  { name: "Los Angeles Sunset Strip", city: "Los Angeles", country: "USA", stars: 4, price: 218, tags: ["city", "nightlife"] },
  { name: "Amsterdam Canal House", city: "Amsterdam", country: "Netherlands", stars: 4, price: 205, tags: ["boutique", "canal"] },
  { name: "Miami Beach Oceanfront", city: "Miami", country: "USA", stars: 5, price: 312, tags: ["beach", "pool"] },
  { name: "Vienna Imperial Hotel", city: "Vienna", country: "Austria", stars: 5, price: 268, tags: ["classic", "culture"] },
  { name: "Seoul Gangnam Tower", city: "Seoul", country: "South Korea", stars: 4, price: 188, tags: ["city", "modern"] },
  { name: "Lisbon Alfama Guesthouse", city: "Lisbon", country: "Portugal", stars: 3, price: 118, tags: ["budget", "charming"] },
  { name: "Hong Kong Victoria Peak", city: "Hong Kong", country: "China", stars: 5, price: 302, tags: ["skyline", "luxury"] },
  { name: "Marrakech Riad Oasis", city: "Marrakech", country: "Morocco", stars: 4, price: 134, tags: ["culture", "spa"] },
  { name: "Prague Old Town Residence", city: "Prague", country: "Czech Republic", stars: 4, price: 148, tags: ["historic", "walkable"] },
  { name: "Zurich Lakefront", city: "Zurich", country: "Switzerland", stars: 5, price: 335, tags: ["business", "lake"] },
];

const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
];

const AMENITIES = [
  "Free WiFi",
  "Pool",
  "Spa",
  "Gym",
  "Restaurant",
  "Breakfast Included",
];

export function hotelSlug(name: string, city: string) {
  return slugify(`${name}-${city}`);
}

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
  tags: string[];
};

export function buildFallbackHotels(): FallbackHotel[] {
  return SEED_HOTEL_DEFS.map((h, i) => {
    const slug = hotelSlug(h.name, h.city);
    const rating = Math.round((3.8 + (i % 12) * 0.1) * 10) / 10;
    return {
      _id: `fallback-hotel-${slug}`,
      name: h.name,
      slug,
      city: h.city,
      country: h.country,
      starRating: h.stars,
      images: [HOTEL_IMAGES[i % HOTEL_IMAGES.length], HOTEL_IMAGES[(i + 1) % HOTEL_IMAGES.length]],
      avgRating: rating,
      reviewCount: 20 + (i % 80),
      pricePerNight: h.price,
      amenities: AMENITIES.slice(0, 3 + (i % 3)),
      description: `Experience exceptional hospitality at ${h.name} in ${h.city}. Premium amenities, central location, and outstanding guest reviews.`,
      tags: h.tags,
    };
  });
}

export const ALL_FALLBACK_HOTELS = buildFallbackHotels();
