import { Suspense } from "react";
import type { Metadata } from "next";
import type { TourCategory } from "@prisma/client";
import { getTours, getTourCountries } from "@/lib/tours";
import { TourCard } from "@/components/shared/tour-card";
import { FilterSidebar } from "@/components/shared/filter-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tour Packages",
  description: "Browse and filter our curated collection of tour packages worldwide.",
};

type SearchParams = Promise<{
  q?: string;
  category?: string;
  country?: string;
  minPrice?: string;
  maxPrice?: string;
  audience?: string;
  sort?: string;
  page?: string;
  date?: string;
}>;

export default async function ToursPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { tours, total, pages } = await getTours({
    q: params.q,
    category: params.category as TourCategory | undefined,
    country: params.country,
    audience: params.audience as "OUTBOUND" | "INBOUND" | undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sort: (params.sort as "price_asc") ?? "popular",
    date: params.date,
    page,
  });

  const countries = await getTourCountries();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean-900">Tour Packages</h1>
        <p className="mt-2 text-gray-600">
          {total} tour{total !== 1 ? "s" : ""} available
          {params.q && ` for "${params.q}"`}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <FilterSidebar countries={countries} />
        </Suspense>

        <div className="lg:col-span-3">
          {tours.length === 0 ? (
            <div className="rounded-xl border border-ocean-100 bg-white p-12 text-center">
              <p className="text-lg text-gray-600">No tours match your filters.</p>
              <Button asChild className="mt-4">
                <Link href="/tours">Clear filters</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
                const sp = new URLSearchParams(
                  Object.entries(params).filter(([, v]) => v) as [string, string][]
                );
                sp.set("page", String(p));
                return (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    asChild
                  >
                    <Link href={`/tours?${sp.toString()}`}>{p}</Link>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
