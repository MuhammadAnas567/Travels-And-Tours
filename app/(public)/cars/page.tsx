import type { Metadata } from "next";
import Link from "next/link";
import { Car, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchWidget } from "@/components/search/search-widget";
import { CatalogHero } from "@/components/layout/catalog-hero";
import { DisplayPrice } from "@/components/shared/display-price";

export const metadata: Metadata = {
  title: "Car Hire",
  description: "Request car hire quotes for airports and city centres worldwide.",
};

type Props = {
  searchParams: Promise<{ location?: string; pickup?: string }>;
};

const featuredCars = [
  { name: "Economy hatchback", seats: 4, bags: 2, from: 28 },
  { name: "Compact SUV", seats: 5, bags: 3, from: 45 },
  { name: "Full-size sedan", seats: 5, bags: 4, from: 52 },
  { name: "Premium people carrier", seats: 7, bags: 5, from: 78 },
];

export default async function CarsPage({ searchParams }: Props) {
  const params = await searchParams;
  const location = params.location?.trim();

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="cars"
        eyebrow="Car hire"
        title="Airport and city pickups"
        description={
          location
            ? `Pickup near ${location}`
            : "Flexible cancellation and inclusive insurance options at major airports."
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <SearchWidget />
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-8 flex flex-wrap gap-4 text-sm text-ink-500">
          <span className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-pine-500" strokeWidth={1.5} /> Inclusive insurance options
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-pine-500" strokeWidth={1.5} /> Meet &amp; greet at major airports
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCars.map((car) => (
            <article
              key={car.name}
              className="rounded-md border border-line bg-paper p-5 shadow-sm transition-[box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-brand)] hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-pine-100 text-pine-500">
                <Car className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-ink">{car.name}</h2>
              <p className="mt-1 text-sm text-ink-500">
                {car.seats} seats · {car.bags} bags
              </p>
              <p className="mt-4 text-xl font-semibold tabular-nums text-ink">
                from <DisplayPrice amount={car.from} />
                <span className="text-sm font-normal text-ink-500"> / day</span>
              </p>
              <Button asChild variant="outline" className="mt-4 w-full rounded-md">
                <Link
                  href={`/contact?subject=${encodeURIComponent(`Car hire: ${car.name}${location ? ` in ${location}` : ""}`)}`}
                >
                  Request quote
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
