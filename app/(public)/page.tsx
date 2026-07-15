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
  title: "UEB3 Travel — Private Journeys & Curated Escapes",
  description:
    "Plan flights, stays, and tailor-made journeys with an editorial eye — honest fares, refined itineraries, and humans on support.",
  openGraph: {
    title: "UEB3 Travel — Arrive somewhere worth remembering",
    description:
      "Flights, hotels, and composed packages in one search. Clear prices. Real destinations.",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Alpine ridge at blue hour",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UEB3 Travel",
    description: "Private journeys and curated escapes worldwide.",
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
      "Book flights, hotels, and vacation packages worldwide with clear pricing and 24/7 support.",
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

      <section className="section-pad">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow">Popular routes</p>
            <h2 className="mt-3 text-h2 text-ink">
              Follow the path. Land on a stay.
            </h2>
            <p className="mt-4 text-ink-500 leading-relaxed">
              Browse trending cities as a journey — then open hotels for the stop you want.
            </p>
          </div>
          <DestinationJourney destinations={journeyStops} />
        </div>
      </section>

      {deal && (
        <section className="relative overflow-hidden border-y border-brass-500/20 bg-pine-500">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-16 md:py-20 grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
            <div>
              <p className="eyebrow text-brass-300">Deal of the week</p>
              <h2 className="mt-4 font-display text-3xl md:text-4xl font-semibold text-paper">
                {deal.name}
              </h2>
              <p className="mt-3 text-paper/70">
                {deal.city}, {deal.country} — from{" "}
                <strong className="text-paper tabular-nums" data-price>
                  ${deal.pricePerNight}
                </strong>{" "}
                / night
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link
                    href={
                      String(deal._id).startsWith("fallback")
                        ? "/hotels"
                        : `/hotels/${deal.slug}`
                    }
                  >
                    Save this stay
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-paper/25 bg-transparent text-paper hover:bg-paper/10 hover:border-brass-400"
                >
                  <Link href="/deals">See all deals</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-md shadow-float group">
              <Image
                src={deal.images[0]}
                alt={deal.name}
                fill
                className="object-cover img-editorial img-cover"
                sizes="(max-width:768px) 100vw, 40vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
              />
              <Link
                href={`/login?callbackUrl=/dashboard/wishlist`}
                className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-sm bg-paper/95 text-ink shadow-sm hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
                aria-label={`Save ${deal.name} to wishlist`}
              >
                <Heart className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section-pad bg-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-h2 text-ink">From search to wheels up</h2>
            <p className="mt-4 text-ink-500">Four steps. No mystery fees in the middle.</p>
          </div>
          <HowItWorks />
        </div>
      </section>

      <section className="section-pad">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Stays</p>
              <h2 className="mt-3 text-h2 text-ink">Featured stays</h2>
              <p className="mt-2 text-ink-500">Hotels travellers book again</p>
            </div>
            <Link
              href="/hotels"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-pine-500 link-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded-sm"
            >
              View all hotels <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.length > 0 ? (
              hotels.map((h) => (
                <HotelCard
                  key={String(h._id)}
                  slug={String(h._id).startsWith("fallback") ? "fallback" : h.slug}
                  name={h.name}
                  city={h.city}
                  country={h.country}
                  image={h.images[0]}
                  starRating={h.starRating}
                  avgRating={h.avgRating}
                  reviewCount={h.reviewCount}
                  pricePerNight={h.pricePerNight}
                  amenities={[...h.amenities]}
                />
              ))
            ) : (
              <p className="col-span-full text-ink-500">
                No hotels match right now — try clearing filters.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="section-pad bg-sand-200/40">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-xl">
            <p className="eyebrow">Travellers</p>
            <h2 className="mt-3 text-h2 text-ink">What travellers say</h2>
            <p className="mt-3 text-ink-500">Real trips. Short quotes. No filler.</p>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      <section className="section-pad">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-ink px-6 py-14 sm:px-14 md:flex md:items-center md:justify-between md:gap-12 md:text-left text-center">
            <div className="max-w-md md:mx-0 mx-auto">
              <p className="eyebrow text-brass-400">Dispatch</p>
              <h2 className="mt-3 font-display text-2xl md:text-3xl font-semibold text-paper">
                Fare drops before they sell out
              </h2>
              <p className="mt-3 text-paper/55">
                One email a week — destination deals, not spam. Unsubscribe anytime.
              </p>
            </div>
            <div className="mt-8 md:mt-0 max-w-md w-full md:mx-0 mx-auto">
              <NewsletterForm dark />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
