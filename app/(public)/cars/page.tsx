import type { Metadata } from "next";
import Link from "next/link";
import { Car, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchWidget } from "@/components/search/search-widget";
import { CatalogHero, EmptyCatalog } from "@/components/layout/catalog-hero";
import { DisplayPrice } from "@/components/shared/display-price";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Car Hire",
  description: "Book airport and city car hire with secure Stripe checkout.",
};

type Props = {
  searchParams: Promise<{
    location?: string;
    from?: string;
    to?: string;
    pickup?: string;
    return?: string;
  }>;
};

const FALLBACK_CARS = [
  {
    id: "fallback-economy",
    slug: "economy-hatchback",
    name: "Economy hatchback",
    category: "Economy",
    seats: 4,
    bags: 2,
    transmission: "Automatic",
    pricePerDay: 28,
    locations: ["DXB Airport", "Dubai", "Islamabad", "Lahore"],
    image: null as string | null,
  },
  {
    id: "fallback-suv",
    slug: "compact-suv",
    name: "Compact SUV",
    category: "SUV",
    seats: 5,
    bags: 3,
    transmission: "Automatic",
    pricePerDay: 45,
    locations: ["DXB Airport", "Dubai", "Karachi"],
    image: null,
  },
  {
    id: "fallback-sedan",
    slug: "full-size-sedan",
    name: "Full-size sedan",
    category: "Sedan",
    seats: 5,
    bags: 4,
    transmission: "Automatic",
    pricePerDay: 52,
    locations: ["LHR Airport", "London", "Islamabad"],
    image: null,
  },
  {
    id: "fallback-mpv",
    slug: "premium-people-carrier",
    name: "Premium people carrier",
    category: "MPV",
    seats: 7,
    bags: 5,
    transmission: "Automatic",
    pricePerDay: 78,
    locations: ["DXB Airport", "Dubai", "Jeddah"],
    image: null,
  },
];

export default async function CarsPage({ searchParams }: Props) {
  const params = await searchParams;
  const location = (
    params.location?.trim() ||
    params.to?.trim() ||
    params.from?.trim() ||
    ""
  );
  const pickup = params.pickup?.trim();
  const ret = params.return?.trim();

  let cars = await prisma.carListing.findMany({
    where: { isActive: true },
    orderBy: { pricePerDay: "asc" },
  });

  if (cars.length === 0) {
    cars = FALLBACK_CARS as typeof cars;
  }

  const list = location
    ? cars.filter((c) =>
        c.locations.some((l) => l.toLowerCase().includes(location.toLowerCase()))
      )
    : cars;

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="cars"
        eyebrow="Car hire"
        title="Airport and city pickups"
        description={
          location
            ? `Pickup near ${location}`
            : "Book now with clear daily rates and optional travel insurance."
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

        {location && list.length > 0 ? (
          <p className="mb-4 text-sm text-ink-500" aria-live="polite">
            Showing {list.length} vehicle{list.length === 1 ? "" : "s"} near “{location}”
            {pickup ? ` · pickup ${pickup}` : ""}
          </p>
        ) : null}

        {list.length === 0 ? (
          <EmptyCatalog
            title="No cars match this location"
            description={`Nothing available near “${location}”. Try Dubai, Karachi, Islamabad, or browse all vehicles.`}
          >
            <Button asChild variant="outline">
              <Link href="/cars">Browse all cars</Link>
            </Button>
          </EmptyCatalog>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((car) => {
              const bookHref = car.id.startsWith("fallback")
                ? `/contact?subject=${encodeURIComponent(`Car hire: ${car.name}`)}`
                : `/cars/book?carId=${car.id}${location ? `&location=${encodeURIComponent(location)}` : ""}${pickup ? `&pickup=${pickup}` : ""}${ret ? `&return=${ret}` : ""}`;
              return (
                <article
                  key={car.id}
                  className="rounded-md border border-line bg-paper p-5 shadow-sm transition-[box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-brand)] hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-pine-100 text-pine-500">
                    <Car className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <h2 className="mt-4 font-display text-lg font-semibold text-ink">{car.name}</h2>
                  <p className="mt-1 text-sm text-ink-500">
                    {car.seats} seats · {car.bags} bags · {car.transmission}
                  </p>
                  <p className="mt-4 text-xl font-semibold tabular-nums text-ink">
                    from <DisplayPrice amount={car.pricePerDay} />
                    <span className="text-sm font-normal text-ink-500"> / day</span>
                  </p>
                  <Button asChild className="mt-4 w-full rounded-md">
                    <Link href={bookHref}>
                      {car.id.startsWith("fallback") ? "Request quote" : "Book & pay"}
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
