import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticPages = ["", "/tours", "/about", "/contact", "/faq", "/terms", "/privacy"];

  let tourPages: MetadataRoute.Sitemap = [];
  try {
    const { prisma } = await import("@/lib/db");
    const tours = await prisma.tour.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    });
    tourPages = tours.map((tour) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: tour.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    // Database may not be available at build time
  }

  return [
    ...staticPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...tourPages,
  ];
}
