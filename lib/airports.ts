/** Shared city/country → IATA helpers for flight search (client + server). */

const CITY_COUNTRY_TO_IATA: Record<string, string> = {
  // Pakistan
  karachi: "KHI",
  lahore: "LHE",
  islamabad: "ISB",
  pakistan: "KHI",
  // UAE / Gulf
  dubai: "DXB",
  "abu dhabi": "AUH",
  abu: "AUH",
  doha: "DOH",
  qatar: "DOH",
  jeddah: "JED",
  "saudi arabia": "JED",
  uae: "DXB",
  // Europe / UK
  istanbul: "IST",
  turkey: "IST",
  london: "LHR",
  "united kingdom": "LHR",
  uk: "LHR",
  paris: "CDG",
  france: "CDG",
  // Asia-Pacific
  malaysia: "KUL",
  "kuala lumpur": "KUL",
  kl: "KUL",
  penang: "PEN",
  singapore: "SIN",
  bangkok: "BKK",
  thailand: "BKK",
  bali: "DPS",
  indonesia: "DPS",
  tokyo: "NRT",
  japan: "NRT",
  // Americas
  "new york": "JFK",
  nyc: "JFK",
  "united states": "JFK",
  usa: "JFK",
};

/** Normalize free-text or IATA into a 3-letter airport code when possible. */
export function resolveAirport(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const upper = trimmed.toUpperCase();
  if (/^[A-Z]{3}$/.test(upper)) return upper;
  const key = trimmed.toLowerCase().replace(/\s+/g, " ");
  const mapped = CITY_COUNTRY_TO_IATA[key];
  if (mapped) return mapped;
  // Partial key match (e.g. "Kuala Lumpur, Malaysia")
  for (const [alias, code] of Object.entries(CITY_COUNTRY_TO_IATA)) {
    if (key.includes(alias) || alias.includes(key)) return code;
  }
  return upper;
}

/** True when value is a resolved 3-letter IATA code. */
export function isIataCode(value: string): boolean {
  return /^[A-Z]{3}$/.test(value.trim().toUpperCase());
}

/**
 * Place aliases for hotel/package/tour/car free-text matching.
 * Maps user query → strings that should match location/country fields.
 */
const PLACE_ALIASES: Record<string, string[]> = {
  malaysia: ["malaysia", "kuala lumpur", "kul", "penang", "langkawi"],
  uae: ["uae", "united arab emirates", "dubai", "abu dhabi"],
  dubai: ["dubai", "dxb", "united arab emirates", "uae"],
  turkey: ["turkey", "türkiye", "istanbul"],
  indonesia: ["indonesia", "bali", "jakarta"],
  singapore: ["singapore", "sin"],
  thailand: ["thailand", "bangkok"],
  pakistan: ["pakistan", "karachi", "lahore", "islamabad"],
  uk: ["uk", "united kingdom", "london", "england"],
  "united kingdom": ["uk", "united kingdom", "london", "england"],
};

/** Expand a free-text place query into match tokens (includes original). */
export function placeMatchTokens(raw: string | null | undefined): string[] {
  const q = (raw ?? "").trim().toLowerCase();
  if (!q) return [];
  const tokens = new Set<string>([q]);
  const aliases = PLACE_ALIASES[q];
  if (aliases) aliases.forEach((a) => tokens.add(a));
  for (const [key, list] of Object.entries(PLACE_ALIASES)) {
    if (q.includes(key) || key.includes(q)) list.forEach((a) => tokens.add(a));
  }
  return [...tokens];
}

/** Whether haystack (city/country/title/…) matches any expanded place token. */
export function matchesPlace(haystack: string, query: string): boolean {
  const h = haystack.toLowerCase();
  return placeMatchTokens(query).some((t) => h.includes(t) || t.includes(h));
}
