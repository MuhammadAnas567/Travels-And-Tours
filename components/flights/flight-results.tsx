"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BatteryCharging,
  MonitorPlay,
  Plane,
  Plug,
  RefreshCcw,
  Ruler,
  SlidersHorizontal,
  Wifi,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlightBookModal } from "@/components/flights/flight-book-modal";
import { PriceHistorySparkline } from "@/components/flights/price-history-sparkline";
import type {
  FlightSearchResponse,
  NormalizedFlightResult,
} from "@/lib/flights/serpapi";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/components/providers/preferences-provider";
import {
  convertPrice,
  discountPercentOff,
  FALLBACK_RATES,
  formatCurrency,
  isSupportedCurrency,
} from "@/lib/currency";
import type { Currency } from "@prisma/client";

type SortKey = "price" | "duration" | "departure";

type FlightResultsProps = {
  payload: FlightSearchResponse | null;
  errorMessage: string | null;
  hasSearched: boolean;
  search: {
    origin: string;
    destination: string;
    outboundDate: string;
    returnDate: string | null;
    tripType: "oneway" | "roundtrip";
    adults: number;
    children: number;
    cabinClass: number;
    currency: string;
  };
};

const amenityMap: Array<{
  key: string;
  label: string;
  Icon: typeof Wifi;
}> = [
  { key: "wi-fi", label: "Wi-Fi", Icon: Wifi },
  { key: "power", label: "Power", Icon: Plug },
  { key: "video", label: "Video", Icon: MonitorPlay },
  { key: "legroom", label: "Legroom", Icon: Ruler },
];

function asCurrency(code: string): Currency {
  const upper = code.toUpperCase();
  return isSupportedCurrency(upper) ? upper : "USD";
}

