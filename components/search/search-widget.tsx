"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Plane,
  Hotel,
  Package,
  Car,
  ArrowLeftRight,
  Calendar,
  Users,
  MapPin,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchRouteLine } from "@/components/search/search-route-line";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/components/providers/preferences-provider";

type Tab = "flights" | "hotels" | "packages" | "cars";
type TripType = "roundtrip" | "oneway";

const tabDefs: { id: Tab; labelKey: string; icon: typeof Plane }[] = [
  { id: "flights", labelKey: "search.flights", icon: Plane },
  { id: "hotels", labelKey: "search.hotels", icon: Hotel },
  { id: "packages", labelKey: "search.packages", icon: Package },
  { id: "cars", labelKey: "search.cars", icon: Car },
];

const RECENT = ["KHI → DXB", "LHE → IST", "ISB → LHR"];

function tabFromPath(pathname: string): Tab {
  if (pathname.startsWith("/hotels")) return "hotels";
  if (pathname.startsWith("/packages")) return "packages";
  if (pathname.startsWith("/cars")) return "cars";
  return "flights";
}

export function SearchWidget({ className }: { className?: string }) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            "rounded-md bg-paper shadow-lg border border-line w-full max-w-full h-[220px] animate-pulse",
            className
          )}
          aria-hidden
        />
      }
    >
      <SearchWidgetInner className={className} />
    </Suspense>
  );
}

