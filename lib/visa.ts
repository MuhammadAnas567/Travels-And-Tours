import { prisma, withDbTimeout } from "@/lib/db";
import { FALLBACK_VISAS } from "@/lib/data/visa-fallback";

function hasVisaModel(): boolean {
  return "visaInfo" in prisma;
}

export async function getActiveVisaCountries() {
  if (hasVisaModel()) {
    try {
      const rows = await withDbTimeout(
        prisma.visaInfo.findMany({
          where: { isActive: true },
          orderBy: { country: "asc" },
        }),
        [] as Awaited<ReturnType<typeof prisma.visaInfo.findMany>>,
        800
      );
      if (rows.length > 0) return rows;
    } catch (error) {
      console.error("[visa] DB unavailable:", error);
    }
  }
  return FALLBACK_VISAS.map((v) => ({ ...v, createdAt: new Date(), updatedAt: new Date() }));
}

export async function getVisaBySlug(slug: string) {
  if (hasVisaModel()) {
    try {
      const row = await withDbTimeout(
        prisma.visaInfo.findFirst({
          where: { countrySlug: slug, isActive: true },
        }),
        null,
        800
      );
      if (row) return row;
    } catch {
      // fall through
    }
  }
  return FALLBACK_VISAS.find((v) => v.countrySlug === slug) ?? null;
}

export async function getVisaForCountry(country: string) {
  if (hasVisaModel()) {
    try {
      const row = await withDbTimeout(
        prisma.visaInfo.findFirst({
          where: {
            isActive: true,
            OR: [
              { country: { equals: country, mode: "insensitive" } },
              { countrySlug: country.toLowerCase().replace(/\s+/g, "-") },
            ],
          },
        }),
        null,
        800
      );
      if (row) return row;
    } catch {
      // fall through
    }
  }
  const needle = country.toLowerCase();
  return (
    FALLBACK_VISAS.find(
      (v) =>
        v.country.toLowerCase() === needle ||
        v.countrySlug === needle.replace(/\s+/g, "-")
    ) ?? null
  );
}
