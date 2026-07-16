import type { Metadata } from "next";
import Link from "next/link";
import { DestinationCard } from "@/components/cards/destination-card";
import { listDestinations } from "@/lib/data/catalog";
import { CatalogHero, EmptyCatalog } from "@/components/layout/catalog-hero";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Things to Do",
  description: "Discover destinations, activities, and experiences worldwide.",
};

export default async function ThingsToDoPage() {
  const destinations = await listDestinations(12);

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="tours"
        eyebrow="Experiences"
        title="Things to do"
        description="Start with a destination — then book stays, packages, and guided experiences around it."
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12 pb-16 sm:pb-20">
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
