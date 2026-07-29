import type { Metadata } from "next";
import Link from "next/link";
import { DestinationCard } from "@/components/cards/destination-card";
import { listDestinations } from "@/lib/data/catalog";
import { CatalogHero, EmptyCatalog } from "@/components/layout/catalog-hero";
import { MapboxMap } from "@/components/maps/mapbox-map";
import { resolveCityCoords } from "@/lib/geo/city-coords";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Things to Do",
  description: "Discover destinations, activities, and experiences worldwide.",
};

export default async function ThingsToDoPage() {
  const destinations = await listDestinations(12);

  const mapMarkers = destinations.map((d) => {
    const raw =
      "coordinates" in d && d.coordinates
        ? (d.coordinates as { lat?: number; lng?: number })
        : null;
    const coords =
      raw && typeof raw.lat === "number" && typeof raw.lng === "number"
        ? { lat: raw.lat, lng: raw.lng }
        : resolveCityCoords(d.name);
    return {
      id: String(d._id),
      lat: coords.lat,
      lng: coords.lng,
      label: `${d.name}, ${d.country}`,
    };
  });

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="tours"
        eyebrow="Experiences"
        title="Things to do"
        description="Start with a destination — then book stays, packages, and guided experiences around it."
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-16 sm:pb-20">
        {mapMarkers.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-xl font-semibold text-ink">Explore the map</h2>
            <p className="mt-1 text-sm text-ink-500">
              Pin locations for featured destinations worldwide.
            </p>
            <div className="mt-4">
              <MapboxMap markers={mapMarkers} height={360} zoom={2} />
            </div>
          </section>
        )}

        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {destinations.map((d) => (
              <DestinationCard
                key={String(d._id)}
                name={d.name}
                country={d.country}
                image={d.image}
                priceFrom={d.priceFrom}
                href={`/hotels?city=${encodeURIComponent(d.name)}`}
              />
            ))}
          </div>
        ) : (
          <EmptyCatalog
            title="Destinations are loading"
            description="If this stays empty, run the seed script to load destinations."
          />
        )}

        <div className="mt-12 rounded-md border border-line bg-paper p-8 md:p-10">
          <h2 className="font-display text-xl font-semibold text-ink">Prefer a guided trip?</h2>
          <p className="mt-2 max-w-md text-ink-500 leading-relaxed">
            Browse curated vacation packages with activities included.
          </p>
          <Link
            href="/packages"
            className="mt-4 inline-block text-sm font-semibold text-pine-500 link-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
          >
            View packages
          </Link>
        </div>
      </div>
    </div>
  );
}
