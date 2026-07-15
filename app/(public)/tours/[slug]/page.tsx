import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTourBySlug } from "@/lib/tours";
import { getVisaForCountry } from "@/lib/visa";
import { WhatsAppInquiryButton } from "@/components/shared/whatsapp-inquiry";
import { getTourUnitPrice } from "@/lib/booking";
import { Gallery } from "@/components/shared/gallery";
import { BookingWidget } from "@/components/shared/booking-widget";
import { Rating } from "@/components/shared/rating";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Check, X, FileText } from "lucide-react";
import { IMAGE_BLUR_DATA_URL, PLACEHOLDER_TOUR_IMAGE } from "@/lib/images";
import type { ItineraryDay } from "@/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return { title: "Tour Not Found" };

  return {
    title: tour.title,
    description: tour.description.slice(0, 160),
    openGraph: {
      title: tour.title,
      description: tour.description.slice(0, 160),
      images: tour.images[0] ? [{ url: tour.images[0] }] : [],
      type: "website",
    },
  };
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);

  if (!tour || tour.status !== "ACTIVE") notFound();

  const unitPrice = getTourUnitPrice(tour);
  const itinerary = tour.itinerary as ItineraryDay[];
  const visaInfo = await getVisaForCountry(tour.visaCountry ?? tour.country);
  const hero = tour.images[0] ?? PLACEHOLDER_TOUR_IMAGE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.description,
    image: tour.images,
    touristType: tour.category,
    offers: {
      "@type": "Offer",
      price: unitPrice,
      priceCurrency: "USD",
    },
    aggregateRating:
      tour.avgRating > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: tour.avgRating,
            reviewCount: tour.reviews.length,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative h-[360px] md:h-[480px] overflow-hidden">
        <Image
          src={hero}
          alt={tour.title}
          fill
          priority
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className="object-cover img-editorial"
          sizes="100vw"
        />
        <div className="absolute inset-0 image-overlay-hero" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-10">
          <Badge
            variant="secondary"
            className="mb-3 capitalize bg-paper/90 text-ink border-0"
          >
            {tour.category.toLowerCase()}
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-paper max-w-[20ch]">
            {tour.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-paper/80">
            <span className="flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {tour.location}, {tour.country}
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {tour.durationDays} days
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Max {tour.maxGroupSize} people
            </span>
            {tour.avgRating > 0 && <Rating value={tour.avgRating} showValue />}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <Gallery images={tour.images} title={tour.title} />

            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">Overview</h2>
              <p className="mt-3 max-w-[65ch] leading-relaxed text-ink-500 whitespace-pre-line">
                {tour.description}
              </p>
            </section>

            {visaInfo && (
              <Link
                href={`/visa/${visaInfo.countrySlug}`}
                className="flex items-center gap-3 rounded-md border border-pine-200 bg-pine-50 p-4 transition-colors hover:bg-pine-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
              >
                <FileText className="h-5 w-5 text-pine-500" strokeWidth={1.5} />
                <div>
                  <p className="font-medium text-ink">Need a {visaInfo.country} visa?</p>
                  <p className="text-sm text-ink-500">
                    We handle it — view requirements &amp; apply →
                  </p>
                </div>
              </Link>
            )}

            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">Itinerary</h2>
              <div className="mt-4 space-y-3">
                {itinerary.map((day) => (
                  <div
                    key={day.day}
                    className="flex gap-4 rounded-md border border-line bg-paper p-4 shadow-sm"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-pine-100 font-semibold tabular-nums text-pine-700">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="font-medium text-ink">{day.title}</h3>
                      <p className="mt-1 text-sm text-ink-500 leading-relaxed">{day.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-8 sm:grid-cols-2">
              <section>
                <h2 className="font-display text-2xl font-semibold text-ink">Included</h2>
                <ul className="mt-3 space-y-2">
                  {tour.included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink-500">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-pine-500" strokeWidth={1.5} aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="font-display text-2xl font-semibold text-ink">Excluded</h2>
                <ul className="mt-3 space-y-2">
                  {tour.excluded.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink-500">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-error" strokeWidth={1.5} aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {tour.reviews.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-semibold text-ink">Reviews</h2>
                <div className="mt-4 space-y-3">
                  {tour.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-md border border-line bg-paper p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-ink">{review.user.name}</span>
                        <Rating value={review.rating} size="sm" />
                      </div>
                      <p className="mt-2 text-sm text-ink-500 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
            <BookingWidget
              tourId={tour.id}
              tourSlug={tour.slug}
              tourTitle={tour.title}
              unitPrice={unitPrice}
              maxGroupSize={tour.maxGroupSize}
              availableDates={tour.availableDates}
            />
            <WhatsAppInquiryButton
              tourTitle={tour.title}
              tourSlug={tour.slug}
              className="w-full"
            />
            <Link
              href="/plan-trip"
              className="block text-center text-sm text-pine-500 hover:text-pine-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded-sm"
            >
              Need a custom itinerary? Get a quote →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
