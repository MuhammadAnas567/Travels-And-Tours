"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DisplayPrice } from "@/components/shared/display-price";
import type { HotelAvailabilityOffer } from "@/lib/providers/hotels/types";

type Props = {
  hotelId: string;
  city: string;
  hotelName: string;
};

export function AvailabilityPanel({ hotelId, city, hotelName }: Props) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string>("");
  const [offers, setOffers] = useState<HotelAvailabilityOffer[]>([]);
  const [error, setError] = useState("");

  async function load() {
    if (!checkIn || !checkOut) {
      setError("Select check-in and check-out");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setError("Check-out must be after check-in");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        city,
        checkIn,
        checkOut,
        adults: String(adults),
        hotelName,
      });
      const res = await fetch(`/api/hotels/availability?${qs}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load availability");
        setOffers([]);
      } else {
        setOffers(data.offers ?? []);
        setProvider(data.provider ?? "");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-line bg-paper p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-pine-600">Live availability</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink-900">
            Check rooms & rates
          </h3>
        </div>
        {provider ? (
          <span className="rounded-sm bg-sand-200 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ink-600">
            {provider === "hotelbeds" ? "Hotelbeds" : "Sandbox rates"}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="av-in">Check-in</Label>
          <Input
            id="av-in"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="av-out">Check-out</Label>
          <Input
            id="av-out"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="av-adults">Adults</Label>
          <Input
            id="av-adults"
            type="number"
            min={1}
            max={8}
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>

      <Button type="button" className="mt-4" onClick={() => void load()} disabled={loading}>
        {loading ? "Checking…" : "Check availability"}
      </Button>
      {error ? (
        <p className="mt-2 text-sm text-ink-500" role="status">
          {error}
        </p>
      ) : null}

      {offers.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {offers.map((o) => {
            const href = `/hotels/book?hotelId=${encodeURIComponent(hotelId)}&room=${encodeURIComponent(o.roomName)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=0&price=${o.pricePerNight}`;
            return (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-sand/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{o.roomName}</p>
                  <p className="text-sm text-ink-500">
                    {o.board}
                    {o.refundable ? " · Refundable" : " · Non-refundable"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-semibold tabular-nums text-pine-600">
                    <DisplayPrice amount={o.pricePerNight} />
                    <span className="text-xs font-normal text-ink-500"> / night</span>
                  </p>
                  <Button asChild size="sm">
                    <Link href={href}>Book &amp; pay</Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
