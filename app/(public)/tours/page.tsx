import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import type { TourCategory } from "@prisma/client";
import { getTours, getTourCountries } from "@/lib/tours";
import { TourCard } from "@/components/shared/tour-card";
import { FilterSidebar } from "@/components/shared/filter-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { getPreferredCurrency } from "@/lib/locale";
import { getFxRates } from "@/lib/currency";
import Link from "next/link";

export const metadata: Metadata = {
  title: "International Tour Packages",
  description: "Browse curated international tour packages — luxury, adventure, safari, beach and cultural experiences worldwide.",
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

  return (
    <>
      {/* Hero banner */}
      <div className="relative bg-midnight py-20 md:py-28 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80"
          alt="International destinations"
          fill
          className="object-cover opacity-30"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 image-overlay-hero" />
        <Container className="relative">
          <p className="text-caption text-gold">Worldwide Collection</p>
          <h1 className="mt-2 font-display text-h2 text-pearl">International Tour Packages</h1>
          <p className="mt-3 max-w-lg text-cream/65">
            {total} curated experience{total !== 1 ? "s" : ""} across the globe
            {params.q && ` matching "${params.q}"`}
          </p>
        </Container>
      </div>

      <Container className="py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-[var(--radius-lg)]" />}>
            <FilterSidebar countries={countries} />
          </Suspense>

          <div className="lg:col-span-3">
            {tours.length === 0 ? (
              <div className="card-luxury p-16 text-center">
                <p className="font-display text-2xl text-ink">No tours match your filters</p>
                <p className="mt-2 text-muted">Try adjusting your search or browse all destinations.</p>
                <Button variant="accent" asChild className="mt-6">
                  <Link href="/tours">View all tours</Link>
                </Button>
              </div>
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
