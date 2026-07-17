import { slugify } from "@/lib/utils";

export type CatalogueHotel = {
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
  tags: string[];
  description: string;
};

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
  "Airport Shuttle",
  "Parking",
];

/** Canonical hotel catalogue — same slugs as `scripts/seed.ts` */
const HOTEL_SEED = [
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
] as const;

export const HOTEL_CATALOGUE: CatalogueHotel[] = HOTEL_SEED.map((h, i) => {
  const slug = slugify(`${h.name}-${h.city}`);
  return {
    _id: `catalogue-${slug}`,
    name: h.name,
    slug,
    city: h.city,
    country: h.country,
    starRating: h.stars,
    images: [HOTEL_IMAGES[i % HOTEL_IMAGES.length], HOTEL_IMAGES[(i + 1) % HOTEL_IMAGES.length]],
    avgRating: Math.round((3.9 + (i % 10) * 0.1) * 10) / 10,
    reviewCount: 80 + i * 17,
    pricePerNight: h.price,
    amenities: AMENITIES.slice(0, 4 + (i % 4)),
    tags: [...h.tags],
    description: `Experience exceptional hospitality at ${h.name} in ${h.city}. Premium amenities, central location, and outstanding guest reviews.`,
  };
});

export function getCatalogueHotelBySlug(slug: string): CatalogueHotel | null {
  const key = slug.trim().toLowerCase();
  return HOTEL_CATALOGUE.find((h) => h.slug === key) ?? null;
}

export function filterCatalogueHotels(filters: {
  city?: string;
  q?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
}): CatalogueHotel[] {
  let list = [...HOTEL_CATALOGUE];
  if (filters.city) {
    const c = filters.city.toLowerCase();
    list = list.filter(
      (h) =>
        h.city.toLowerCase().includes(c) ||
        h.country.toLowerCase().includes(c) ||
        h.name.toLowerCase().includes(c)
    );
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.country.toLowerCase().includes(q) ||
        h.tags.some((t) => t.includes(q))
    );
  }
  if (filters.tag) {
    const t = filters.tag.toLowerCase();
    list = list.filter((h) => h.tags.some((tag) => tag.toLowerCase().includes(t)));
  }
  if (filters.minPrice != null) {
    list = list.filter((h) => h.pricePerNight >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    list = list.filter((h) => h.pricePerNight <= filters.maxPrice!);
  }
  return list;
}
