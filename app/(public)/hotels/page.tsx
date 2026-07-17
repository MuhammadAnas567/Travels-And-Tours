import type { Metadata } from "next";
import { getCachedHotels } from "@/lib/catalog-cache";
import { SearchWidgetLazy } from "@/components/search/search-widget-lazy";
import { CatalogHero } from "@/components/layout/catalog-hero";
import { HotelsCatalogueLazy } from "@/components/hotels/hotels-catalogue-lazy";

export const dynamic = "force-dynamic";
export const revalidate = 60;

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
        <HotelsCatalogueLazy hotels={hotels} />
      </div>
    </div>
  );
}
