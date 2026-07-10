import type { Metadata } from "next";
import Link from "next/link";
import { getTours } from "@/lib/tours";
import { TourCard } from "@/components/shared/tour-card";
import { SearchWidget } from "@/components/search/search-widget";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vacation Packages",
  description: "Curated flight + hotel packages and guided tours worldwide.",
};

type Props = {
  searchParams: Promise<{ destination?: string; category?: string }>;
};

export default async function PackagesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { tours } = await getTours({
    q: params.destination,
    limit: 24,
  });

  return (
    <div className="bg-surface-alt min-h-[60vh]">
      <div className="bg-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Vacation packages</h1>
          <p className="mt-2 text-white/70">
            Bundled trips with stays, activities, and expert planning built in.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <SearchWidget />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {tours.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface p-10 text-center">
            <p className="text-ink-700 font-medium">No packages match this destination</p>
            <p className="mt-2 text-sm text-ink-500">Browse all packages or explore our tour catalogue.</p>
            <div className="mt-4 flex justify-center gap-4">
              <Link href="/packages" className="text-sm font-semibold text-primary-500">
                Clear filters
              </Link>
              <Link href="/tours" className="text-sm font-semibold text-primary-500">
                View tours
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
