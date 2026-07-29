import { CatalogHero } from "@/components/layout/catalog-hero";
import { SearchWidgetLazy } from "@/components/search/search-widget-lazy";
import { FlightRowSkeleton } from "@/components/ui/skeleton";

export default function FlightsLoading() {
  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="flights"
        eyebrow="Flights"
        title="Compare routes and cabin fares"
        description="Loading live fares and price history for your route."
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-6">
        <SearchWidgetLazy />
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-16 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <FlightRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
