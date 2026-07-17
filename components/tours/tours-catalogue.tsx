"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TourCard } from "@/components/shared/tour-card";
import { FilterSidebar } from "@/components/shared/filter-sidebar";
import { EmptyCatalog } from "@/components/layout/catalog-hero";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { FallbackTour } from "@/lib/data/tour-fallback";

type Props = {
  tours: FallbackTour[];
  countries: string[];
};

function ToursCatalogueInner({ tours, countries }: Props) {
  const params = useSearchParams();
  const q = (params.get("q") ?? params.get("destination") ?? params.get("to") ?? "")
    .trim()
    .toLowerCase();
  const category = params.get("category") ?? "";
  const country = params.get("country") ?? "";
  const sort = params.get("sort") ?? "popular";

  const filtered = useMemo(() => {
    let list = [...tours];
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.country.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q.replace(/\s+/g, "-")) ||
          t.category.toLowerCase().includes(q)
      );
    }
    if (category) list = list.filter((t) => t.category === category);
    if (country) list = list.filter((t) => t.country.toLowerCase() === country.toLowerCase());
    if (sort === "price_asc") list.sort((a, b) => Number(a.discountPrice ?? a.price) - Number(b.discountPrice ?? b.price));
    if (sort === "price_desc") list.sort((a, b) => Number(b.discountPrice ?? b.price) - Number(a.discountPrice ?? a.price));
    if (sort === "rating") list.sort((a, b) => b.avgRating - a.avgRating);
    return list;
  }, [tours, q, category, country, sort]);

  return (
    <div className="grid gap-6 sm:gap-8 lg:grid-cols-4">
      <div className="order-2 lg:order-1">
        <FilterSidebar countries={countries} />
      </div>
      <div className="order-1 lg:order-2 lg:col-span-3">
        {filtered.length === 0 ? (
          <EmptyCatalog
            title="No tours match your filters"
            description="Try adjusting your search or browse all destinations."
          >
            <Button variant="accent" asChild>
              <Link href="/tours">View all tours</Link>
            </Button>
          </EmptyCatalog>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-2">
            {filtered.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ToursCatalogue(props: Props) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-md" />}>
      <ToursCatalogueInner {...props} />
    </Suspense>
  );
}
