import { createHash } from "crypto";
import { flightSearchSchema, type FlightSearchInput } from "@/lib/validations";
import { isSerpApiNoResultsError, toSerpApiAirportId } from "@/lib/flights/airport-ids";
import {
  applyRatesToAmount,
  pickFlightPricingRates,
  toPublicFlightPrice,
  type FlightPricingRates,
} from "@/lib/flights/pricing";

const SERPAPI_URL = "https://serpapi.com/search";
const SEARCH_CACHE_TTL_MS = 30 * 60 * 1000;
const BOOKING_CACHE_TTL_MS = 30 * 60 * 1000;

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

type MutableGlobal = typeof globalThis & {
  __arreatFlightSearchCache?: Map<string, CacheEntry<FlightSearchResponse>>;
  __arreatFlightBookingCache?: Map<string, CacheEntry<FlightBookingOptionsResponse>>;
};

const searchCache =
  (globalThis as MutableGlobal).__arreatFlightSearchCache ??
  ((globalThis as MutableGlobal).__arreatFlightSearchCache = new Map());

const bookingCache =
  (globalThis as MutableGlobal).__arreatFlightBookingCache ??
  ((globalThis as MutableGlobal).__arreatFlightBookingCache = new Map());

type SerpApiAirport = {
  id?: string;
  name?: string;
  time?: string;
};

type SerpApiLeg = {
  airline?: string;
  airline_logo?: string;
  flight_number?: string;
  airplane?: string;
  travel_class?: string;
  legroom?: string;
  ticket_also_sold_by?: string[];
  overnight?: boolean;
  extensions?: string[];
  duration?: number;
  departure_airport?: SerpApiAirport;
  arrival_airport?: SerpApiAirport;
};

type SerpApiLayover = {
  id?: string;
  name?: string;
  duration?: number;
  overnight?: boolean;
};

type SerpApiCarbon = {
  this_flight?: number;
  typical_for_this_route?: number;
  difference_percent?: number;
};

type SerpApiItinerary = {
  price?: number;
  total_duration?: number;
  flights?: SerpApiLeg[];
  layovers?: SerpApiLayover[];
  carbon_emissions?: SerpApiCarbon;
  booking_token?: string;
  departure_token?: string;
};

type SerpApiPriceInsights = {
  lowest_price?: number;
  price_level?: "low" | "typical" | "high";
  typical_price_range?: [number, number];
  price_history?: [number, number][];
};

type SerpApiBookingOption = {
  together?: {
    book_with?: string;
    airline?: boolean;
    airline_logos?: string[];
    local_prices?: Array<{ currency?: string; price?: number }>;
  };
  booking_request?: {
    url?: string;
    post_data?: string;
  };
  price?: number;
  currency?: string;
  option_title?: string;
  extensions?: string[];
  baggage_prices?: string[];
};

type SerpApiBookingResponse = {
  booking_options?: SerpApiBookingOption[];
  selected_flights?: Array<{ flight_number?: string; airline?: string }>;
  baggage_prices?: string[];
  error?: string;
};

export type PriceInsightSummary = {
  lowestPrice: number;
  priceLevel: "low" | "typical" | "high";
  typicalPriceRange: [number, number];
  history: { timestamp: number; price: number }[];
};

export type NormalizedFlightResult = {
  id: string;
  isBest: boolean;
  /** Customer buy price (commission applied). Never the supplier fare. */
  price: number;
  /** Inflated “was” price for strikethrough display. */
  compareAtPrice: number;
  currency: string;
  totalDurationMinutes: number;
  stops: number;
  arrivesNextDay: boolean;
  bookingToken: string;
  /** Round-trip outbound legs expose this instead of bookingToken until a return is chosen. */
  departureToken: string;
  legs: {
    airline: string;
    airlineLogo: string;
    flightNumber: string;
    airplane: string | null;
    travelClass: string | null;
    legroom: string | null;
    alsoSoldBy: string[];
    isOvernight: boolean;
    amenities: string[];
    durationMinutes: number;
    departureAirport: { id: string; name: string; time: string };
    arrivalAirport: { id: string; name: string; time: string };
  }[];
  layovers: {
    airportId: string;
    name: string;
    durationMinutes: number;
    isOvernight: boolean;
  }[];
  carbonKg: number | null;
  carbonVsTypicalPercent: number | null;
};

