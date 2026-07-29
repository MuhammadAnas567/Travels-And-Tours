/**
 * SerpApi Google Flights does not accept legacy metro codes like NYC/LON as
 * single IATA ids. Map them to real airport ids SerpApi accepts.
 *
 * Prefer a primary hub (reliable) over comma-lists — multi-airport ids often
 * return empty from Google Flights for long-haul origin markets like PK.
 */
const METRO_TO_AIRPORTS: Record<string, string> = {
  NYC: "JFK",
  LON: "LHR",
  PAR: "CDG",
  TYO: "HND",
  MIL: "MXP",
  ROM: "FCO",
  MOW: "SVO",
  SEL: "ICN",
  BJS: "PEK",
  SHA: "PVG",
  OSA: "KIX",
  YTO: "YYZ",
  YMQ: "YUL",
  WAS: "IAD",
  CHI: "ORD",
  SAO: "GRU",
  RIO: "GIG",
  BUE: "EZE",
  JKT: "CGK",
};

/** Resolve a user/airport code into a SerpApi departure_id / arrival_id value. */
export function toSerpApiAirportId(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return normalized;
  return METRO_TO_AIRPORTS[normalized] ?? normalized;
}

/** True when SerpApi reported an empty flight set (not a transport/auth failure). */
export function isSerpApiNoResultsError(message: string | undefined | null): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("hasn't returned any results") ||
    m.includes("has not returned any results") ||
    m.includes("no results") ||
    m.includes("didn't return any results")
  );
}
