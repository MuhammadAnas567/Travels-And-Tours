import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeHero } from "@/components/home/home-hero";
import { DestinationJourney } from "@/components/home/destination-journey";
import { HowItWorks } from "@/components/home/how-it-works";
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel";
import { HotelCard } from "@/components/cards/hotel-card";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { getTrendingDestinations, getPopularHotels, getDealOfWeek } from "@/lib/data/home";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";
import { ChevronRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "UEB3 Travel — Flights, Hotels & Packages Worldwide",
  description:
    "Compare and book flights, hotels, and vacation packages worldwide. Best price guarantee, free cancellation on most stays, and 24/7 support.",
  openGraph: {
    title: "UEB3 Travel — Book the trip. Keep the price honest.",
    description:
      "Flights, hotels, and packages in one search. Real prices, free cancellation on most stays.",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Travellers on a mountain road at sunset",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UEB3 Travel",
    description: "Book flights, hotels, and packages worldwide.",
  },
};

export default async function HomePage() {
  const [destinations, hotels, deal] = await Promise.all([
    getTrendingDestinations(8),
    getPopularHotels(6),
    getDealOfWeek(),
  ]);

  const journeyStops = destinations.map((d) => ({
    id: String(d._id),
    name: d.name,
    country: d.country,
    image: d.image,
    priceFrom: d.priceFrom,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "UEB3 Travel",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    description:
      "Book flights, hotels, and vacation packages worldwide with best price guarantee and 24/7 support.",
    areaServed: "Worldwide",
    priceRange: "$$",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeHero />

      {/* Signature: Destination Journey Rail */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary-500">
              Destination journey
            </p>
            <h2 className="mt-2 text-h2 font-heading font-bold text-ink-900">
              Trace a route. Pick a stop. Book the stay.
            </h2>
            <p className="mt-2 text-ink-500">
              Our signature way to browse — follow the path across trending cities, then open hotels for the stop you want.
            </p>
          </div>
          <DestinationJourney destinations={journeyStops} />
        </div>
      </section>

      {/* Deal of the week */}
      {deal && (
        <section className="relative overflow-hidden border-y border-accent-500/25 bg-accent-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-lg bg-accent-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-ink-900">
                Best seller · Deal of the week
              </p>
              <h2 className="mt-3 font-heading text-2xl md:text-3xl font-bold text-ink-900">
                {deal.name}
              </h2>
              <p className="mt-2 text-ink-600">
                {deal.city}, {deal.country} — from{" "}
                <strong className="text-ink-900">${deal.pricePerNight}</strong> / night
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="bg-ink-900 hover:bg-ink-700 text-white font-bold rounded-xl h-12 px-8"
                >
                  <Link href={`/hotels/${deal.slug}`}>Save this stay</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl h-12 px-6 border-ink-900/20">
                  <Link href="/deals">See all deals</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-card">
              <Image
                src={deal.images[0]}
                alt={deal.name}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 40vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
              />
              <Link
                href={`/login?callbackUrl=/dashboard/wishlist`}
                className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-card hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label={`Save ${deal.name} to wishlist`}
              >
                <Heart className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center max-w-xl mx-auto">
            <h2 className="text-h2 font-heading font-bold text-ink-900">From search to wheels up</h2>
            <p className="mt-2 text-ink-500">Four steps. No mystery fees in the middle.</p>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* Featured stays */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-h2 font-heading font-bold text-ink-900">Featured stays</h2>
              <p className="mt-1 text-ink-500">Top-rated hotels travellers book again</p>
            </div>
            <Link
              href="/hotels"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
            >
              View all hotels <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.length > 0 ? (
              hotels.map((h) => (
                <HotelCard
                  key={String(h._id)}
                  slug={h.slug}
                  name={h.name}
                  city={h.city}
                  country={h.country}
                  image={h.images[0]}
                  starRating={h.starRating}
                  avgRating={h.avgRating}
                  reviewCount={h.reviewCount}
                  pricePerNight={h.pricePerNight}
                  amenities={h.amenities}
                />
              ))
            ) : (
              <p className="col-span-full text-ink-500">
                No hotels match right now — try clearing filters or run{" "}
                <code className="bg-primary-100 px-2 py-0.5 rounded">npm run seed</code>.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-heading font-bold text-ink-900 text-center">
            What travellers say
          </h2>
          <p className="mt-2 text-center text-ink-500 mb-10">
            Real trips. Short quotes. No filler.
          </p>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-primary-900 px-6 py-12 sm:px-12 text-center text-white">
            <h2 className="font-heading text-2xl md:text-3xl font-bold">
              Get fare drops before they sell out
            </h2>
            <p className="mt-2 text-white/65 max-w-md mx-auto">
              One email a week — destination deals, not spam. Unsubscribe anytime.
            </p>
            <div className="mt-6 max-w-md mx-auto">
              <NewsletterForm dark />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
