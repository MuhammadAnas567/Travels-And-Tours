"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HotelCard } from "@/components/cards/hotel-card";
import { EmptyCatalog } from "@/components/layout/catalog-hero";
import { Skeleton } from "@/components/ui/skeleton";
import { matchesPlace } from "@/lib/airports";

export type HotelCatalogueItem = {
  _id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  starRating: number;
  images: string[];
  avgRating: number;
  reviewCount: number;
  pricePerNight: number;
  amenities: string[];
  tags?: string[];
};

function formatStayDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function HotelsCatalogueInner({
  hotels,
  serverFiltered = false,
}: {
  hotels: HotelCatalogueItem[];
  serverFiltered?: boolean;
}) {
  const params = useSearchParams();
  const city = (params.get("city") ?? "").trim().toLowerCase();
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const tag = (params.get("tag") ?? "").trim().toLowerCase();
  const checkIn = (params.get("checkIn") ?? "").trim();
  const checkOut = (params.get("checkOut") ?? "").trim();
  const guestsRaw = params.get("guests") ?? params.get("adults") ?? "";
  const guests = Number(guestsRaw);

  const stayQuery = useMemo(() => {
    const qs = new URLSearchParams();
    if (checkIn) qs.set("checkIn", checkIn);
    if (checkOut) qs.set("checkOut", checkOut);
    if (Number.isFinite(guests) && guests > 0) qs.set("guests", String(guests));
    return qs.toString();
  }, [checkIn, checkOut, guests]);

  const filtered = useMemo(() => {
    // Server already applied city/q/tag — do not re-filter and empty a valid list
    if (serverFiltered) return hotels;

    let list = [...hotels];
    if (city) {
      list = list.filter(
        (h) =>
          matchesPlace(h.city, city) ||
          matchesPlace(h.country, city) ||
          matchesPlace(h.name, city)
      );
    }
    if (q) {
      list = list.filter(
        (h) =>
          matchesPlace(h.name, q) ||
          matchesPlace(h.city, q) ||
          matchesPlace(h.country, q)
      );
    }
    if (tag) {
      list = list.filter(
        (h) =>
          (h.tags ?? []).some((t) => t.toLowerCase().includes(tag)) ||
          (h.amenities ?? []).some((a) => a.toLowerCase().includes(tag)) ||
          matchesPlace(h.city, tag) ||
          matchesPlace(h.name, tag)
      );
    }
    return list;
  }, [hotels, city, q, tag, serverFiltered]);

  const filterLabel = [city && `city “${city}”`, q && `“${q}”`, tag && `tag “${tag}”`]
    .filter(Boolean)
    .join(", ");

  const stayLabel = [
    checkIn && `check-in ${formatStayDate(checkIn)}`,
    checkOut && `check-out ${formatStayDate(checkOut)}`,
    Number.isFinite(guests) && guests > 0 && `${guests} guest${guests === 1 ? "" : "s"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  if (filtered.length === 0) {
    return (
      <EmptyCatalog
        title="No hotels match this search"
        description={
          filterLabel
            ? `Nothing for ${filterLabel}. Try another city (e.g. Dubai) or browse all stays.`
            : "Try another city or clear your search."
        }
      >
        <Link
          href="/hotels"
          className="text-sm font-semibold text-pine-500 link-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
        >
          Browse all hotels
        </Link>
      </EmptyCatalog>
    );
  }

  return (
    <div>
      {(city || q || tag || stayLabel) && (
        <p className="mb-4 text-sm text-ink-500" aria-live="polite">
          Showing {filtered.length} stay{filtered.length === 1 ? "" : "s"}
          {filterLabel ? ` for ${filterLabel}` : ""}
          {stayLabel ? ` · ${stayLabel}` : ""}
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((h) => (
          <HotelCard
            key={String(h._id)}
            id={String(h._id)}
            slug={h.slug}
            name={h.name}
            city={h.city}
            country={h.country}
            image={h.images[0] ?? ""}
            starRating={h.starRating}
            avgRating={h.avgRating}
            reviewCount={h.reviewCount}
            pricePerNight={h.pricePerNight}
            amenities={h.amenities}
            query={stayQuery || undefined}
          />
        ))}
      </div>
    </div>
  );
}

export function HotelsCatalogue({
  hotels,
  serverFiltered = false,
}: {
  hotels: HotelCatalogueItem[];
  serverFiltered?: boolean;
}) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-md" />}>
      <HotelsCatalogueInner hotels={hotels} serverFiltered={serverFiltered} />
    </Suspense>
  );
}
