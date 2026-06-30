import { PrismaClient, CouponType } from "@prisma/client";

const prisma = new PrismaClient();

const visaCountries = [
  {
    country: "Turkey",
    countrySlug: "turkey",
    flagEmoji: "🇹🇷",
    visaType: "Tourist e-Visa",
    requirements:
      "Pakistani passport holders can apply for Turkey e-Visa online. Passport must be valid for at least 6 months beyond stay. Return ticket and hotel booking may be requested.",
    documentChecklist: [
      "Valid passport (6+ months validity)",
      "Recent passport-size photograph",
      "Confirmed return flight ticket",
      "Hotel reservation or invitation letter",
      "Bank statement (last 3 months)",
      "CNIC copy",
    ],
    processingTime: "24–72 hours",
    govFee: 60,
    serviceFee: 5000,
    successNotes: "We handle the full application and track status until approval.",
  },
  {
    country: "United Arab Emirates",
    countrySlug: "uae",
    flagEmoji: "🇦🇪",
    visaType: "Tourist Visa",
    requirements:
      "UAE tourist visa for Pakistanis via approved channels. Sponsorship through licensed travel agency required for most applicants.",
    documentChecklist: [
      "Passport (6+ months validity)",
      "Passport-size photo (white background)",
      "CNIC copy",
      "Bank statement",
      "NOC from employer (if employed)",
    ],
    processingTime: "3–5 working days",
    govFee: 350,
    serviceFee: 8000,
    successNotes: "Express processing available for urgent departures.",
  },
  {
    country: "Saudi Arabia",
    countrySlug: "saudi-arabia",
    flagEmoji: "🇸🇦",
    visaType: "Umrah / Tourist",
    requirements:
      "Umrah and tourist visas processed through authorised agents. Vaccination and insurance requirements apply per current Saudi regulations.",
    documentChecklist: [
      "Valid passport",
      "Vaccination certificate",
      "Passport photos",
      "Mahram documentation (if applicable)",
      "Travel insurance",
    ],
    processingTime: "5–7 working days",
    govFee: 200,
    serviceFee: 10000,
    successNotes: "Umrah packages include visa processing as part of the bundle.",
  },
  {
    country: "Malaysia",
    countrySlug: "malaysia",
    flagEmoji: "🇲🇾",
    visaType: "eVISA",
    requirements:
      "Malaysia eVISA available for Pakistani citizens for tourism. Apply online with supporting documents.",
    documentChecklist: [
      "Passport bio page scan",
      "Passport-size photo",
      "Return flight ticket",
      "Hotel booking",
      "Bank statement",
    ],
    processingTime: "2–4 working days",
    govFee: 45,
    serviceFee: 4500,
    successNotes: null,
  },
];

export async function seedExtensions() {
  for (const visa of visaCountries) {
    await prisma.visaInfo.upsert({
      where: { countrySlug: visa.countrySlug },
      update: visa,
      create: visa,
    });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: CouponType.PERCENT,
      value: 10,
      minSpend: 500,
      usageLimit: 100,
      validFrom: new Date("2026-01-01"),
      validTo: new Date("2026-12-31"),
      applicableTours: [],
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "turkey-visa-guide-pakistanis" },
    update: {},
    create: {
      slug: "turkey-visa-guide-pakistanis",
      title: "Turkey Visa for Pakistanis: Complete 2026 Guide",
      excerpt:
        "Everything you need to know about applying for a Turkey tourist visa from Pakistan — documents, fees, and processing times.",
      content: `Turkey remains one of the most popular destinations for Pakistani travellers. The e-Visa system has simplified the process significantly.\n\n## Who needs a visa?\nMost Pakistani passport holders require a visa before travel.\n\n## How we help\nUEB3 Tours handles your e-Visa application end-to-end, so you can focus on planning your itinerary.`,
      category: "Visa Guides",
      tags: ["turkey", "visa", "pakistan"],
      coverImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200",
      published: true,
      publishedAt: new Date(),
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "best-time-visit-hunza" },
    update: {},
    create: {
      slug: "best-time-visit-hunza",
      title: "Best Time to Visit Hunza Valley",
      excerpt:
        "Cherry blossom season, autumn colours, or summer trekking — when should you plan your Hunza trip?",
      content: `Hunza offers something magical in every season.\n\n**Spring (March–April):** Cherry and apricot blossoms.\n**Summer (May–September):** Ideal for trekking and lake visits.\n**Autumn (October):** Golden poplars and clear skies.`,
      category: "Destinations",
      tags: ["hunza", "pakistan", "inbound"],
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
      published: true,
      publishedAt: new Date(),
    },
  });

  const existing = await prisma.fxRate.findFirst();
  if (!existing) {
    await prisma.fxRate.create({
      data: {
        base: "USD",
        rates: { USD: 1, PKR: 278, EUR: 0.92, GBP: 0.79 },
      },
    });
  }

  console.log("Extension seed completed (visa, coupons, blog, FX)");
}
