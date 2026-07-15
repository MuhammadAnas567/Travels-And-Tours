"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plane, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlightRowSkeleton } from "@/components/ui/skeleton";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";
import { cn } from "@/lib/utils";

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
};

type SortKey = "best" | "cheapest" | "fastest";

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function priceOf(f: FlightResult) {
  return f.priceByClass?.economy ?? Number.POSITIVE_INFINITY;
}

export function FlightResults({
  flights,
  from,
  to,
}: {
  flights: FlightResult[];
  from?: string;
  to?: string;
}) {
  const [sort, setSort] = useState<SortKey>("best");
  const [maxStops, setMaxStops] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dimming, setDimming] = useState(false);

  const filtered = useMemo(() => {
    let list = [...flights];
    if (maxStops !== null) list = list.filter((f) => f.stops <= maxStops);
    if (sort === "cheapest") list.sort((a, b) => priceOf(a) - priceOf(b));
    else if (sort === "fastest") list.sort((a, b) => a.durationMins - b.durationMins);
    else
      list.sort(
        (a, b) =>
          priceOf(a) / 100 + a.durationMins / 60 - (priceOf(b) / 100 + b.durationMins / 60)
      );
    return list;
  }, [flights, sort, maxStops]);

  const cheapest = flights.reduce((m, f) => Math.min(m, priceOf(f)), Number.POSITIVE_INFINITY);
  const fastest = flights.reduce((m, f) => Math.min(m, f.durationMins), Number.POSITIVE_INFINITY);
  const best = filtered[0];

  function applyFilter(next: number | null) {
    setDimming(true);
    setMaxStops(next);
    window.setTimeout(() => setDimming(false), 280);
  }

  const activeFilters = maxStops !== null ? 1 : 0;

  const sortTabs: { key: SortKey; label: string; value: string }[] = [
    {
      key: "best",
      label: "Best",
      value: best ? `$${priceOf(best)} · ${formatDuration(best.durationMins)}` : "—",
    },
    {
      key: "cheapest",
      label: "Cheapest",
      value: Number.isFinite(cheapest) ? `$${cheapest} · ${formatDuration(fastest)}` : "—",
    },
    {
      key: "fastest",
      label: "Fastest",
      value: Number.isFinite(fastest) ? `$${cheapest} · ${formatDuration(fastest)}` : "—",
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 lg:px-8 pb-20 sm:pb-24 w-full overflow-x-clip">
      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
        {/* Filter rail */}
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
                  ? flights.length
                  : flights.filter((f) => f.stops <= (opt.value as number)).length;
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
          {/* Sort bar */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 rounded-md border border-line bg-paper p-1">
            {sortTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setSort(t.key)}
                className={cn(
                  "min-h-11 sm:min-h-14 rounded-sm px-1.5 sm:px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500",
                  sort === t.key ? "bg-brass-50 text-pine-700" : "text-ink-700 hover:bg-sand"
                )}
              >
                <span className="block text-xs sm:text-sm font-semibold">{t.label}</span>
                <span className="block text-[10px] sm:text-xs tabular-nums text-ink-500 truncate">{t.value}</span>
              </button>
            ))}
          </div>

          <p className="mt-3 text-sm text-ink-500" aria-live="polite">
            {filtered.length} results · prices include taxes
            {from || to ? ` · ${from ?? "Any"} → ${to ?? "Any"}` : ""}
          </p>

          <div className={cn("mt-4 space-y-3 transition-opacity", dimming && "opacity-50")}>
            {dimming ? (
              Array.from({ length: 6 }).map((_, i) => <FlightRowSkeleton key={i} />)
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="plane"
                title="No flights match these filters"
                description="Widen stops or try nearby dates — ±3 days often unlocks better fares."
                actionLabel="Clear filters"
                onAction={() => applyFilter(null)}
                secondaryLabel="Search ±3 days"
                secondaryHref="/flights"
              />
            ) : (
              filtered.map((f) => (
                <article
                  key={f._id}
                  className="grid grid-cols-1 items-center gap-3 sm:gap-4 rounded-md border border-line bg-paper p-3 sm:p-4 shadow-sm sm:grid-cols-[140px_1fr_120px_140px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
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
                      <p className="text-sm font-semibold text-ink truncate">{f.airline}</p>
                      <p className="text-xs text-ink-500">{f.flightNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 min-w-0 overflow-x-auto">
                    <div className="shrink-0">
                      <p className="text-base sm:text-lg font-semibold tabular-nums text-ink">
                        {formatTime(f.departTime)}
                      </p>
                      <p className="text-[13px] text-ink-500">{f.from}</p>
                    </div>
                    <div className="flex min-w-[72px] sm:min-w-[88px] flex-col items-center shrink-0">
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
                        {f.stops === 0 ? "Direct" : `${f.stops} stop${f.stops > 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold tabular-nums text-ink-900">
                        {formatTime(f.arriveTime)}
                      </p>
                      <p className="text-[13px] text-ink-500">{f.to}</p>
                    </div>
                  </div>

                  <div className="text-right sm:text-left">
                    <p className="text-2xl font-bold tabular-nums text-ink-900">
                      ${Number.isFinite(priceOf(f)) ? priceOf(f) : "—"}
                    </p>
                    <p className="text-xs text-ink-500">total</p>
                  </div>

                  <div className="sm:text-right">
                    <Button asChild className="w-full sm:w-auto">
                      <Link
                        href={`/contact?subject=${encodeURIComponent(`Flight ${f.flightNumber} ${f.from}-${f.to}`)}`}
                      >
                        Select flight
                      </Link>
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile sticky filter/sort */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface p-3 lg:hidden">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={1.5} />
          Filter · Sort
          {activeFilters > 0 ? (
            <span className="ml-1 rounded-full bg-navy-500 px-2 py-0.5 text-xs text-white tabular-nums">
              {activeFilters}
            </span>
          ) : null}
        </Button>
      </div>
    </div>
  );
}
