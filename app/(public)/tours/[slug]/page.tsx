import Link from "next/link";
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
    aggregateRating: tour.avgRating > 0
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

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-2 capitalize">
            {tour.category.toLowerCase()}
          </Badge>
          <h1 className="text-3xl font-bold text-ocean-900 sm:text-4xl">
            {tour.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" aria-hidden />
              {tour.location}, {tour.country}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden />
              {tour.durationDays} days
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" aria-hidden />
              Max {tour.maxGroupSize} people
            </span>
            {tour.avgRating > 0 && (
              <Rating value={tour.avgRating} showValue />
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Gallery images={tour.images} title={tour.title} />

            <section>
              <h2 className="text-xl font-semibold text-ocean-900">Overview</h2>
              <p className="mt-3 leading-relaxed text-gray-600 whitespace-pre-line">
                {tour.description}
              </p>
            </section>

            {visaInfo && (
              <Link
                href={`/visa/${visaInfo.countrySlug}`}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-primary/20 bg-primary/5 p-4 transition-colors hover:bg-primary/10"
              >
                <FileText className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <div>
                  <p className="font-medium text-ink">
                    Need a {visaInfo.country} visa?
                  </p>
                  <p className="text-sm text-muted">We handle it — view requirements &amp; apply →</p>
                </div>
              </Link>
            )}

            <section>
              <h2 className="text-xl font-semibold text-ocean-900">Itinerary</h2>
              <div className="mt-4 space-y-4">
                {itinerary.map((day) => (
                  <div
                    key={day.day}
                    className="flex gap-4 rounded-lg border border-ocean-100 p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean-100 font-semibold text-ocean-700">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="font-medium text-ocean-900">{day.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{day.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-6 sm:grid-cols-2">
              <section>
                <h2 className="text-xl font-semibold text-ocean-900">Included</h2>
                <ul className="mt-3 space-y-2">
                  {tour.included.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-ocean-900">Excluded</h2>
                <ul className="mt-3 space-y-2">
                  {tour.excluded.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {tour.reviews.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-ocean-900">Reviews</h2>
                <div className="mt-4 space-y-4">
                  {tour.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-ocean-100 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{review.user.name}</span>
                        <Rating value={review.rating} size="sm" />
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-4">
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
              className="block text-center text-sm text-primary hover:underline"
            >
              Need a custom itinerary? Get a quote →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
