import { Suspense } from "react";
import type { Metadata } from "next";
import type { TourCategory } from "@prisma/client";
import { getTours, getTourCountries } from "@/lib/tours";
import { TourCard } from "@/components/shared/tour-card";
import { FilterSidebar } from "@/components/shared/filter-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { CatalogHero, EmptyCatalog } from "@/components/layout/catalog-hero";
import { getPreferredCurrency } from "@/lib/locale";
import { getFxRates } from "@/lib/currency";
import Link from "next/link";

export const metadata: Metadata = {
  title: "International Tour Packages",
  description:
    "Browse curated international tour packages — luxury, adventure, safari, beach and cultural experiences worldwide.",
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

  const [{ tours, total, pages }, countries, currency, rates] = await Promise.all([
    getTours({
      q: params.q,
      category: params.category as TourCategory | undefined,
      country: params.country,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      sort: (params.sort as "price_asc") ?? "popular",
      date: params.date,
      page,
    }),
    getTourCountries(),
    getPreferredCurrency(),
    getFxRates(),
  ]);

  const description = `${total} curated experience${total !== 1 ? "s" : ""} across the globe${
    params.q ? ` matching “${params.q}”` : ""
  }`;

  return (
    <>
      <CatalogHero
        eyebrow="Worldwide Collection"
        title="International Tour Packages"
        description={description}
      />

      <Container className="py-10 sm:py-12 md:py-16">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-4">
          <div className="order-2 lg:order-1">
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-md" />}>
              <FilterSidebar countries={countries} />
            </Suspense>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-3">
            {tours.length === 0 ? (
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
                {tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} currency={currency} rates={rates} />
                ))}
              </div>
            )}

            {pages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
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
      </Container>
    </>
  );
}
