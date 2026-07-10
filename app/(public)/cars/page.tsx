import type { Metadata } from "next";
import Link from "next/link";
import { Car, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchWidget } from "@/components/search/search-widget";

export const metadata: Metadata = {
  title: "Car Hire",
  description: "Request car hire quotes for airports and city centres worldwide.",
};

type Props = {
  searchParams: Promise<{ location?: string; pickup?: string }>;
};

const sampleCars = [
  { name: "Economy hatchback", seats: 4, bags: 2, from: 28 },
  { name: "Compact SUV", seats: 5, bags: 3, from: 45 },
  { name: "Full-size sedan", seats: 5, bags: 4, from: 52 },
  { name: "Premium people carrier", seats: 7, bags: 5, from: 78 },
];

export default async function CarsPage({ searchParams }: Props) {
  const params = await searchParams;
  const location = params.location?.trim();

  return (
    <div className="bg-surface-alt min-h-[60vh]">
      <div className="bg-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Car hire</h1>
          <p className="mt-2 text-white/70">
            {location
              ? `Pickup near ${location}`
              : "Airport and city pickups with flexible cancellation"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <SearchWidget />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-8 flex flex-wrap gap-4 text-sm text-ink-600">
          <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary-500" /> Inclusive insurance options</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary-500" /> Meet &amp; greet at major airports</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sampleCars.map((car) => (
            <article key={car.name} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-500">
                <Car className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-heading font-bold text-ink-900">{car.name}</h2>
              <p className="mt-1 text-sm text-ink-500">
                {car.seats} seats · {car.bags} bags
              </p>
              <p className="mt-4 text-xl font-bold text-ink-900">
                from ${car.from}
                <span className="text-sm font-normal text-ink-500"> / day</span>
              </p>
              <Button asChild variant="outline" className="mt-4 w-full rounded-xl">
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
