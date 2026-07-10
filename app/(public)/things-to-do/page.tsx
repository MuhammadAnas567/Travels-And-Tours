import type { Metadata } from "next";
import { DestinationCard } from "@/components/cards/destination-card";
import { listDestinations } from "@/lib/data/catalog";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Things to Do",
  description: "Discover destinations, activities, and experiences worldwide.",
};

export default async function ThingsToDoPage() {
  const destinations = await listDestinations(12);

  return (
    <div className="bg-surface-alt min-h-[60vh]">
      <div className="bg-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Things to do</h1>
          <p className="mt-2 text-white/70 max-w-xl">
            Start with a destination — then book stays, packages, and guided experiences around it.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {destinations.length > 0 ? (
          <div className="flex flex-wrap gap-5 justify-center sm:justify-start">
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
          <div className="rounded-2xl border border-line bg-surface p-10 text-center">
            <p className="text-ink-700 font-medium">Destinations are loading</p>
            <p className="mt-2 text-sm text-ink-500">
              If this stays empty, run the seed script to load sample destinations.
            </p>
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-line bg-surface p-8 text-center">
          <h2 className="font-heading text-xl font-bold text-ink-900">Prefer a guided trip?</h2>
          <p className="mt-2 text-ink-500">Browse curated vacation packages with activities included.</p>
          <Link href="/packages" className="mt-4 inline-block text-sm font-semibold text-primary-500 hover:text-primary-700">
            View packages
          </Link>
        </div>
      </div>
    </div>
  );
}
