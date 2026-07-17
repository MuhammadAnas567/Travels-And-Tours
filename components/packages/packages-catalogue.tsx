"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TourCard } from "@/components/shared/tour-card";
import { EmptyCatalog } from "@/components/layout/catalog-hero";
import { Skeleton } from "@/components/ui/skeleton";
import type { FallbackTour } from "@/lib/data/tour-fallback";

function PackagesCatalogueInner({ tours }: { tours: FallbackTour[] }) {
  const params = useSearchParams();
  const destination = (
    params.get("destination") ??
    params.get("q") ??
    params.get("to") ??
    params.get("city") ??
    ""
  )
    .trim()
    .toLowerCase();

  const filtered = useMemo(() => {
    if (!destination) return tours;
    const slugHint = destination.replace(/\s+/g, "-");
    return tours.filter(
      (t) =>
        t.location.toLowerCase().includes(destination) ||
        t.country.toLowerCase().includes(destination) ||
        t.title.toLowerCase().includes(destination) ||
        t.slug.toLowerCase().includes(slugHint) ||
        t.category.toLowerCase().includes(destination)
    );
  }, [tours, destination]);

  if (filtered.length === 0) {
    return (
      <EmptyCatalog
        title="No packages match this destination"
        description={
          destination
            ? `Nothing for “${destination}”. Browse all packages or explore tours.`
            : "Browse all packages or explore our tour catalogue."
        }
      >
        <Link
          href="/packages"
          className="text-sm font-semibold text-pine-500 link-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
        >
          Clear filters
        </Link>
        <Link
          href="/tours"
          className="text-sm font-semibold text-pine-500 link-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
        >
          View tours
        </Link>
      </EmptyCatalog>
    );
  }

  return (
    <div>
      {destination ? (
        <p className="mb-4 text-sm text-ink-500" aria-live="polite">
          Showing {filtered.length} package{filtered.length === 1 ? "" : "s"} for “{destination}”
        </p>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </div>
  );
}

export function PackagesCatalogue({ tours }: { tours: FallbackTour[] }) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-md" />}>
      <PackagesCatalogueInner tours={tours} />
    </Suspense>
  );
}