function SearchWidgetInner({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = usePreferences();
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<Tab>(() => tabFromPath(pathname));
  const tabs = tabDefs.map((item) => ({ ...item, label: t(item.labelKey) }));
  const searchLabel =
    tab === "flights"
      ? t("search.searchFlights")
      : tab === "hotels"
        ? t("search.searchHotels")
        : tab === "packages"
          ? t("search.searchPackages")
          : t("search.searchCars");
  const [tripType, setTripType] = useState<TripType>("roundtrip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [cabin, setCabin] = useState("Economy");
  const [travellersOpen, setTravellersOpen] = useState(false);
  const [swapSpin, setSwapSpin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ from?: string; to?: string; form?: string }>({});

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    setTab(tabFromPath(pathname));
    const fromQ = searchParams.get("from") ?? "";
    const toQ =
      searchParams.get("to") ??
      searchParams.get("city") ??
      searchParams.get("destination") ??
      searchParams.get("location") ??
      "";
    const dateQ =
      searchParams.get("date") ??
      searchParams.get("checkIn") ??
      searchParams.get("pickup") ??
      "";
    const returnQ = searchParams.get("return") ?? searchParams.get("checkOut") ?? "";
    const adultsQ = Number(searchParams.get("adults") ?? searchParams.get("guests") ?? "");
    const cabinQ = searchParams.get("cabin");

    if (fromQ) setFrom(fromQ);
    if (toQ) setTo(toQ);
    if (dateQ) setCheckIn(dateQ);
    if (returnQ) {
      setCheckOut(returnQ);
      setTripType("roundtrip");
    } else if (searchParams.has("date") && !searchParams.has("return")) {
      setTripType("oneway");
    }
    if (Number.isFinite(adultsQ) && adultsQ > 0) setAdults(Math.min(9, adultsQ));
    if (cabinQ) setCabin(cabinQ);
  }, [pathname, searchParams]);

  const travellersSummary = useMemo(() => {
    const parts = [`${adults} adult${adults === 1 ? "" : "s"}`];
    if (children > 0) parts.push(`${children} child${children === 1 ? "" : "ren"}`);
    parts.push(cabin);
    return parts.join(" · ");
  }, [adults, children, cabin]);

  function validate() {
    const next: typeof errors = {};
    if (tab === "flights" || tab === "cars") {
      if (!from.trim()) next.from = "Enter an origin";
      if (!to.trim()) next.to = "Enter a destination";
      if (from.trim() && to.trim() && from.trim().toLowerCase() === to.trim().toLowerCase()) {
        next.form = "Origin and destination can't match.";
      }
    } else if (!to.trim() && !from.trim()) {
      next.to = "Enter a destination";
    }
    setErrors(next);
    if (next.from) fromRef.current?.focus();
    else if (next.to) toRef.current?.focus();
    return Object.keys(next).length === 0;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const params = new URLSearchParams();

    if (tab === "flights") {
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (checkIn) params.set("date", checkIn);
      if (tripType === "roundtrip" && checkOut) params.set("return", checkOut);
      params.set("adults", String(adults));
      params.set("cabin", cabin);
      router.push(`/flights?${params.toString()}`);
    } else if (tab === "hotels") {
      if (to) params.set("city", to);
      if (from) params.set("q", from);
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      params.set("guests", String(adults + children));
      router.push(`/hotels?${params.toString()}`);
    } else if (tab === "packages") {
      if (to) params.set("destination", to);
      router.push(`/packages?${params.toString()}`);
    } else {
      // Cars: drop-off (`to`) is the primary location; pickup city (`from`) is a fallback.
      if (to) params.set("location", to);
      else if (from) params.set("location", from);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (checkIn) params.set("pickup", checkIn);
      if (checkOut) params.set("return", checkOut);
      router.push(`/cars?${params.toString()}`);
    }
  }

  function swapLocations() {
    setSwapSpin(true);
    setFrom(to);
    setTo(from);
    window.setTimeout(() => setSwapSpin(false), 450);
  }

  const showRoute = tab === "flights" || tab === "cars";
  const toLabel =
    tab === "hotels"
      ? "Destination"
      : tab === "packages"
        ? "Where to?"
        : tab === "cars"
          ? "Drop-off"
          : t("search.to");
  const dateLabel =
    tab === "cars" ? "Pick-up date" : tab === "flights" ? t("search.depart") : "Check-in";

  return (
    <div
      className={cn(
        "rounded-md bg-paper shadow-lg overflow-hidden border border-line w-full max-w-full",
        className
      )}
    >
      <div className="flex border-b border-line overflow-x-auto scrollbar-hide bg-paper-raised" role="tablist" aria-label="Search type">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => {
              setTab(item.id);
              setErrors({});
            }}
            className={cn(
              "flex min-h-11 shrink-0 items-center gap-2 px-4 sm:px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] whitespace-nowrap transition-colors border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pine-500",
              tab === item.id
                ? "border-pine-500 text-pine-500 bg-pine-50"
                : "border-transparent text-ink-500 hover:text-ink-700 hover:bg-sand"
            )}
          >
            <item.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="p-4 sm:p-5 md:p-6" noValidate>
        {tab === "flights" ? (
          <div
            className="mb-4 inline-flex rounded-sm border border-line bg-sand p-1"
            role="group"
            aria-label="Trip type"
          >
            {(
              [
                ["roundtrip", "search.roundtrip"],
                ["oneway", "search.oneway"],
              ] as const
            ).map(([id, labelKey]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTripType(id)}
                className={cn(
                  "min-h-11 rounded-sm px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500",
                  tripType === id ? "bg-paper text-ink shadow-sm" : "text-ink-500 hover:text-ink-700"
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        ) : null}

        {showRoute ? <SearchRouteLine from={from} to={to} /> : null}

        {errors.form ? (
          <p className="mb-3 text-sm text-error" role="alert">
            {errors.form}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-12 md:items-end">
          {(tab === "flights" || tab === "cars") && (
            <div className="md:col-span-3 relative">
              <Input
                ref={fromRef}
                id="search-from"
                label={tab === "cars" ? "Pick-up location" : t("search.from")}
                placeholder={tab === "flights" ? "City or airport (e.g. KHI)" : "Airport or city"}
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setErrors((prev) => ({ ...prev, from: undefined, form: undefined }));
                }}
                error={errors.from}
                prefixIcon={<MapPin strokeWidth={1.5} />}
                className="h-12"
              />
            </div>
          )}

          {tab === "flights" && (
            <div className="flex md:col-span-1 justify-center pb-1">
              <button
                type="button"
                onClick={swapLocations}
                className="flex h-11 w-11 items-center justify-center rounded-sm border border-line bg-paper text-pine-500 hover:bg-pine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
                aria-label="Swap origin and destination"
              >
                <ArrowLeftRight
                  className={cn("h-5 w-5 transition-transform duration-[var(--duration-slow)] ease-[var(--ease-brand)]", swapSpin && "rotate-180")}
                  strokeWidth={1.5}
                />
              </button>
            </div>
          )}

          <div className={cn("md:col-span-3", tab === "hotels" && "md:col-span-4", tab === "packages" && "md:col-span-5")}>
            <Input
              ref={toRef}
              id="search-to"
              label={toLabel}
              placeholder={tab === "hotels" ? "City, hotel, or landmark" : "City or airport (e.g. DXB)"}
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setErrors((prev) => ({ ...prev, to: undefined, form: undefined }));
              }}
              error={errors.to}
              prefixIcon={<MapPin strokeWidth={1.5} />}
              className="h-12"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              id="search-checkin"
              type="date"
              label={dateLabel}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              prefixIcon={<Calendar strokeWidth={1.5} />}
              className="h-12"
            />
          </div>

          {(tab === "hotels" || tab === "packages" || (tab === "flights" && tripType === "roundtrip")) && (
            <div className="md:col-span-2">
              <Input
                id="search-checkout"
                type="date"
                label={tab === "flights" ? "Return" : "Check-out"}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                prefixIcon={<Calendar strokeWidth={1.5} />}
                className="h-12"
              />
            </div>
          )}

          {(tab === "flights" || tab === "hotels" || tab === "packages") && (
            <div className="md:col-span-2 relative">
              <button
                type="button"
                onClick={() => setTravellersOpen((o) => !o)}
                className="flex h-12 w-full items-center gap-2 rounded-sm border border-line bg-paper px-3 text-left text-sm hover:border-taupe-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
                aria-expanded={travellersOpen}
              >
                <Users className="h-5 w-5 text-ink-500" strokeWidth={1.5} aria-hidden />
                <span className="truncate text-ink">{travellersSummary}</span>
              </button>
              {travellersOpen ? (
                <div className="absolute z-[110] mt-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-72 w-full max-w-[min(100vw-2rem,18rem)] rounded-md border border-line bg-paper p-4 shadow-lg">
                  <Stepper label="Adults" value={adults} min={1} max={9} onChange={setAdults} />
                  <Stepper label="Children" value={children} min={0} max={8} onChange={setChildren} />
                  {tab === "flights" ? (
                    <div className="mt-3">
                      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500">Cabin</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {["Economy", "Business", "First"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCabin(c)}
                            className={cn(
                              "min-h-11 rounded-sm px-3 text-sm font-medium border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500",
                              cabin === c ? "border-pine-500 bg-pine-50 text-pine-700" : "border-line text-ink-700"
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <Button type="button" variant="secondary" className="mt-4 w-full" onClick={() => setTravellersOpen(false)}>
                    Done
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          <div className="md:col-span-2">
            <Button type="submit" loading={loading} size="lg" className="w-full h-12 md:h-14">
              <Search className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              {loading ? "…" : searchLabel}
            </Button>
          </div>
        </div>

        {tab === "flights" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 self-center">
              {t("search.recent")}
            </span>
            {RECENT.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  const [a, b] = chip.split("→").map((s) => s.trim());
                  setFrom(a);
                  setTo(b);
                }}
                className="min-h-11 rounded-sm border border-line px-3 text-sm text-ink-700 hover:bg-pine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
              >
                {chip}
              </button>
            ))}
          </div>
        ) : null}
      </form>
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-ink-900">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-11 w-11 items-center justify-center rounded-sm border border-line disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-6 text-center tabular-nums text-ink">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-11 w-11 items-center justify-center rounded-sm border border-line disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
