"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HotelCard } from "@/components/cards/hotel-card";
import { EmptyCatalog } from "@/components/layout/catalog-hero";
import { Skeleton } from "@/components/ui/skeleton";

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

function HotelsCatalogueInner({ hotels }: { hotels: HotelCatalogueItem[] }) {
  const params = useSearchParams();
  const city = (params.get("city") ?? "").trim().toLowerCase();
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const tag = (params.get("tag") ?? "").trim().toLowerCase();

  const filtered = useMemo(() => {
    let list = [...hotels];
    if (city) {
      list = list.filter(
        (h) =>
          h.city.toLowerCase().includes(city) ||
          h.country.toLowerCase().includes(city) ||
          h.name.toLowerCase().includes(city)
      );
    }
    if (q) {
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.country.toLowerCase().includes(q)
      );
    }
    if (tag) {
      list = list.filter((h) => (h.tags ?? []).some((t) => t.toLowerCase().includes(tag)));
    }
    return list;
  }, [hotels, city, q, tag]);

  const filterLabel = [city && `city “${city}”`, q && `“${q}”`, tag && `tag “${tag}”`]
    .filter(Boolean)
    .join(", ");

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
      {(city || q || tag) && (
        <p className="mb-4 text-sm text-ink-500" aria-live="polite">
          Showing {filtered.length} stay{filtered.length === 1 ? "" : "s"}
          {filterLabel ? ` for ${filterLabel}` : ""}
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
          />
        ))}
      </div>
    </div>
  );
}

export function HotelsCatalogue({ hotels }: { hotels: HotelCatalogueItem[] }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-md" />}>
      <HotelsCatalogueInner hotels={hotels} />
    </Suspense>
  );
}
