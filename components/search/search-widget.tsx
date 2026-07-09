"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Hotel, Package, Car, ArrowLeftRight, Calendar, Users, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Tab = "flights" | "hotels" | "packages" | "cars";

const tabs: { id: Tab; label: string; icon: typeof Plane }[] = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
  { id: "packages", label: "Packages", icon: Package },
  { id: "cars", label: "Cars", icon: Car },
];

export function SearchWidget({ className }: { className?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("hotels");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();

    if (tab === "flights") {
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (checkIn) params.set("date", checkIn);
      router.push(`/flights?${params.toString()}`);
    } else if (tab === "hotels") {
      if (to) params.set("city", to);
      if (from) params.set("q", from);
      if (checkIn) params.set("checkIn", checkIn);
      if (checkOut) params.set("checkOut", checkOut);
      if (guests) params.set("guests", guests);
      router.push(`/hotels?${params.toString()}`);
    } else if (tab === "packages") {
      if (to) params.set("destination", to);
      router.push(`/packages?${params.toString()}`);
    } else {
      if (to) params.set("location", to);
      if (checkIn) params.set("pickup", checkIn);
      router.push(`/cars?${params.toString()}`);
    }
  }

  function swapLocations() {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
  }

  return (
    <div className={cn("rounded-2xl bg-surface shadow-float overflow-hidden", className)}>
      <div className="flex border-b border-line overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px",
              tab === t.id
                ? "border-primary-500 text-primary-500 bg-primary-100/50"
                : "border-transparent text-ink-500 hover:text-ink-700 hover:bg-surface-alt"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-12 md:items-end">
          {(tab === "flights" || tab === "cars") && (
            <div className="md:col-span-3">
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                <MapPin className="h-3.5 w-3.5" />
                {tab === "cars" ? "Pick-up location" : "From"}
              </label>
              <Input
                placeholder={tab === "flights" ? "City or airport" : "Airport or city"}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-xl border-line h-12"
              />
            </div>
          )}

          {tab === "flights" && (
            <div className="flex md:col-span-1 justify-center pb-2">
              <button type="button" onClick={swapLocations} className="p-2 rounded-full hover:bg-primary-100 text-primary-500" aria-label="Swap">
                <ArrowLeftRight className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className={cn("md:col-span-3", tab === "hotels" && "md:col-span-4", tab === "packages" && "md:col-span-5")}>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <MapPin className="h-3.5 w-3.5" />
              {tab === "hotels" ? "Destination" : tab === "packages" ? "Where to?" : tab === "cars" ? "Drop-off" : "To"}
            </label>
            <Input
              placeholder={tab === "hotels" ? "City, hotel, or landmark" : "City or airport"}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border-line h-12"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <Calendar className="h-3.5 w-3.5" />
              {tab === "cars" ? "Pick-up date" : tab === "flights" ? "Depart" : "Check-in"}
            </label>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="rounded-xl border-line h-12"
            />
          </div>

          {(tab === "hotels" || tab === "packages") && (
            <div className="md:col-span-2">
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                <Calendar className="h-3.5 w-3.5" /> Check-out
              </label>
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="rounded-xl border-line h-12"
              />
            </div>
          )}

          {(tab === "hotels" || tab === "packages") && (
            <div className="md:col-span-2">
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-ink-500">
                <Users className="h-3.5 w-3.5" /> Guests
              </label>
              <Input
                type="number"
                min={1}
                max={12}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="rounded-xl border-line h-12"
              />
            </div>
          )}

          <div className={cn("md:col-span-2", tab === "flights" && "md:col-span-2")}>
            <Button type="submit" className="w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-700 text-white font-semibold text-base">
              <Search className="h-5 w-5" />
              Search
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
