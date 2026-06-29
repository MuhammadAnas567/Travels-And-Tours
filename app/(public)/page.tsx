import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/shared/search-bar";
import { TourCard } from "@/components/shared/tour-card";
import { Button } from "@/components/ui/button";
import { getFeaturedTours, getPopularDestinations } from "@/lib/tours";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";

export default async function HomePage() {
  const [featuredTours, destinations] = await Promise.all([
    getFeaturedTours(6),
    getPopularDestinations(),
  ]);

  const testimonials = [
    {
      name: "Sarah Mitchell",
      location: "New York, USA",
      text: "The Bali retreat exceeded all expectations. Every detail was perfectly planned!",
      rating: 5,
    },
    {
      name: "James Chen",
      location: "Singapore",
      text: "Kenya safari was a life-changing experience. Our guide was incredible.",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      location: "Barcelona, Spain",
      text: "Booking was seamless and the Paris getaway was pure magic. Highly recommend!",
      rating: 5,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920"
          alt="Beautiful travel destination"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-950/80 via-ocean-900/60 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Discover Your Next{" "}
              <span className="text-coral-400">Adventure</span>
            </h1>
            <p className="mt-4 text-lg text-ocean-100">
              Curated tour packages to the world&apos;s most breathtaking
              destinations. Book with confidence, travel with wonder.
            </p>
          </div>
          <div className="mt-8 max-w-4xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-ocean-900">Featured Tours</h2>
            <p className="mt-2 text-gray-600">
              Hand-picked experiences loved by travelers worldwide
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link href="/tours">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Button asChild>
            <Link href="/tours">View all tours</Link>
          </Button>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="bg-ocean-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-ocean-900">
            Popular Destinations
          </h2>
          <p className="mt-2 text-gray-600">
            Explore our most sought-after locations
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest) => (
              <Link
                key={`${dest.country}-${dest.location}`}
                href={`/tours?country=${encodeURIComponent(dest.country)}`}
                className="group flex items-center gap-4 rounded-xl border border-ocean-100 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ocean-100 text-ocean-600">
                  <MapPin className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-ocean-900 group-hover:text-ocean-700">
                    {dest.location}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {dest.country} · {dest._count.id} tours
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-ocean-900">
          What Travelers Say
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="rounded-xl border border-ocean-100 bg-white p-6 shadow-sm"
            >
              <div className="flex gap-1">
                {Array.from({ length: t.rating }, (_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    aria-hidden
                  />
                ))}
              </div>
              <p className="mt-3 text-gray-600">&ldquo;{t.text}&rdquo;</p>
              <footer className="mt-4">
                <cite className="not-italic">
                  <span className="font-semibold text-ocean-900">{t.name}</span>
                  <span className="block text-sm text-gray-500">
                    {t.location}
                  </span>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-ocean-800 py-16">
        <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white">
            Get travel inspiration in your inbox
          </h2>
          <p className="mt-2 text-ocean-200">
            Subscribe for exclusive deals and destination guides.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
