import { PrismaClient, TourCategory, TourStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const sampleItinerary = (days: number, location: string) =>
  Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} in ${location}`,
    details: `Explore the highlights of ${location} with guided activities, local cuisine, and unforgettable experiences.`,
  }));

const tours = [
  {
    slug: "bali-paradise-retreat",
    title: "Bali Paradise Retreat",
    description:
      "Discover the magic of Bali with temple visits, rice terrace hikes, and pristine beaches. This 7-day journey combines culture, adventure, and relaxation in Indonesia's most beloved island.",
    location: "Ubud & Seminyak",
    country: "Indonesia",
    category: TourCategory.BEACH,
    durationDays: 7,
    price: 1899,
    discountPrice: 1599,
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800",
    ],
    maxGroupSize: 12,
  },
  {
    slug: "swiss-alps-adventure",
    title: "Swiss Alps Adventure",
    description:
      "Trek through breathtaking alpine landscapes, ride scenic trains, and experience Swiss hospitality. Perfect for adventure seekers who love mountains and outdoor activities.",
    location: "Interlaken",
    country: "Switzerland",
    category: TourCategory.ADVENTURE,
    durationDays: 5,
    price: 2499,
    images: [
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    ],
    maxGroupSize: 10,
  },
  {
    slug: "paris-romantic-getaway",
    title: "Paris Romantic Getaway",
    description:
      "Fall in love with the City of Light. Private Seine cruise, Eiffel Tower dinner, Louvre skip-the-line access, and charming Montmartre walks for couples.",
    location: "Paris",
    country: "France",
    category: TourCategory.HONEYMOON,
    durationDays: 4,
    price: 1799,
    discountPrice: 1499,
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
    ],
    maxGroupSize: 8,
  },
  {
    slug: "safari-kenya-wildlife",
    title: "Kenya Wildlife Safari",
    description:
      "Witness the Great Migration, spot the Big Five, and stay in luxury tented camps. An unforgettable African safari experience in Maasai Mara and Amboseli.",
    location: "Maasai Mara",
    country: "Kenya",
    category: TourCategory.WILDLIFE,
    durationDays: 8,
    price: 3299,
    images: [
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
      "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800",
    ],
    maxGroupSize: 6,
  },
  {
    slug: "tokyo-cultural-immersion",
    title: "Tokyo Cultural Immersion",
    description:
      "From ancient temples to neon-lit streets, experience Japan's fascinating blend of tradition and modernity. Includes tea ceremony, sushi class, and day trip to Mt. Fuji.",
    location: "Tokyo",
    country: "Japan",
    category: TourCategory.CULTURAL,
    durationDays: 6,
    price: 2199,
    images: [
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
    ],
    maxGroupSize: 14,
  },
  {
    slug: "costa-rica-family-fun",
    title: "Costa Rica Family Adventure",
    description:
      "Zip-lining, volcano hikes, wildlife spotting, and beach time — designed for families with kids. All activities are kid-friendly with expert naturalist guides.",
    location: "Arenal & Manuel Antonio",
    country: "Costa Rica",
    category: TourCategory.FAMILY,
    durationDays: 7,
    price: 1699,
    discountPrice: 1399,
    images: [
      "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800",
      "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800",
    ],
    maxGroupSize: 16,
  },
  {
    slug: "maldives-luxury-escape",
    title: "Maldives Luxury Escape",
    description:
      "Overwater villas, private butler service, snorkeling in crystal waters, and sunset dolphin cruises. The ultimate luxury beach vacation.",
    location: "North Malé Atoll",
    country: "Maldives",
    category: TourCategory.LUXURY,
    durationDays: 5,
    price: 4999,
    images: [
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
    ],
    maxGroupSize: 4,
  },
  {
    slug: "thailand-budget-backpacker",
    title: "Thailand Budget Explorer",
    description:
      "Bangkok street food, Chiang Mai temples, and island hopping on a budget. Perfect for young travelers and backpackers seeking authentic experiences.",
    location: "Bangkok & Phuket",
    country: "Thailand",
    category: TourCategory.BUDGET,
    durationDays: 10,
    price: 899,
    images: [
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
      "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=800",
    ],
    maxGroupSize: 20,
  },
  {
    slug: "iceland-northern-lights",
    title: "Iceland Northern Lights Quest",
    description:
      "Chase the aurora borealis, explore ice caves, soak in geothermal lagoons, and drive the Golden Circle. A winter wonderland adventure.",
    location: "Reykjavik",
    country: "Iceland",
    category: TourCategory.ADVENTURE,
    durationDays: 6,
    price: 2799,
    images: [
      "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800",
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
    ],
    maxGroupSize: 12,
  },
  {
    slug: "morocco-imperial-cities",
    title: "Morocco Imperial Cities Tour",
    description:
      "Wander through Marrakech souks, sleep in Sahara desert camps, and explore Fes medina. A sensory-rich cultural journey through Morocco.",
    location: "Marrakech & Fes",
    country: "Morocco",
    category: TourCategory.CULTURAL,
    durationDays: 8,
    price: 1599,
    images: [
      "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800",
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    ],
    maxGroupSize: 15,
  },
];

async function ensureUser(
  email: string,
  data: { name: string; hashedPassword: string; role: "USER" | "ADMIN" }
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({ data: { email, ...data } });
  }
}

async function ensureTour(
  tour: (typeof tours)[0]
) {
  const { slug, durationDays, ...rest } = tour;
  const existing = await prisma.tour.findUnique({ where: { slug } });
  if (existing) return;

  await prisma.tour.create({
    data: {
      slug,
      ...rest,
      durationDays,
      itinerary: sampleItinerary(durationDays, tour.location),
      included: [
        "Accommodation",
        "Breakfast daily",
        "Airport transfers",
        "Professional guide",
        "Entrance fees",
      ],
      excluded: [
        "International flights",
        "Travel insurance",
        "Personal expenses",
        "Optional activities",
      ],
      status: TourStatus.ACTIVE,
      availableDates: {
        create: [
          {
            startDate: new Date("2026-07-15"),
            endDate: new Date(Date.UTC(2026, 6, 15 + durationDays - 1)),
            seatsTotal: tour.maxGroupSize,
            seatsBooked: 0,
          },
          {
            startDate: new Date("2026-08-01"),
            endDate: new Date(Date.UTC(2026, 7, 1 + durationDays - 1)),
            seatsTotal: tour.maxGroupSize,
            seatsBooked: 0,
          },
          {
            startDate: new Date("2026-09-10"),
            endDate: new Date(Date.UTC(2026, 8, 10 + durationDays - 1)),
            seatsTotal: tour.maxGroupSize,
            seatsBooked: 0,
          },
        ],
      },
    },
  });
}

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("user123", 12);

  await ensureUser("admin@traveltours.com".toLowerCase(), {
    name: "Admin User",
    hashedPassword: adminPassword,
    role: "ADMIN",
  });

  await ensureUser("user@example.com".toLowerCase(), {
    name: "Demo User",
    hashedPassword: userPassword,
    role: "USER",
  });

  for (const tour of tours) {
    await ensureTour(tour);
  }

  const cars = [
    {
      slug: "economy-hatchback",
      name: "Economy hatchback",
      category: "Economy",
      seats: 4,
      bags: 2,
      transmission: "Automatic",
      pricePerDay: 28,
      locations: ["DXB Airport", "Islamabad", "Lahore", "Karachi"],
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    },
    {
      slug: "compact-suv",
      name: "Compact SUV",
      category: "SUV",
      seats: 5,
      bags: 3,
      transmission: "Automatic",
      pricePerDay: 45,
      locations: ["DXB Airport", "Karachi", "Jeddah"],
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
    },
    {
      slug: "full-size-sedan",
      name: "Full-size sedan",
      category: "Sedan",
      seats: 5,
      bags: 4,
      transmission: "Automatic",
      pricePerDay: 52,
      locations: ["LHR Airport", "Islamabad", "DXB Airport"],
      image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800",
    },
    {
      slug: "premium-people-carrier",
      name: "Premium people carrier",
      category: "MPV",
      seats: 7,
      bags: 5,
      transmission: "Automatic",
      pricePerDay: 78,
      locations: ["DXB Airport", "Jeddah", "IST Airport"],
      image: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800",
    },
  ];

  for (const car of cars) {
    const existing = await prisma.carListing.findUnique({ where: { slug: car.slug } });
    if (!existing) {
      await prisma.carListing.create({ data: { ...car, isActive: true } });
    }
  }
  console.log(`Car listings ready (${cars.length})`);

  const { seedExtensions } = await import("./seed-extensions");
  await seedExtensions();

  console.log("Seed completed!");
  console.log("Admin: admin@traveltours.com / admin123");
  console.log("User:  user@example.com / user123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
