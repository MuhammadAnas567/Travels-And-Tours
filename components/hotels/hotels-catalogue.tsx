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
  const sort = (params.get("sort") ?? "rating").trim().toLowerCase();
  const minPrice = Number(params.get("minPrice") ?? "");
  const maxPrice = Number(params.get("maxPrice") ?? "");

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
          h.country.toLowerCase().includes(q) ||
          (h.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (tag) {
      list = list.filter((h) => (h.tags ?? []).some((t) => t.toLowerCase().includes(tag)));
    }
    if (Number.isFinite(minPrice) && minPrice > 0) {
      list = list.filter((h) => h.pricePerNight >= minPrice);
    }
    if (Number.isFinite(maxPrice) && maxPrice > 0) {
      list = list.filter((h) => h.pricePerNight <= maxPrice);
    }
    if (sort === "price_asc") list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    else if (sort === "price_desc") list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
    return list;
  }, [hotels, city, q, tag, sort, minPrice, maxPrice]);

  const hasFilters = !!(city || q || tag || (Number.isFinite(minPrice) && minPrice > 0) || (Number.isFinite(maxPrice) && maxPrice > 0));
  const filterLabel = [
    city && `city “${city}”`,
    q && `“${q}”`,
    tag && `tag “${tag}”`,
    Number.isFinite(minPrice) && minPrice > 0 && `from $${minPrice}`,
    Number.isFinite(maxPrice) && maxPrice > 0 && `to $${maxPrice}`,
  ]
    .filter(Boolean)
    .join(", ");

  if (filtered.length === 0) {
    return (
      <EmptyCatalog
        title="No hotels match this search"
        description={
          filterLabel
            ? `Nothing for ${filterLabel}. Try another city (e.g. Dubai, Seoul) or browse all stays.`
            : "Try another city or clear your search."
        }
      >
        <Link
          href="/hotels"
          className="text-sm font-semibold text-pine-500 link-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
        >
          Clear filters · Browse all
        </Link>
      </EmptyCatalog>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500" aria-live="polite">
          Showing {filtered.length} stay{filtered.length === 1 ? "" : "s"}
          {filterLabel ? ` for ${filterLabel}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/hotels?sort=price_asc"
            className="rounded-full px-3 py-1.5 text-ink-600 hover:bg-sand-100 font-medium"
          >
            Price ↑
          </Link>
          <Link
            href="/hotels?sort=price_desc"
            className="rounded-full px-3 py-1.5 text-ink-600 hover:bg-sand-100 font-medium"
          >
            Price ↓
          </Link>
          <Link
            href="/hotels?sort=rating"
            className="rounded-full px-3 py-1.5 text-ink-600 hover:bg-sand-100 font-medium"
          >
            Top rated
          </Link>
          {hasFilters ? (
            <Link
              href="/hotels"
              className="rounded-full bg-pine-50 px-3 py-1.5 font-semibold text-pine-700 hover:bg-pine-100"
            >
              Clear filters
            </Link>
          ) : null}
        </div>
      </div>
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