export type FlightSearchResponse = {
  cached: boolean;
  noResults: boolean;
  currency: string;
  priceInsights: PriceInsightSummary | null;
  results: NormalizedFlightResult[];
};

export type FlightBookingOption = {
  label: string;
  agent: string;
  deepLink: string | null;
  price: number | null;
  currency: string | null;
  airlineLogos: string[];
  extensions: string[];
  baggagePrices: string[];
};

export type FlightBookingOptionsResponse = {
  cached: boolean;
  options: FlightBookingOption[];
  selectedFlights: string[];
  baggagePrices: string[];
};

function getSerpApiKey() {
  const key = process.env.SERPAPI_KEY?.trim();
  if (!key) {
    throw new Error("SERPAPI_KEY is missing. Add it to .env.local before searching flights.");
  }
  return key;
}

function getCachedValue<T>(store: Map<string, CacheEntry<T>>, key: string) {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

function setCachedValue<T>(store: Map<string, CacheEntry<T>>, key: string, ttlMs: number, value: T) {
  store.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  });
}

function makeHashKey(seed: object) {
  return createHash("sha256").update(JSON.stringify(seed)).digest("hex");
}

function toNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizePriceInsights(input: SerpApiPriceInsights | undefined): PriceInsightSummary | null {
  if (!input) return null;
  const lowestPrice = toNumber(input.lowest_price);
  const priceLevel = input.price_level;
  const range = input.typical_price_range;
  if (
    lowestPrice == null ||
    (priceLevel !== "low" && priceLevel !== "typical" && priceLevel !== "high") ||
    !Array.isArray(range) ||
    toNumber(range[0]) == null ||
    toNumber(range[1]) == null
  ) {
    return null;
  }
  return {
    lowestPrice,
    priceLevel,
    typicalPriceRange: [range[0], range[1]],
    history: Array.isArray(input.price_history)
      ? input.price_history
          .map((entry) =>
            Array.isArray(entry) && entry.length === 2 && toNumber(entry[0]) != null && toNumber(entry[1]) != null
              ? { timestamp: entry[0] * 1000, price: entry[1] }
              : null
          )
          .filter((entry): entry is { timestamp: number; price: number } => Boolean(entry))
      : [],
  };
}

function datePart(value: string) {
  return value.split(" ")[0] ?? value;
}

