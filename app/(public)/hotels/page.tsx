import type { Metadata } from "next";
import Link from "next/link";
import { HotelCard } from "@/components/cards/hotel-card";
import { listHotels } from "@/lib/data/catalog";
import { SearchWidget } from "@/components/search/search-widget";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hotels",
  description: "Search and book hotels worldwide with free cancellation on most stays.",
};

type Props = {
  searchParams: Promise<{ city?: string; q?: string; tag?: string; guests?: string }>;
};

export default async function HotelsPage({ searchParams }: Props) {
  const params = await searchParams;
  const hotels = await listHotels({
    city: params.city,
    q: params.q,
    tag: params.tag,
  });

  const heading = params.city
    ? `Hotels in ${params.city}`
    : params.tag
      ? `${params.tag} stays`
      : "Hotels worldwide";

  return (
    <div className="bg-surface-alt min-h-[60vh]">
      <div className="bg-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">{heading}</h1>
          <p className="mt-2 text-white/70">
            {hotels.length > 0
              ? `${hotels.length} stays match your search`
              : "Adjust your filters or browse all destinations"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <SearchWidget />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {hotels.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((h) => (
              <HotelCard
                key={String(h._id)}
                slug={h.slug}
                name={h.name}
                city={h.city}
                country={h.country}
                image={h.images[0]}
                starRating={h.starRating}
                avgRating={h.avgRating}
                reviewCount={h.reviewCount}
                pricePerNight={h.pricePerNight}
                amenities={h.amenities}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface p-10 text-center">
            <p className="text-ink-700 font-medium">No hotels match these filters</p>
            <p className="mt-2 text-sm text-ink-500">
              Try a different city, or clear filters to see all stays.
            </p>
            <Link href="/hotels" className="mt-4 inline-block text-sm font-semibold text-primary-500 hover:text-primary-700">
              View all hotels
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
