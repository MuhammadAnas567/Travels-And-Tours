import type { Metadata } from "next";
import Link from "next/link";
import { HotelCard } from "@/components/cards/hotel-card";
import { listHotels } from "@/lib/data/catalog";
import { SearchWidget } from "@/components/search/search-widget";
import { CatalogHero, EmptyCatalog } from "@/components/layout/catalog-hero";

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
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="hotels"
        eyebrow="Stays"
        title={heading}
        description={
          hotels.length > 0
            ? `${hotels.length} stays match your search`
            : "Adjust your filters or browse all destinations"
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <SearchWidget />
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-20">
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
          <EmptyCatalog
            title="No hotels match these filters"
            description="Try a different city, or clear filters to see all stays."
          >
            <Link
              href="/hotels"
              className="text-sm font-semibold text-pine-500 link-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
            >
              View all hotels
            </Link>
          </EmptyCatalog>
        )}
      </div>
    </div>
  );
}