function overnightDelta(start: string, end: string) {
  const startDate = new Date(`${datePart(start)}T00:00:00`);
  const endDate = new Date(`${datePart(end)}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
}

function normalizeItinerary(
  itinerary: SerpApiItinerary,
  isBest: boolean,
  currency: string
): NormalizedFlightResult | null {
  const rawLegs = Array.isArray(itinerary.flights) ? itinerary.flights : [];
  if (rawLegs.length === 0) return null;

  const legs = rawLegs.map((leg) => ({
    airline: toStringValue(leg.airline, "Unknown airline"),
    airlineLogo: toStringValue(leg.airline_logo),
    flightNumber: toStringValue(leg.flight_number, "—"),
    airplane: typeof leg.airplane === "string" ? leg.airplane : null,
    travelClass: typeof leg.travel_class === "string" ? leg.travel_class : null,
    legroom: typeof leg.legroom === "string" ? leg.legroom : null,
    alsoSoldBy: Array.isArray(leg.ticket_also_sold_by)
      ? leg.ticket_also_sold_by.filter((item): item is string => typeof item === "string")
      : [],
    isOvernight: leg.overnight === true,
    amenities: Array.isArray(leg.extensions)
      ? leg.extensions.filter((item): item is string => typeof item === "string")
      : [],
    durationMinutes: toNumber(leg.duration) ?? 0,
    departureAirport: {
      id: toStringValue(leg.departure_airport?.id, "—"),
      name: toStringValue(leg.departure_airport?.name, "Unknown departure"),
      time: toStringValue(leg.departure_airport?.time, "—"),
    },
    arrivalAirport: {
      id: toStringValue(leg.arrival_airport?.id, "—"),
      name: toStringValue(leg.arrival_airport?.name, "Unknown arrival"),
      time: toStringValue(leg.arrival_airport?.time, "—"),
    },
  }));

  const layovers = Array.isArray(itinerary.layovers)
    ? itinerary.layovers.map((layover) => ({
        airportId: toStringValue(layover.id, "—"),
        name: toStringValue(layover.name, "Layover"),
        durationMinutes: toNumber(layover.duration) ?? 0,
        isOvernight: layover.overnight === true,
      }))
    : [];

  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];
  const itineraryArrivalDelta = overnightDelta(firstLeg.departureAirport.time, lastLeg.arrivalAirport.time);
  const itineraryPrice = toNumber(itinerary.price);
  // Round-trip outbound legs sometimes omit price until a return is chosen;
  // keep them so the UI can continue the select flow.
  const bookingToken = toStringValue(itinerary.booking_token);
  const departureToken = toStringValue(itinerary.departure_token);
  if (itineraryPrice == null && !departureToken && !bookingToken) return null;
  const price = itineraryPrice ?? 0;
  const stableSeed =
    bookingToken ||
    departureToken ||
    [
      firstLeg.departureAirport.id,
      lastLeg.arrivalAirport.id,
      firstLeg.departureAirport.time,
      lastLeg.arrivalAirport.time,
      itineraryPrice ?? 0,
    ].join("|");

  return {
    id: makeHashKey({ isBest, stableSeed }),
    isBest,
    price,
    compareAtPrice: 0,
    currency,
    totalDurationMinutes: toNumber(itinerary.total_duration) ?? legs.reduce((sum, leg) => sum + leg.durationMinutes, 0),
    stops: Math.max(0, legs.length - 1),
    arrivesNextDay: itineraryArrivalDelta > 0 || legs.some((leg) => leg.isOvernight),
    bookingToken,
    departureToken,
    legs,
    layovers,
    carbonKg:
      toNumber(itinerary.carbon_emissions?.this_flight) != null
        ? Number(((itinerary.carbon_emissions?.this_flight ?? 0) / 1000).toFixed(1))
        : null,
    carbonVsTypicalPercent: toNumber(itinerary.carbon_emissions?.difference_percent),
  };
}

function publicizeFlight(
  flight: NormalizedFlightResult,
  rates: FlightPricingRates
): NormalizedFlightResult {
  const publicPrice = toPublicFlightPrice(flight.price, rates);
  return {
    ...flight,
    price: publicPrice.price,
    compareAtPrice: publicPrice.compareAtPrice,
  };
}

function publicizePriceInsights(
  insights: PriceInsightSummary | null,
  rates: FlightPricingRates
): PriceInsightSummary | null {
  if (!insights) return null;
  return {
    priceLevel: insights.priceLevel,
    lowestPrice: applyRatesToAmount(insights.lowestPrice, rates),
    typicalPriceRange: [
      applyRatesToAmount(insights.typicalPriceRange[0], rates),
      applyRatesToAmount(insights.typicalPriceRange[1], rates),
    ],
    history: insights.history.map((entry) => ({
      timestamp: entry.timestamp,
      price: applyRatesToAmount(entry.price, rates),
    })),
  };
}

function publicizeSearchPayload(
  seed: string,
  results: NormalizedFlightResult[],
  priceInsights: PriceInsightSummary | null
): Pick<FlightSearchResponse, "results" | "priceInsights"> {
  const rates = pickFlightPricingRates(seed);
  return {
    results: results.map((flight) => publicizeFlight(flight, rates)),
    priceInsights: publicizePriceInsights(priceInsights, rates),
  };
}

async function fetchSerpApi<T>(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  query.set("engine", "google_flights");
  query.set("api_key", getSerpApiKey());

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    query.set(key, String(value));
  }

  const response = await fetch(`${SERPAPI_URL}?${query.toString()}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const json = (await response.json().catch(() => ({}))) as T & {
    error?: string;
    best_flights?: unknown;
    other_flights?: unknown;
  };

  const apiError = typeof json.error === "string" ? json.error : "";
  const hasFlightPayload =
    (Array.isArray(json.best_flights) && json.best_flights.length > 0) ||
    (Array.isArray(json.other_flights) && json.other_flights.length > 0);

  if (!response.ok) {
    if (isSerpApiNoResultsError(apiError)) {
      return { ...json, error: undefined };
    }
    throw new Error(apiError || `SerpApi request failed with status ${response.status}`);
  }

  // Google sometimes returns this message with an empty set — treat as no results,
  // not a hard failure. Keep real flights if they arrived alongside the message.
  if (apiError && !hasFlightPayload) {
    if (isSerpApiNoResultsError(apiError)) {
      return { ...json, error: undefined, best_flights: [], other_flights: [] };
    }
    throw new Error(apiError);
  }

  return json;
}

export function parseFlightSearchInput(input: unknown): FlightSearchInput {
  return flightSearchSchema.parse(input);
}

export async function searchSerpApiFlights(input: unknown): Promise<FlightSearchResponse> {
  const parsed = parseFlightSearchInput(input);
  const cacheKey = makeHashKey({ v: 3, ...parsed });
  const cached: FlightSearchResponse | null = getCachedValue(searchCache, cacheKey);
  if (cached) {
    return {
      cached: true,
      noResults: cached.noResults,
      currency: cached.currency,
      priceInsights: cached.priceInsights,
      results: cached.results,
    };
  }

  const json = await fetchSerpApi<{
    best_flights?: SerpApiItinerary[];
    other_flights?: SerpApiItinerary[];
    price_insights?: SerpApiPriceInsights;
  }>({
    departure_id: toSerpApiAirportId(parsed.origin),
    arrival_id: toSerpApiAirportId(parsed.destination),
    outbound_date: parsed.outboundDate,
    return_date: parsed.tripType === "roundtrip" ? parsed.returnDate ?? undefined : undefined,
    type: parsed.tripType === "roundtrip" ? 1 : 2,
    adults: parsed.adults,
    children: parsed.children > 0 ? parsed.children : undefined,
    travel_class: parsed.cabinClass,
    currency: parsed.currency,
    hl: "en",
    gl: "pk",
  });

  const bestFlights = Array.isArray(json.best_flights) ? json.best_flights : [];
  const otherFlights = Array.isArray(json.other_flights) ? json.other_flights : [];
  const combined = [
    ...bestFlights.map((item) => normalizeItinerary(item, true, parsed.currency)),
    ...otherFlights.map((item) => normalizeItinerary(item, false, parsed.currency)),
  ].filter((item): item is NormalizedFlightResult => Boolean(item));

  const publicized = publicizeSearchPayload(
    cacheKey,
    combined,
    normalizePriceInsights(json.price_insights)
  );

  const result: FlightSearchResponse = {
    cached: false,
    noResults: publicized.results.length === 0,
    currency: parsed.currency,
    priceInsights: publicized.priceInsights,
    results: publicized.results,
  };

  setCachedValue(searchCache, cacheKey, SEARCH_CACHE_TTL_MS, { ...result, cached: false });
  return result;
}

export async function fetchFlightBookingOptions({
  bookingToken,
  currency = "PKR",
}: {
  bookingToken: string;
  currency?: string;
}): Promise<FlightBookingOptionsResponse> {
  const normalizedToken = bookingToken.trim();
  if (!normalizedToken) {
    return {
      cached: false,
      options: [],
      selectedFlights: [],
      baggagePrices: [],
    };
  }

  const cacheKey = makeHashKey({ bookingToken: normalizedToken, currency });
  const cached: FlightBookingOptionsResponse | null = getCachedValue(bookingCache, cacheKey);
  if (cached) {
    return {
      cached: true,
      options: cached.options,
      selectedFlights: cached.selectedFlights,
      baggagePrices: cached.baggagePrices,
    };
  }

  const json = await fetchSerpApi<SerpApiBookingResponse>({
    booking_token: normalizedToken,
    currency,
    hl: "en",
    gl: "pk",
  });

  const options = Array.isArray(json.booking_options)
    ? json.booking_options.map((option, index) => {
        const localPrice = Array.isArray(option.together?.local_prices)
          ? option.together?.local_prices.find(
              (entry) => typeof entry.currency === "string" && typeof entry.price === "number"
            )
          : undefined;
        const bookingRequest = option.booking_request;
        const deepLink =
          bookingRequest?.url && bookingRequest.post_data
            ? `${bookingRequest.url}?${new URLSearchParams({ f: bookingRequest.post_data }).toString()}`
            : bookingRequest?.url ?? null;

        const sourcePrice = localPrice?.price ?? toNumber(option.price);
        const rates = pickFlightPricingRates(`${cacheKey}:opt:${index}`);
        const publicPrice =
          sourcePrice != null ? toPublicFlightPrice(sourcePrice, rates).price : null;

        return {
          label: toStringValue(option.option_title, "Booking option"),
          agent: toStringValue(option.together?.book_with, "Travel partner"),
          deepLink,
          price: publicPrice,
          currency: localPrice?.currency ?? (typeof option.currency === "string" ? option.currency : null),
          airlineLogos: Array.isArray(option.together?.airline_logos)
            ? option.together?.airline_logos.filter((item): item is string => typeof item === "string")
            : [],
          extensions: Array.isArray(option.extensions)
            ? option.extensions.filter((item): item is string => typeof item === "string")
            : [],
          baggagePrices: Array.isArray(option.baggage_prices)
            ? option.baggage_prices.filter((item): item is string => typeof item === "string")
            : [],
        };
      })
    : [];

  const response: FlightBookingOptionsResponse = {
    cached: false,
    options,
    selectedFlights: Array.isArray(json.selected_flights)
      ? json.selected_flights
          .map((flight) => [flight.airline, flight.flight_number].filter(Boolean).join(" ").trim())
          .filter(Boolean)
      : [],
    baggagePrices: Array.isArray(json.baggage_prices)
      ? json.baggage_prices.filter((item): item is string => typeof item === "string")
      : [],
  };

  setCachedValue(bookingCache, cacheKey, BOOKING_CACHE_TTL_MS, { ...response, cached: false });
  return response;
}

/**
 * Round-trip step 2: after the user picks an outbound itinerary, SerpApi needs the
 * departure_token to return matching return flights (each with a booking_token).
 * This costs another search credit — only call after an explicit Select click.
 */
export async function fetchReturnFlights(input: {
  departureToken: string;
  origin: string;
  destination: string;
  outboundDate: string;
  returnDate: string;
  adults?: number;
  children?: number;
  cabinClass?: number;
  currency?: string;
}): Promise<FlightSearchResponse> {
  const departureToken = input.departureToken.trim();
  if (!departureToken) {
    return {
      cached: false,
      noResults: true,
      currency: input.currency ?? "PKR",
      priceInsights: null,
      results: [],
    };
  }

  const currency = (input.currency ?? "PKR").toUpperCase();
  const cacheKey = makeHashKey({
    departureToken,
    origin: input.origin,
    destination: input.destination,
    outboundDate: input.outboundDate,
    returnDate: input.returnDate,
    adults: input.adults ?? 1,
    children: input.children ?? 0,
    cabinClass: input.cabinClass ?? 1,
    currency,
  });
  const cached: FlightSearchResponse | null = getCachedValue(searchCache, cacheKey);
  if (cached) {
    return {
      cached: true,
      noResults: cached.noResults,
      currency: cached.currency,
      priceInsights: cached.priceInsights,
      results: cached.results,
    };
  }

  const children = input.children ?? 0;
  const json = await fetchSerpApi<{
    best_flights?: SerpApiItinerary[];
    other_flights?: SerpApiItinerary[];
    price_insights?: SerpApiPriceInsights;
  }>({
    departure_id: toSerpApiAirportId(input.origin),
    arrival_id: toSerpApiAirportId(input.destination),
    outbound_date: input.outboundDate,
    return_date: input.returnDate,
    type: 1,
    adults: input.adults ?? 1,
    children: children > 0 ? children : undefined,
    travel_class: input.cabinClass ?? 1,
    currency,
    departure_token: departureToken,
    hl: "en",
    gl: "pk",
  });

  const bestFlights = Array.isArray(json.best_flights) ? json.best_flights : [];
  const otherFlights = Array.isArray(json.other_flights) ? json.other_flights : [];
  const combined = [
    ...bestFlights.map((item) => normalizeItinerary(item, true, currency)),
    ...otherFlights.map((item) => normalizeItinerary(item, false, currency)),
  ].filter((item): item is NormalizedFlightResult => Boolean(item));

  const publicized = publicizeSearchPayload(
    cacheKey,
    combined,
    normalizePriceInsights(json.price_insights)
  );

  const result: FlightSearchResponse = {
    cached: false,
    noResults: publicized.results.length === 0,
    currency,
    priceInsights: publicized.priceInsights,
    results: publicized.results,
  };

  setCachedValue(searchCache, cacheKey, SEARCH_CACHE_TTL_MS, { ...result, cached: false });
  return result;
}
