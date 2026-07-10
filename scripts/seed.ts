import { connectDB } from "../lib/db/connect";
import { User, Destination, Hotel, Flight, Review } from "../lib/models";
import bcrypt from "bcryptjs";

const DESTINATIONS = [
  { name: "Santorini", country: "Greece", category: "beach" as const, priceFrom: 189, popularity: 98, lat: 36.3932, lng: 25.4615, image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800", description: "Iconic white-washed villages and caldera sunsets." },
  { name: "Dubai", country: "UAE", category: "city" as const, priceFrom: 220, popularity: 95, lat: 25.2048, lng: 55.2708, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800", description: "Futuristic skyline, luxury shopping, and desert adventures." },
  { name: "Bali", country: "Indonesia", category: "beach" as const, priceFrom: 145, popularity: 92, lat: -8.4095, lng: 115.1889, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800", description: "Tropical temples, rice terraces, and world-class resorts." },
  { name: "Paris", country: "France", category: "city" as const, priceFrom: 210, popularity: 90, lat: 48.8566, lng: 2.3522, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800", description: "Art, cuisine, and romance in the City of Light." },
  { name: "Tokyo", country: "Japan", category: "city" as const, priceFrom: 235, popularity: 88, lat: 35.6762, lng: 139.6503, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", description: "Neon streets meet ancient temples." },
  { name: "Maldives", country: "Maldives", category: "beach" as const, priceFrom: 320, popularity: 87, lat: 3.2028, lng: 73.2207, image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800", description: "Overwater villas and crystal-clear lagoons." },
  { name: "Swiss Alps", country: "Switzerland", category: "mountains" as const, priceFrom: 275, popularity: 85, lat: 46.8182, lng: 8.2275, image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800", description: "Alpine peaks, scenic trains, and ski resorts." },
  { name: "Cape Town", country: "South Africa", category: "adventure" as const, priceFrom: 165, popularity: 82, lat: -33.9249, lng: 18.4241, image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800", description: "Table Mountain, vineyards, and coastal drives." },
  { name: "New York", country: "USA", category: "city" as const, priceFrom: 249, popularity: 91, lat: 40.7128, lng: -74.006, image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800", description: "Broadway, Central Park, and endless energy." },
  { name: "Iceland", country: "Iceland", category: "adventure" as const, priceFrom: 290, popularity: 80, lat: 64.9631, lng: -19.0208, image: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800", description: "Northern lights, geysers, and dramatic landscapes." },
  { name: "Barcelona", country: "Spain", category: "culture" as const, priceFrom: 175, popularity: 86, lat: 41.3874, lng: 2.1686, image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800", description: "Gaudí architecture and Mediterranean beaches." },
  { name: "Safari Kenya", country: "Kenya", category: "wildlife" as const, priceFrom: 310, popularity: 78, lat: -1.2921, lng: 36.8219, image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800", description: "Maasai Mara and the Great Migration." },
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const HOTEL_NAMES = [
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

const AMENITIES_POOL = ["Free WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar", "Room Service", "Airport Shuttle", "Parking", "Pet Friendly", "Breakfast Included", "Beach Access"];

const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
];

const ROUTES = [
  ["DXB", "LHR"], ["JFK", "CDG"], ["LAX", "NRT"], ["SIN", "SYD"], ["FRA", "BCN"],
  ["ORD", "MIA"], ["AMS", "FCO"], ["IST", "LHR"], ["BKK", "HKG"], ["DOH", "JFK"],
  ["SFO", "ICN"], ["MEL", "AKL"], ["YYZ", "YVR"], ["MAD", "LIS"], ["ZRH", "VIE"],
  ["DEL", "DXB"], ["KUL", "SIN"], ["CPH", "OSL"], ["MEX", "LAX"], ["GRU", "EZE"],
];

const AIRLINES = [
  { name: "Emirates", logo: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=100" },
  { name: "Qatar Airways", logo: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=100" },
  { name: "Singapore Airlines", logo: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=100" },
  { name: "Lufthansa", logo: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=100" },
  { name: "British Airways", logo: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=100" },
];

async function main() {
  await connectDB();
  console.log("Connected to MongoDB");

  await Promise.all([
    User.deleteMany({}),
    Destination.deleteMany({}),
    Hotel.deleteMany({}),
    Flight.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("demo1234", 12);
  const demoUser = await User.create({
    name: "Demo Traveler",
    email: "demo@ueb3travel.com",
    passwordHash,
    role: "user",
    wishlist: [],
  });
  console.log("Demo user: demo@ueb3travel.com / demo1234");

  await Destination.insertMany(
    DESTINATIONS.map((d) => ({
      name: d.name,
      country: d.country,
      description: d.description,
      image: d.image,
      priceFrom: d.priceFrom,
      category: d.category,
      coordinates: { lat: d.lat, lng: d.lng },
      popularity: d.popularity,
    }))
  );
  console.log(`Seeded ${DESTINATIONS.length} destinations`);

  const hotels = await Hotel.insertMany(
    HOTEL_NAMES.map((h, i) => {
      const slug = slugify(`${h.name}-${h.city}`);
      const amenityCount = 4 + (i % 5);
      const amenities = AMENITIES_POOL.slice(0, amenityCount);
      const rating = 3.8 + (i % 12) * 0.1;
      return {
        name: h.name,
        slug,
        city: h.city,
        country: h.country,
        description: `Experience exceptional hospitality at ${h.name} in ${h.city}. Premium amenities, central location, and outstanding guest reviews.`,
        images: [HOTEL_IMAGES[i % HOTEL_IMAGES.length], HOTEL_IMAGES[(i + 1) % HOTEL_IMAGES.length]],
        starRating: h.stars,
        amenities,
        pricePerNight: h.price,
        rooms: [
          { type: "Standard King", price: h.price, capacity: 2, beds: "1 King" },
          { type: "Deluxe Suite", price: Math.round(h.price * 1.45), capacity: 3, beds: "1 King + Sofa" },
        ],
        avgRating: Math.round(rating * 10) / 10,
        reviewCount: 20 + (i % 80),
        coordinates: { lat: 20 + (i % 50), lng: -10 + (i % 40) },
        tags: h.tags,
      };
    })
  );
  console.log(`Seeded ${hotels.length} hotels`);

  const now = new Date();
  const flights = [];
  for (let i = 0; i < 18; i++) {
    const route = ROUTES[i % ROUTES.length];
    const airline = AIRLINES[i % AIRLINES.length];
    const depart = new Date(now);
    depart.setDate(depart.getDate() + (i % 14) + 1);
    depart.setHours(6 + (i % 12), (i % 4) * 15, 0, 0);
    const durationMins = 180 + (i % 8) * 45;
    const arrive = new Date(depart.getTime() + durationMins * 60_000);
    const stops = i % 4 === 0 ? 1 : 0;
    const basePrice = 180 + (i % 10) * 65;
    flights.push({
      airline: airline.name,
      airlineLogo: airline.logo,
      flightNumber: `${airline.name.slice(0, 2).toUpperCase()}${100 + i}`,
      from: route[0],
      to: route[1],
      departTime: depart,
      arriveTime: arrive,
      durationMins: durationMins + (stops ? 60 : 0),
      stops,
      priceByClass: { economy: basePrice, business: Math.round(basePrice * 2.8) },
      seatsAvailable: 40 + (i % 60),
    });
  }
  await Flight.insertMany(flights);
  console.log(`Seeded ${flights.length} flights`);

  const reviewSamples = [
    { rating: 5, title: "Absolutely perfect stay", comment: "Immaculate rooms, friendly staff, and an unbeatable location." },
    { rating: 4, title: "Great value", comment: "Comfortable beds and excellent breakfast. Would book again." },
    { rating: 5, title: "Luxury at its finest", comment: "The spa and rooftop pool made our anniversary unforgettable." },
  ];

  const reviews = [];
  for (let i = 0; i < Math.min(15, hotels.length); i++) {
    const sample = reviewSamples[i % reviewSamples.length];
    reviews.push({
      user: demoUser._id,
      hotel: hotels[i]._id,
      rating: sample.rating,
      title: sample.title,
      comment: sample.comment,
      categories: {
        cleanliness: sample.rating,
        location: sample.rating,
        service: sample.rating - (i % 2 === 0 ? 0 : 1),
        value: sample.rating - 1,
      },
    });
  }
  await Review.insertMany(reviews);
  console.log(`Seeded ${reviews.length} reviews`);

  console.log("\nSeed complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
