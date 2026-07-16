import type { Metadata } from "next";
import Link from "next/link";
import { HotelCard } from "@/components/cards/hotel-card";
import { getCachedHotels } from "@/lib/catalog-cache";
import { SearchWidgetLazy } from "@/components/search/search-widget-lazy";
import { CatalogHero, EmptyCatalog } from "@/components/layout/catalog-hero";

export const dynamic = "force-static";
export const revalidate = 120;

export const metadata: Metadata = {
  title: "Hotels",
  description: "Search and book hotels worldwide with free cancellation on most stays.",
};

export default async function HotelsPage() {
  const hotels = await getCachedHotels();

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="hotels"
        eyebrow="Stays"
        title="Hotels worldwide"
        description={
          hotels.length > 0
            ? `${hotels.length} stays ready to book`
            : "Browse destinations and find your next stay"
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <SearchWidgetLazy />
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
                image={h.images[0] ?? ""}
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
            title="No hotels found"
            description="Try another city or clear your search."
          >
            <Link
              href="/hotels"
              className="text-sm font-semibold text-pine-500 link-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
            >
              Browse all hotels
            </Link>
          </EmptyCatalog>
        )}
      </div>
    </div>
  );
}
