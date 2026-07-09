import { prisma } from "@/lib/db";

function hasVisaModel(): boolean {
  return "visaInfo" in prisma;
}

export async function getActiveVisaCountries() {
  if (!hasVisaModel()) return [];
  try {
    return await prisma.visaInfo.findMany({
      where: { isActive: true },
      orderBy: { country: "asc" },
    });
  } catch (error) {
    console.error("[visa] DB unavailable:", error);
    return [];
  }
}

export async function getVisaBySlug(slug: string) {
  if (!hasVisaModel()) return null;
  return prisma.visaInfo.findFirst({
    where: { countrySlug: slug, isActive: true },
  });
}

export async function getVisaForCountry(country: string) {
  if (!hasVisaModel()) return null;

  try {
    return await prisma.visaInfo.findFirst({
      where: {
        isActive: true,
        OR: [
          { country: { equals: country, mode: "insensitive" } },
          { countrySlug: country.toLowerCase().replace(/\s+/g, "-") },
        ],
      },
    });
  } catch {
    return null;
  }
}
