import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getCachedPackages } from "@/lib/tours-cache";
import { TourCard } from "@/components/shared/tour-card";
import { SearchWidget } from "@/components/search/search-widget";
import { CatalogHero, EmptyCatalog } from "@/components/layout/catalog-hero";

export const dynamic = "force-static";
export const revalidate = 120;

export const metadata: Metadata = {
  title: "Vacation Packages",
  description: "Curated flight + hotel packages and guided tours worldwide.",
};

export default async function PackagesPage() {
  const { tours } = await getCachedPackages();

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="packages"
        eyebrow="Packages"
        title="Vacation packages"
        description="Bundled trips with stays, activities, and expert planning built in."
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <Suspense fallback={<div className="h-[220px] rounded-md bg-paper border border-line animate-pulse" />}>
          <SearchWidget />
        </Suspense>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-20">
        {tours.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <EmptyCatalog
            title="No packages match this destination"
            description="Browse all packages or explore our tour catalogue."
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
        )}
      </div>
    </div>
  );
}
