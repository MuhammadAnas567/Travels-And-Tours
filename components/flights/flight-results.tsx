"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plane, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlightRowSkeleton } from "@/components/ui/skeleton";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";
import { cn } from "@/lib/utils";
import { DisplayPrice } from "@/components/shared/display-price";
import { usePreferences } from "@/components/providers/preferences-provider";

export type FlightResult = {
  _id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  durationMins: number;
  stops: number;
  priceByClass?: { economy?: number; business?: number; first?: number };
  source?: "amadeus" | "duffel" | "catalog";
};

type SortKey = "best" | "cheapest" | "fastest";
type CabinKey = "economy" | "business" | "first";

const CITY_TO_CODE: Record<string, string> = {
  karachi: "KHI",
  lahore: "LHE",
  islamabad: "ISB",
  dubai: "DXB",
  istanbul: "IST",
  london: "LHR",
  jeddah: "JED",
  doha: "DOH",
  abu: "AUH",
  "abu dhabi": "AUH",
};

function normalizeAirport(raw: string) {
  const t = raw.trim().toUpperCase();
  if (!t) return "";
  if (t.length === 3) return t;
  const mapped = CITY_TO_CODE[raw.trim().toLowerCase()];
  return mapped ?? t;
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  // Fixed UTC clock to keep SSR and client HTML identical
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function cabinFromParam(raw: string | null): CabinKey {
  const c = (raw ?? "economy").toLowerCase();
  if (c.includes("business")) return "business";
  if (c.includes("first")) return "first";
  return "economy";
}

function priceOf(f: FlightResult, cabin: CabinKey) {
  const prices = f.priceByClass;
  if (!prices) return Number.POSITIVE_INFINITY;
  if (cabin === "business") return prices.business ?? prices.economy ?? Number.POSITIVE_INFINITY;
  if (cabin === "first") return prices.first ?? prices.business ?? prices.economy ?? Number.POSITIVE_INFINITY;
  return prices.economy ?? Number.POSITIVE_INFINITY;
}

function FlightResultsInner({ flights }: { flights: FlightResult[] }) {
  const params = useSearchParams();
  const { t } = usePreferences();
  const [route, setRoute] = useState({ from: "", to: "", cabin: "economy" as CabinKey });

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const fromQ = params.get("from") ?? q.get("from") ?? "";
    const toQ = params.get("to") ?? q.get("to") ?? "";
    const cabinQ = params.get("cabin") ?? q.get("cabin");
    setRoute({
      from: normalizeAirport(fromQ),
      to: normalizeAirport(toQ),
      cabin: cabinFromParam(cabinQ),
    });
  }, [params]);

  const from = route.from;
  const to = route.to;
  const cabin = route.cabin;

  const [sort, setSort] = useState<SortKey>("best");
  const [maxStops, setMaxStops] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dimming, setDimming] = useState(false);

  const routeFiltered = useMemo(() => {
    let list = [...flights];
    if (from) list = list.filter((f) => f.from.toUpperCase() === from || f.from.toUpperCase().includes(from));
    if (to) list = list.filter((f) => f.to.toUpperCase() === to || f.to.toUpperCase().includes(to));
    return list;
  }, [flights, from, to]);

  const filtered = useMemo(() => {
    let list = [...routeFiltered];
    if (maxStops !== null) list = list.filter((f) => f.stops <= maxStops);
    const p = (f: FlightResult) => priceOf(f, cabin);
    if (sort === "cheapest") list.sort((a, b) => p(a) - p(b));
    else if (sort === "fastest") list.sort((a, b) => a.durationMins - b.durationMins);
    else
      list.sort(
        (a, b) => p(a) / 100 + a.durationMins / 60 - (p(b) / 100 + b.durationMins / 60)
      );
    return list;
  }, [routeFiltered, sort, maxStops, cabin]);

  const cheapestFlight = useMemo(() => {
    if (!routeFiltered.length) return null;
    return routeFiltered.reduce((a, b) => (priceOf(a, cabin) <= priceOf(b, cabin) ? a : b));
  }, [routeFiltered, cabin]);
  const fastestFlight = useMemo(() => {
    if (!routeFiltered.length) return null;
    return routeFiltered.reduce((a, b) => (a.durationMins <= b.durationMins ? a : b));
  }, [routeFiltered]);
  const best = filtered[0];

  function applyFilter(next: number | null) {
    setDimming(true);
    setMaxStops(next);
    window.setTimeout(() => setDimming(false), 280);
  }

  const activeFilters = maxStops !== null ? 1 : 0;

  const sortTabs: { key: SortKey; label: string; value: string; amount?: number }[] = [
    {
      key: "best",
      label: "Best",
      value: best ? formatDuration(best.durationMins) : "—",
      amount: best ? priceOf(best, cabin) : undefined,
    },
    {
      key: "cheapest",
      label: "Cheapest",
      value: cheapestFlight ? formatDuration(cheapestFlight.durationMins) : "—",
      amount: cheapestFlight ? priceOf(cheapestFlight, cabin) : undefined,
    },
    {
      key: "fastest",
      label: "Fastest",
      value: fastestFlight ? formatDuration(fastestFlight.durationMins) : "—",
      amount: fastestFlight ? priceOf(fastestFlight, cabin) : undefined,
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 lg:px-8 pb-24 sm:pb-24 lg:pb-12 w-full overflow-x-clip">
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
        <aside
          className={cn(
            "w-full lg:w-[280px] shrink-0 rounded-md border border-line bg-paper p-4 sm:p-5 h-fit lg:sticky lg:top-24",
            filtersOpen ? "block" : "hidden lg:block"
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold text-ink-900">Filters</h2>
            {activeFilters > 0 ? (
              <button
                type="button"
                onClick={() => applyFilter(null)}
                className="text-sm font-semibold text-navy-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 rounded-sm"
              >
                Clear all
              </button>
            ) : null}
          </div>
          <fieldset className="mt-4 space-y-2">
            <legend className="text-caption">Stops</legend>
            {[
              { label: "Any", value: null as number | null },
              { label: "Direct", value: 0 },
              { label: "1 stop max", value: 1 },
            ].map((opt) => {
              const count =
                opt.value === null
                  ? routeFiltered.length
                  : routeFiltered.filter((f) => f.stops <= (opt.value as number)).length;
              return (
                <label
                  key={String(opt.value)}
                  className="flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-sm px-2 hover:bg-surface-alt"
                >
                  <span className="flex items-center gap-2 text-sm text-ink-700">
                    <input
                      type="radio"
                      name="stops"
                      checked={maxStops === opt.value}
                      onChange={() => applyFilter(opt.value)}
                      className="accent-[var(--color-navy-500)]"
                    />
                    {opt.label}
                  </span>
                  <span className="tabular-nums text-sm text-ink-500">{count}</span>
                </label>
              );
            })}
          </fieldset>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-3 gap-1 sm:gap-2 rounded-md border border-line bg-paper p-1">
            {sortTabs.map((tabItem) => (
              <button
                key={tabItem.key}
                type="button"
                onClick={() => setSort(tabItem.key)}
                className={cn(
                  "min-h-11 sm:min-h-14 rounded-sm px-1.5 sm:px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500",
                  sort === tabItem.key ? "bg-pine-50 text-pine-700" : "text-ink-700 hover:bg-sand"
                )}
              >
                <span className="block text-xs sm:text-sm font-semibold">{tabItem.label}</span>
                <span className="block text-[10px] sm:text-xs tabular-nums text-ink-500 truncate">
                  {tabItem.amount != null && Number.isFinite(tabItem.amount) ? (
                    <>
                      <DisplayPrice amount={tabItem.amount} /> · {tabItem.value}
                    </>
                  ) : (
                    tabItem.value
                  )}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-3 text-sm text-ink-500" aria-live="polite">
            {filtered.length} {t("common.results")} · {cabin}
            {from || to ? ` · ${from || "Any"} → ${to || "Any"}` : ""}
          </p>

          <div className={cn("mt-4 space-y-3 transition-opacity", dimming && "opacity-50")}>
            {dimming ? (
              Array.from({ length: 6 }).map((_, i) => <FlightRowSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="plane"
                title="No flights match this search"
                description={
                  from || to
                    ? "Try another route (e.g. KHI → DXB) or clear filters."
                    : "Widen stops or clear filters to see more routes."
                }
                actionLabel="Show all flights"
                onAction={() => {
                  applyFilter(null);
                  window.location.href = "/flights";
                }}
              />
            ) : (
              filtered.map((f) => {
                const fare = priceOf(f, cabin);
                return (
                  <article
                    key={f._id}
                    className="flex flex-col gap-4 rounded-md border border-line bg-paper p-3 shadow-sm sm:p-4 lg:flex-row lg:items-center lg:gap-6"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                      <div className="flex min-w-0 items-center gap-3 sm:w-[148px] sm:shrink-0">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-pine-50">
                          {f.airlineLogo ? (
                            <Image
                              src={f.airlineLogo}
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
                          <p className="flex items-center gap-2 truncate text-sm font-semibold text-ink">
                            {f.airline}
                            {f.source === "amadeus" || f.source === "duffel" ? (
                              <span className="rounded-sm bg-pine-500 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-paper">
                                Live
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs text-ink-500">{f.flightNumber}</p>
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 sm:justify-start sm:gap-5">
                        <div className="shrink-0">
                          <p className="text-base font-semibold tabular-nums text-ink sm:text-lg">
                            {formatTime(f.departTime)}
                          </p>
                          <p className="text-[13px] text-ink-500">{f.from}</p>
                        </div>
                        <div className="flex min-w-[4.5rem] flex-col items-center shrink-0 sm:min-w-[5.5rem]">
                          <p className="text-[13px] tabular-nums text-ink-500">
                            {formatDuration(f.durationMins)}
                          </p>
                          <div className="my-1 h-px w-full bg-line" />
                          <p
                            className={cn(
                              "text-[13px]",
                              f.stops === 0 ? "font-medium text-success" : "text-ink-500"
                            )}
                          >
                            {f.stops === 0
                              ? t("common.direct")
                              : `${f.stops} stop${f.stops > 1 ? "s" : ""}`}
                          </p>
                        </div>
                        <div className="shrink-0 text-right sm:text-left">
                          <p className="text-base font-semibold tabular-nums text-ink-900 sm:text-lg">
                            {formatTime(f.arriveTime)}
                          </p>
                          <p className="text-[13px] text-ink-500">{f.to}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:pt-0 lg:w-[13.5rem] lg:flex-col lg:items-stretch lg:justify-center">
                      <div className="min-w-0 sm:text-left lg:text-right">
                        <p className="text-xl font-bold tabular-nums leading-tight text-ink-900 sm:text-[1.35rem]">
                          {Number.isFinite(fare) ? <DisplayPrice amount={fare} /> : "—"}
                        </p>
                        <p className="mt-0.5 text-xs capitalize text-ink-500">{cabin}</p>
                      </div>
                      <div className="flex w-full flex-col gap-2">
                        <Button asChild className="w-full shrink-0">
                          <Link
                            href={`/flights/book?flightId=${encodeURIComponent(f._id)}&cabin=${cabin}&adults=1&children=0`}
                          >
                            Book &amp; pay
                          </Link>
                        </Button>
                        <Link
                          href={`/contact?subject=${encodeURIComponent(`Flight advice: ${f.flightNumber} ${f.from}-${f.to}`)}&message=${encodeURIComponent(`I need help with this flight.\nFlight: ${f.flightNumber}\nRoute: ${f.from} → ${f.to}\nCabin: ${cabin}\n`)}`}
                          className="text-center text-xs font-medium text-ink-500 hover:text-pine-600"
                        >
                          Ask an expert
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <Button
          type="button"
          variant="secondary"
          className="w-full min-h-11"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={1.5} />
          {t("common.filters")}
          {activeFilters > 0 ? (
            <span className="ml-1 rounded-full bg-pine-500 px-2 py-0.5 text-xs text-paper tabular-nums">
              {activeFilters}
            </span>
          ) : null}
        </Button>
      </div>
    </div>
  );
}

export function FlightResults({ flights }: { flights: FlightResult[] }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1280px] px-4 py-8 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <FlightRowSkeleton key={i} />
          ))}
        </div>
      }
    >
      <FlightResultsInner flights={flights} />
    </Suspense>
  );
}
