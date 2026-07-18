import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeHero } from "@/components/home/home-hero";
import { DestinationJourney } from "@/components/home/destination-journey";
import { HowItWorks } from "@/components/home/how-it-works";
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel";
import { TrustBar, ServicesGrid, WhyChooseUs } from "@/components/home/home-sections";
import { FeaturedPackages, BlogPreview } from "@/components/home/home-editorial";
import { HotelCard } from "@/components/cards/hotel-card";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { getTrendingDestinations, getPopularHotels, getDealOfTheWeek } from "@/lib/data/home";
import { IMAGE_BLUR_DATA_URL, unsplashSrc } from "@/lib/images";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/cards/wishlist-button";
import { DisplayPrice } from "@/components/shared/display-price";

export const dynamic = "force-static";
export const revalidate = 120;

export const metadata: Metadata = {
  title: "UEB3 Travel — Flights, Hotels & Journeys Worldwide",
  description:
    "Book flights, hotels, tour packages, and visas with clear prices and 24/7 support. A modern travel platform for explorers.",
  openGraph: {
    title: "UEB3 Travel — Find your next horizon",
    description: "Flights, stays, and packages in one cinematic search experience.",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Desert road at golden hour",
      },
    ],
  },
};

export default async function HomePage() {
  const [destinations, hotels, deal] = await Promise.all([
    getTrendingDestinations(8),
    getPopularHotels(6),
    getDealOfTheWeek(),
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
    description: "Book flights, hotels, and vacation packages worldwide.",
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
      <TrustBar />

      <section className="section-pad">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow">Destinations</p>
            <h2 className="mt-3 text-h2 text-ink">Featured destinations</h2>
            <p className="mt-3 text-ink-500 leading-relaxed">
              Scroll the route — tap a city to open stays and ideas for that stop.
            </p>
          </div>
          <DestinationJourney destinations={journeyStops} />
        </div>
      </section>

      <section className="section-pad bg-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow">Services</p>
            <h2 className="mt-3 text-h2 text-ink">Everything for the trip</h2>
            <p className="mt-3 text-ink-500">One platform for flights, stays, visas, and more.</p>
          </div>
          <ServicesGrid />
        </div>
      </section>

      <section className="section-pad">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Packages</p>
              <h2 className="mt-3 text-h2 text-ink">Popular tour packages</h2>
              <p className="mt-2 text-ink-500">Hand-composed itineraries with clear pricing.</p>
            </div>
            <Link
              href="/packages"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-pine-500 link-underline"
            >
              View all <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
          <FeaturedPackages />
        </div>
      </section>

      {deal && (
        <section className="relative overflow-hidden bg-pine-500">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-16 md:py-20 grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="eyebrow text-pine-100">Deal of the week</p>
              <h2 className="mt-4 font-display text-3xl md:text-4xl font-semibold text-paper">
                {deal.name}
              </h2>
              <p className="mt-3 text-paper/75">
                {deal.city}, {deal.country} — from{" "}
                <strong className="text-paper tabular-nums" data-price>
                  <DisplayPrice amount={deal.pricePerNight} />
                </strong>{" "}
                / night
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-paper text-pine-700 hover:bg-pine-50"
                >
                  <Link
                    href={
                      String(deal._id).startsWith("fallback")
                        ? "/hotels"
                        : `/hotels/${deal.slug}`
                    }
                  >
                    Book this stay
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-paper/30 bg-transparent text-paper hover:bg-paper/10"
                >
                  <Link href="/deals">See all deals</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg shadow-float group">
              <Image
                src={unsplashSrc(deal.images[0], 1200, 80)}
                alt={deal.name}
                fill
                className="object-cover img-cover"
                sizes="(max-width:768px) 100vw, 40vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
              />
              <WishlistButton
                id={String(deal._id)}
                slug={deal.slug}
                name={deal.name}
                city={deal.city}
                country={deal.country}
                image={deal.images[0] ?? ""}
                pricePerNight={deal.pricePerNight}
                className="rounded-full"
              />
            </div>
          </div>
        </section>
      )}

      <section className="section-pad bg-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-h2 text-ink">From search to takeoff</h2>
            <p className="mt-3 text-ink-500">Four clear steps — no mystery fees in the middle.</p>
          </div>
          <HowItWorks />
        </div>
      </section>

      <section className="section-pad">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Stays</p>
              <h2 className="mt-3 text-h2 text-ink">Featured hotels</h2>
              <p className="mt-2 text-ink-500">Places travellers book again</p>
            </div>
            <Link
              href="/hotels"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-pine-500 link-underline"
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
              <p className="col-span-full text-ink-500">No hotels loaded — run seed if empty.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section-pad bg-sand-100">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow">Why UEB3</p>
            <h2 className="mt-3 text-h2 text-ink">Built for real travellers</h2>
          </div>
          <WhyChooseUs />
        </div>
      </section>

      <section className="section-pad bg-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow">Stories</p>
            <h2 className="mt-3 text-h2 text-ink">What travellers say</h2>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      <section className="section-pad">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Journal</p>
              <h2 className="mt-3 text-h2 text-ink">Travel notes</h2>
              <p className="mt-2 text-ink-500">Guides and tips from the road.</p>
            </div>
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-pine-500 link-underline"
            >
              All posts <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
          <BlogPreview />
        </div>
      </section>

      <section className="section-pad">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-pine-900 px-6 py-14 sm:px-14 md:flex md:items-center md:justify-between md:gap-12 md:text-left text-center">
            <div className="max-w-md md:mx-0 mx-auto">
              <p className="eyebrow text-pine-400">Newsletter</p>
              <h2 className="mt-3 font-display text-2xl md:text-3xl font-semibold text-paper">
                Fare drops before they sell out
              </h2>
              <p className="mt-3 text-paper/60">
                One email a week — destination deals, not spam.
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
