import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Star, Wifi, ArrowLeft } from "lucide-react";
import { getHotelBySlug } from "@/lib/data/catalog";
import { IMAGE_BLUR_DATA_URL, PLACEHOLDER_TOUR_IMAGE } from "@/lib/images";
import { getWhatsAppUrl } from "@/lib/site-config";
import { HotelInquiryForm } from "@/components/hotels/hotel-inquiry-form";
import { AvailabilityPanel } from "@/components/hotels/availability-panel";
import { MapboxMap } from "@/components/maps/mapbox-map";
import { resolveCityCoords } from "@/lib/geo/city-coords";

export const dynamic = "force-dynamic";
export const revalidate = 120;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) return { title: "Hotel not found" };
  const description = (hotel.description ?? `${hotel.name} in ${hotel.city}`).slice(0, 160);
  return {
    title: hotel.name,
    description,
    openGraph: {
      title: `${hotel.name} · ${hotel.city}`,
      description,
      images: hotel.images?.[0] ? [{ url: hotel.images[0], alt: hotel.name }] : undefined,
    },
  };
}

export default async function HotelDetailPage({ params }: Props) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) notFound();

  const images = Array.isArray(hotel.images) ? hotel.images : [];
  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
  const description =
    typeof hotel.description === "string" && hotel.description.trim()
      ? hotel.description
      : `Experience exceptional hospitality at ${hotel.name} in ${hotel.city}.`;
  const hero = images[0] || PLACEHOLDER_TOUR_IMAGE;
  const whatsappUrl = getWhatsAppUrl(
    `Hi! I'd like to request a stay at ${hotel.name} in ${hotel.city}.`
  );
  const hotelCoords =
    "coordinates" in hotel && hotel.coordinates
      ? (hotel.coordinates as { lat?: number; lng?: number })
      : null;
  const coords =
    hotelCoords &&
    typeof hotelCoords.lat === "number" &&
    typeof hotelCoords.lng === "number"
      ? { lat: hotelCoords.lat, lng: hotelCoords.lng }
      : resolveCityCoords(hotel.city);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description,
    image: images,
    address: {
      "@type": "PostalAddress",
      addressLocality: hotel.city,
      addressCountry: hotel.country,
    },
    starRating: {
      "@type": "Rating",
      ratingValue: hotel.starRating,
    },
    aggregateRating: hotel.reviewCount
      ? {
          "@type": "AggregateRating",
          ratingValue: hotel.avgRating,
          reviewCount: hotel.reviewCount,
        }
      : undefined,
    priceRange: `$${hotel.pricePerNight}+`,
  };

  return (
    <div className="bg-sand">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative h-[360px] md:h-[480px] overflow-hidden">
        <Image
          src={hero}
          alt={`${hotel.name} in ${hotel.city}`}
          fill
          priority
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className="object-cover img-editorial"
          sizes="100vw"
        />
        <div className="absolute inset-0 image-overlay-hero" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-10">
          <Link
            href="/hotels"
            className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm text-paper/80 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back to hotels
          </Link>
          <div className="flex items-center gap-1 text-pine-400" aria-label={`${hotel.starRating} star hotel`}>
            {Array.from({ length: hotel.starRating }, (_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
            ))}
          </div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-paper max-w-[18ch]">
            {hotel.name}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-paper/80">
            <MapPin className="h-4 w-4" strokeWidth={1.5} aria-hidden /> {hotel.city}, {hotel.country}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-md border border-line bg-paper p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-ink">About this stay</h2>
            <p className="mt-3 max-w-[65ch] text-ink-500 leading-relaxed">{description}</p>
          </section>

          {amenities.length > 0 && (
            <section className="rounded-md border border-line bg-paper p-6 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-ink">Amenities</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-ink-500">
                    <Wifi className="h-4 w-4 text-pine-500" strokeWidth={1.5} aria-hidden /> {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {images.length > 1 && (
            <section>
              <h2 className="font-display text-xl font-semibold text-ink mb-4">Gallery</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {images.slice(1).map((src, i) => (
                  <div key={src + i} className="relative aspect-[16/10] overflow-hidden rounded-md">
                    <Image
                      src={src}
                      alt={`${hotel.name} photo ${i + 2}`}
                      fill
                      placeholder="blur"
                      blurDataURL={IMAGE_BLUR_DATA_URL}
                      className="object-cover img-editorial"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-md border border-line bg-paper p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-ink">Location</h2>
            <p className="mt-1 text-sm text-ink-500">
              {hotel.city}, {hotel.country}
            </p>
            <div className="mt-4">
              <MapboxMap
                markers={[
                  {
                    id: hotel.slug,
                    lat: coords.lat,
                    lng: coords.lng,
                    label: hotel.name,
                  },
                ]}
                height={320}
                zoom={12}
              />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit space-y-5">
          <AvailabilityPanel city={hotel.city} hotelName={hotel.name} />
          <div className="rounded-md border border-line bg-paper p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-pine-100 text-sm font-bold tabular-nums text-pine-700">
                {hotel.avgRating.toFixed(1)}
              </span>
              <span className="text-sm text-ink-500">{hotel.reviewCount} reviews</span>
            </div>
            <HotelInquiryForm
              hotelName={hotel.name}
              city={hotel.city}
              country={hotel.country}
              pricePerNight={hotel.pricePerNight}
              whatsappUrl={whatsappUrl}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
