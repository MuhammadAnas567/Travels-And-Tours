import airportsJson from "@/lib/data/commercial-airports.json";
import { POPULAR_AIRPORT_CODES } from "@/lib/data/iata-airports";

export type CommercialAirport = {
  code: string;
  name: string;
  city: string;
  country: string;
  type: "large" | "medium" | "small" | string;
};

export type AirportSearchResult = CommercialAirport & {
  label: string;
  countryName: string;
};

/** Multi-airport city codes (Google Flights / SerpApi style). */
const METRO_AREAS: CommercialAirport[] = [
  { code: "LON", name: "All airports", city: "London", country: "GB", type: "large" },
  { code: "NYC", name: "All airports", city: "New York", country: "US", type: "large" },
  { code: "PAR", name: "All airports", city: "Paris", country: "FR", type: "large" },
  { code: "TYO", name: "All airports", city: "Tokyo", country: "JP", type: "large" },
  { code: "MIL", name: "All airports", city: "Milan", country: "IT", type: "large" },
  { code: "ROM", name: "All airports", city: "Rome", country: "IT", type: "large" },
  { code: "MOW", name: "All airports", city: "Moscow", country: "RU", type: "large" },
  { code: "SEL", name: "All airports", city: "Seoul", country: "KR", type: "large" },
  { code: "BJS", name: "All airports", city: "Beijing", country: "CN", type: "large" },
  { code: "SHA", name: "All airports", city: "Shanghai", country: "CN", type: "large" },
  { code: "OSA", name: "All airports", city: "Osaka", country: "JP", type: "large" },
  { code: "YTO", name: "All airports", city: "Toronto", country: "CA", type: "large" },
  { code: "YMQ", name: "All airports", city: "Montreal", country: "CA", type: "large" },
  { code: "WAS", name: "All airports", city: "Washington", country: "US", type: "large" },
  { code: "CHI", name: "All airports", city: "Chicago", country: "US", type: "large" },
  { code: "SAO", name: "All airports", city: "Sao Paulo", country: "BR", type: "large" },
  { code: "RIO", name: "All airports", city: "Rio de Janeiro", country: "BR", type: "large" },
  { code: "BUE", name: "All airports", city: "Buenos Aires", country: "AR", type: "large" },
  { code: "JKT", name: "All airports", city: "Jakarta", country: "ID", type: "large" },
];

const ALL = [...METRO_AREAS, ...(airportsJson as CommercialAirport[])];
const BY_CODE = new Map(ALL.map((a) => [a.code, a]));

const TYPE_RANK: Record<string, number> = {
  large: 0,
  medium: 1,
  small: 2,
};

function countryName(iso: string): string {
  if (!iso) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(iso) ?? iso;
  } catch {
    return iso;
  }
}

function formatLabel(airport: CommercialAirport): string {
  const raw = (airport.city || airport.name || "").split("(")[0]?.trim();
  const city = raw || airport.name || airport.code;
  if (airport.name === "All airports") return `${city} - all airports (${airport.code})`;
  return `${city} (${airport.code})`;
}

function toResult(airport: CommercialAirport): AirportSearchResult {
  return {
    ...airport,
    label: formatLabel(airport),
    countryName: countryName(airport.country),
  };
}

function normalizeQuery(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

/** City token before parenthetical detail — "Paris (Roissy…)" → "paris". */
function cityPrimary(city: string): string {
  return normalizeQuery((city || "").split("(")[0] ?? "");
}

/** Look up a commercial airport by IATA / metro code. */
export function getAirportByCode(code: string): CommercialAirport | undefined {
  return BY_CODE.get(code.trim().toUpperCase());
}

/**
 * Search ~5k commercial airports (OurAirports large/medium + scheduled small)
 * plus multi-airport city codes (LON, NYC, PAR, …).
 * Empty query returns popular shortcuts.
 */
export function searchCommercialAirports(
  query: string,
  limit = 12
): AirportSearchResult[] {
  const capped = Math.min(Math.max(limit, 1), 25);
  const q = normalizeQuery(query);

  if (!q) {
    return POPULAR_AIRPORT_CODES.map((code) => BY_CODE.get(code))
      .filter((a): a is CommercialAirport => Boolean(a))
      .slice(0, capped)
      .map(toResult);
  }

  const exactCode = q.length === 3 ? BY_CODE.get(q.toUpperCase()) : undefined;
  const scored: { airport: CommercialAirport; score: number }[] = [];

  for (const airport of ALL) {
    const code = airport.code.toLowerCase();
    const city = normalizeQuery(airport.city || "");
    const primary = cityPrimary(airport.city || "");
    const name = normalizeQuery(airport.name || "");
    const country = normalizeQuery(airport.country || "");
    const countryFull = normalizeQuery(countryName(airport.country));
    const hay = `${city} ${name} ${code} ${country} ${countryFull}`;
    const isMetro = airport.name === "All airports";

    let score = -1;
    if (code === q) score = 0;
    else if (code.startsWith(q)) score = 1;
    else if (primary === q) score = isMetro ? 1.5 : 2;
    else if (primary.startsWith(q)) score = isMetro ? 2.5 : 3;
    else if (name.startsWith(q)) score = 4;
    else if (city.includes(q) || name.includes(q)) score = 5;
    else if (hay.includes(q)) score = 6;

    if (score < 0) continue;
    scored.push({
      airport,
      score: score * 10 + (isMetro ? -1 : TYPE_RANK[airport.type] ?? 9),
    });
  }

  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.airport.code.localeCompare(b.airport.code);
  });

  const out: AirportSearchResult[] = [];
  const seen = new Set<string>();

  if (exactCode) {
    out.push(toResult(exactCode));
    seen.add(exactCode.code);
  }

  for (const row of scored) {
    if (seen.has(row.airport.code)) continue;
    out.push(toResult(row.airport));
    seen.add(row.airport.code);
    if (out.length >= capped) break;
  }

  return out;
}
