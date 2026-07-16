import { FALLBACK_TOURS } from "@/lib/data/tour-fallback";

function catalogue(limit = 12) {
  const tours = FALLBACK_TOURS.slice(0, limit);
  return {
    tours,
    total: FALLBACK_TOURS.length,
    pages: Math.max(1, Math.ceil(FALLBACK_TOURS.length / limit)),
    page: 1,
  };
}

/**
 * Instant catalogue for navbar / Packages / Tours on Vercel.
 * Avoids Atlas cold-connect hangs that were causing 30s waits and 500s.
 * Filtered searches still hit getTours() with a short timeout + same fallbacks.
 */
export async function getCachedDefaultTours() {
  return catalogue(12);
}

export async function getCachedTourCountries() {
  return [...new Set(FALLBACK_TOURS.map((t) => t.country))].sort();
}

export async function getCachedPackages() {
  return catalogue(24);
}