function displayFlightAmount(amount: number, fromCurrency: string, toCurrency: Currency) {
  return convertPrice(amount, asCurrency(fromCurrency), toCurrency, FALLBACK_RATES);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function localTimePart(value: string) {
  const [, time = "—"] = value.split(" ");
  return time;
}

function overnightBadgeDays(start: string, end: string) {
  const startDate = new Date(`${start.split(" ")[0]}T00:00:00`);
  const endDate = new Date(`${end.split(" ")[0]}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
}

function departureSortValue(flight: NormalizedFlightResult) {
  return flight.legs[0]?.departureAirport.time ?? "";
}

function priceInsightTone(level: "low" | "typical" | "high") {
  if (level === "low") return "bg-pine-50 text-pine-700 border-pine-100";
  if (level === "high") return "bg-brass-50 text-brass-700 border-brass-200";
  return "bg-sand text-ink-700 border-line";
}

function carbonTone(value: number | null) {
  if (value == null) return "bg-sand text-ink-500 border-line";
  if (value < 0) return "bg-pine-50 text-pine-700 border-pine-100";
  if (value > 0) return "bg-brass-50 text-brass-700 border-brass-200";
  return "bg-sand text-ink-700 border-line";
}

function nearbyDateLinks(search: FlightResultsProps["search"]) {
  const shifts = [-2, -1, 1, 2];
  return shifts.map((shift) => {
    const date = new Date(`${search.outboundDate}T12:00:00`);
    date.setDate(date.getDate() + shift);
    const outboundDate = date.toISOString().slice(0, 10);
    const params = new URLSearchParams({
      origin: search.origin,
      destination: search.destination,
      outboundDate,
      tripType: search.tripType,
      adults: String(search.adults),
      children: String(search.children),
      cabinClass: String(search.cabinClass),
      currency: search.currency,
    });
    if (search.tripType === "roundtrip" && search.returnDate) {
      const returnDate = new Date(`${search.returnDate}T12:00:00`);
      returnDate.setDate(returnDate.getDate() + shift);
      params.set("returnDate", returnDate.toISOString().slice(0, 10));
    }
    return {
      label: shift > 0 ? `+${shift} day` : `${shift} day`,
      href: `/flights?${params.toString()}`,
    };
  });
}

function amenityMatches(extensions: string[], legroom: string | null) {
  const searchable = [...extensions, legroom ?? ""].join(" ").toLowerCase();
  return amenityMap.filter((item) => searchable.includes(item.key.replace("-", "")) || searchable.includes(item.key));
}

function ResultCard({
  flight,
  sourceCurrency,
  search,
}: {
  flight: NormalizedFlightResult;
  sourceCurrency: string;
  search: FlightResultsProps["search"];
}) {
  const { currency: preferredCurrency } = usePreferences();
  const [bookOpen, setBookOpen] = useState(false);
  const firstLeg = flight.legs[0];
  const lastLeg = flight.legs[flight.legs.length - 1];
  const badges = amenityMatches(
    flight.legs.flatMap((leg) => leg.amenities),
    flight.legs.map((leg) => leg.legroom).find(Boolean) ?? null
  );
  const arrivalOffset = overnightBadgeDays(
    firstLeg.departureAirport.time,
    lastLeg.arrivalAirport.time
  );
  const travellers = search.adults + search.children;
  const routeLabel = `${firstLeg.departureAirport.id} → ${lastLeg.arrivalAirport.id}`;
  const buy = displayFlightAmount(flight.price, sourceCurrency, preferredCurrency);
  const compareAt = displayFlightAmount(
    flight.compareAtPrice,
    sourceCurrency,
    preferredCurrency
  );
  const percentOff = discountPercentOff(compareAt, buy);

  return (
    <>
      <article className="rounded-md border border-line bg-paper p-4 shadow-sm transition-transform hover:-translate-y-[2px] hover:shadow-md">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-pine-50">
                {firstLeg.airlineLogo ? (
                  <Image
                    src={firstLeg.airlineLogo}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                    placeholder="blur"
                    blurDataURL={IMAGE_BLUR_DATA_URL}
                  />
                ) : (
                  <Plane className="m-2 h-6 w-6 text-pine-500" strokeWidth={1.5} />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">{firstLeg.airline}</p>
                <p className="text-xs text-ink-500">
                  {flight.legs.map((leg) => leg.flightNumber).join(" Â· ")}
                </p>
              </div>
              {flight.isBest ? (
                <span className="rounded-full bg-pine-500 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-paper">
                  Best
                </span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center justify-between gap-4 lg:min-w-[420px]">
                <div>
                  <p className="text-2xl font-semibold tabular-nums text-ink-900">
                    {localTimePart(firstLeg.departureAirport.time)}
                  </p>
                  <p className="text-sm text-ink-500">{firstLeg.departureAirport.id}</p>
                </div>

                <div className="flex min-w-[7rem] flex-col items-center">
                  <p className="text-sm tabular-nums text-ink-500">
                    {formatDuration(flight.totalDurationMinutes)}
                  </p>
                  <div className="my-1 h-px w-full bg-line" />
                  <p
                    className={cn(
                      "text-sm",
                      flight.stops === 0 ? "text-success font-medium" : "text-ink-500"
                    )}
                  >
                    {flight.stops === 0
                      ? "Non-stop"
                      : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <p className="text-2xl font-semibold tabular-nums text-ink-900">
                      {localTimePart(lastLeg.arrivalAirport.time)}
                    </p>
                    {arrivalOffset > 0 ? (
                      <span className="rounded-full border border-brass-200 bg-brass-50 px-2 py-0.5 text-xs font-semibold text-brass-700">
                        +{arrivalOffset}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-ink-500">{lastLeg.arrivalAirport.id}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1 xl:items-end">
                {compareAt > buy ? (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <p className="text-lg font-medium tabular-nums text-ink-500 line-through decoration-ink-400">
                      {formatCurrency(compareAt, preferredCurrency)}
                    </p>
                    {percentOff > 0 ? (
                      <span className="rounded-sm border border-brass-200 bg-brass-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-brass-700">
                        {percentOff}% off
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <p className="text-2xl font-semibold tabular-nums text-ink-900">
                  {formatCurrency(buy, preferredCurrency)}
                </p>
                <Button type="button" onClick={() => setBookOpen(true)} className="mt-2 min-w-[10rem]">
                  Book
                </Button>
              </div>
            </div>

            {flight.layovers.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {flight.layovers.map((layover, index) => (
                  <span
                    key={`${layover.airportId}-${index}`}
                    className="rounded-full border border-line bg-sand px-3 py-1 text-sm text-ink-600"
                  >
                    {layover.airportId} {layover.name} Â· {formatDuration(layover.durationMinutes)}
                    {layover.isOvernight ? " Â· Overnight" : ""}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {badges.map(({ label, Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-sand px-3 py-1 text-sm text-ink-600"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {label}
                </span>
              ))}

              {flight.carbonKg != null ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm",
                    carbonTone(flight.carbonVsTypicalPercent)
                  )}
                >
                  <BatteryCharging className="h-4 w-4" strokeWidth={1.5} />
                  {flight.carbonKg} kg CO2
                  {flight.carbonVsTypicalPercent != null
                    ? ` Â· ${flight.carbonVsTypicalPercent > 0 ? "+" : ""}${flight.carbonVsTypicalPercent}%`
                    : ""}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      <FlightBookModal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        flight={{
          ...flight,
          price: buy,
          compareAtPrice: compareAt,
        }}
        currency={preferredCurrency}
        travellers={travellers}
        routeLabel={routeLabel}
      />
    </>
  );
}

export function FlightResults({
  payload,
  errorMessage,
  hasSearched,
  search,
}: FlightResultsProps) {
  const { currency: preferredCurrency } = usePreferences();
  const [sort, setSort] = useState<SortKey>("price");
  const [maxStops, setMaxStops] = useState<number | null>(null);
  const [selectedAirline, setSelectedAirline] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const results = payload?.results ?? [];
  /** Actual fare currency from the API response (URL can drift from cookie). */
  const fareCurrency = asCurrency(payload?.currency || search.currency);

  const airlines = useMemo(
    () =>
      Array.from(
        new Set(
          results
            .flatMap((flight) => flight.legs.map((leg) => leg.airline))
            .filter(Boolean) as string[]
        )
      ).sort((a, b) => a.localeCompare(b)),
    [results]
  );

  function matchesAirline(flight: NormalizedFlightResult, airline: string) {
    if (airline === "all") return true;
    return flight.legs.some((leg) => leg.airline === airline);
  }

  const stopCounts = useMemo(() => {
    const pool = results.filter((flight) => matchesAirline(flight, selectedAirline));
    return {
      any: pool.length,
      0: pool.filter((flight) => flight.stops === 0).length,
      1: pool.filter((flight) => flight.stops <= 1).length,
      2: pool.filter((flight) => flight.stops <= 2).length,
    };
  }, [results, selectedAirline]);

  const filtered = useMemo(() => {
    let list = results.filter((flight) => matchesAirline(flight, selectedAirline));
    if (maxStops != null) {
      list = list.filter((flight) => flight.stops <= maxStops);
    }
    list = [...list].sort((left, right) => {
      if (sort === "duration") return left.totalDurationMinutes - right.totalDurationMinutes;
      if (sort === "departure") {
        return departureSortValue(left).localeCompare(departureSortValue(right));
      }
      return left.price - right.price;
    });
    return list;
  }, [maxStops, results, selectedAirline, sort]);

  function renderFilterPanel(idPrefix: string) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500">
            Max stops
          </p>
          <div className="mt-3 space-y-2" role="radiogroup" aria-label="Maximum stops">
            {(
              [
                { label: "Any", value: null as number | null, count: stopCounts.any },
                { label: "Non-stop", value: 0, count: stopCounts[0] },
                { label: "Up to 1 stop", value: 1, count: stopCounts[1] },
                { label: "Up to 2 stops", value: 2, count: stopCounts[2] },
              ] as const
            ).map((option) => {
              const inputId = `${idPrefix}-stops-${option.value ?? "any"}`;
              const selected = maxStops === option.value;
              return (
                <label
                  key={inputId}
                  htmlFor={inputId}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center justify-between rounded-sm px-2 hover:bg-sand",
                    selected && "bg-pine-50"
                  )}
                >
                  <span className="flex items-center gap-2 text-sm text-ink-700">
                    <input
                      id={inputId}
                      type="radio"
                      name={`${idPrefix}-max-stops`}
                      checked={selected}
                      onChange={() => setMaxStops(option.value)}
                      className="accent-[var(--color-pine-500)]"
                    />
                    {option.label}
                  </span>
                  <span className="text-xs tabular-nums text-ink-500">{option.count}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-airline`}
            className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500"
          >
            Airline
          </label>
          <select
            id={`${idPrefix}-airline`}
            value={selectedAirline}
            onChange={(event) => setSelectedAirline(event.target.value)}
            className="mt-3 flex h-11 w-full rounded-sm border border-line bg-paper px-3 text-sm text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
          >
            <option value="all">All airlines</option>
            {airlines.map((airline) => (
              <option key={airline} value={airline}>
                {airline}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  function clearFilters() {
    setMaxStops(null);
    setSelectedAirline("all");
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12">
      {!hasSearched ? (
        <div className="rounded-md border border-line bg-paper p-8 shadow-sm">
          <p className="eyebrow">Live search</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-900">
            Search a route to see live fares
          </h2>
          <p className="mt-3 max-w-2xl text-ink-500">
            We will show live Google Flights itineraries, price context, and booking options only after you pick a result.
          </p>
        </div>
      ) : errorMessage ? (
        <div className="rounded-md border border-line bg-paper p-8 shadow-sm">
          <p className="eyebrow">Search error</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-900">
            We could not load this route
          </h2>
          <p className="mt-3 max-w-2xl text-ink-500">{errorMessage}</p>
          <Button type="button" className="mt-6" onClick={() => window.location.reload()}>
            <RefreshCcw className="h-4 w-4" strokeWidth={1.5} />
            Retry
          </Button>
        </div>
      ) : payload?.noResults ? (
        <div className="rounded-md border border-line bg-paper p-8 shadow-sm">
          <EmptyState
            icon="plane"
            title="No flights found for this route and date"
            description={`No live fares for ${search.origin} → ${search.destination} on ${search.outboundDate}. Try nearby dates, a major hub (DXB, IST, LHR), or a specific airport instead of a city code.`}
          />
          <div className="mt-6 flex flex-wrap gap-3">
            {nearbyDateLinks(search).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-sm border border-line bg-sand px-4 text-sm font-semibold text-ink-700 hover:border-pine-200 hover:text-pine-600"
              >
                Try {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="hidden w-full shrink-0 rounded-md border border-line bg-paper p-5 shadow-sm lg:sticky lg:top-24 lg:block lg:w-[280px]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-900">Filters</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-pine-600 hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="mt-5">{renderFilterPanel("desktop")}</div>
          </aside>

          {filtersOpen ? (
            <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
              <button
                type="button"
                className="absolute inset-0 bg-ink/50"
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
              />
              <div className="absolute inset-x-0 bottom-0 rounded-t-lg border border-line bg-paper p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-ink-900">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-700 hover:bg-sand"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                </div>
                <div className="mt-5">{renderFilterPanel("mobile")}</div>
                <div className="mt-4 flex gap-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={clearFilters}>
                    Clear
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => setFiltersOpen(false)}>
                    Show {filtered.length} results
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            {payload?.priceInsights ? (
              <div className="rounded-md border border-line bg-paper p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-3 py-1 text-sm font-semibold",
                        priceInsightTone(payload.priceInsights.priceLevel)
                      )}
                    >
                      Prices are currently {payload.priceInsights.priceLevel}
                    </span>
                    <p className="mt-3 max-w-2xl text-sm text-ink-600">
                      Usually{" "}
                      {formatCurrency(
                        displayFlightAmount(
                          payload.priceInsights.typicalPriceRange[0],
                          fareCurrency,
                          preferredCurrency
                        ),
                        preferredCurrency
                      )}
                      -
                      {formatCurrency(
                        displayFlightAmount(
                          payload.priceInsights.typicalPriceRange[1],
                          fareCurrency,
                          preferredCurrency
                        ),
                        preferredCurrency
                      )}{" "}
                      for this route. Lowest seen in the current window:{" "}
                      {formatCurrency(
                        displayFlightAmount(
                          payload.priceInsights.lowestPrice,
                          fareCurrency,
                          preferredCurrency
                        ),
                        preferredCurrency
                      )}
                      .
                    </p>
                  </div>
                  <div className="w-full max-w-[260px]">
                    <PriceHistorySparkline points={payload.priceInsights.history} />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-4 rounded-md border border-line bg-paper p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-ink-500">
                  {filtered.length} of {results.length} result
                  {results.length === 1 ? "" : "s"}
                  {maxStops != null || selectedAirline !== "all" ? " · filtered" : ""}
                  {payload?.cached ? " · cached" : ""}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex items-center gap-2 text-sm text-ink-600">
                  Sort by
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortKey)}
                    className="h-11 rounded-sm border border-line bg-paper px-3 text-sm text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
                  >
                    <option value="price">Price</option>
                    <option value="duration">Duration</option>
                    <option value="departure">Departure time</option>
                  </select>
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  className="lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
                  Filters
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {filtered.length === 0 ? (
                <div className="rounded-md border border-line bg-paper p-8 shadow-sm">
                  <EmptyState
                    icon="plane"
                    title="No flights match these filters"
                    description="Try Any stops, another airline, or Clear filters to see all results again."
                  />
                  <Button type="button" className="mt-6" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              ) : (
                filtered.map((flight) => (
                  <ResultCard
                    key={flight.id}
                    flight={flight}
                    sourceCurrency={fareCurrency}
                    search={search}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
