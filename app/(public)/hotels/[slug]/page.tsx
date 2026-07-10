import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Star, Wifi, ArrowLeft } from "lucide-react";
import { getHotelBySlug } from "@/lib/data/catalog";
import { IMAGE_BLUR_DATA_URL, PLACEHOLDER_TOUR_IMAGE } from "@/lib/images";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) return { title: "Hotel not found" };
  return {
    title: hotel.name,
    description: hotel.description.slice(0, 160),
    openGraph: {
      title: `${hotel.name} · ${hotel.city}`,
      description: hotel.description.slice(0, 160),
      images: hotel.images[0] ? [{ url: hotel.images[0], alt: hotel.name }] : undefined,
    },
  };
}

export default async function HotelDetailPage({ params }: Props) {
  const { slug } = await params;
  const hotel = await getHotelBySlug(slug);
  if (!hotel) notFound();

  const hero = hotel.images[0] || PLACEHOLDER_TOUR_IMAGE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.description,
    image: hotel.images,
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
    <div className="bg-surface-alt">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative h-[320px] md:h-[420px]">
        <Image
          src={hero}
          alt={`${hotel.name} in ${hotel.city}`}
          fill
          priority
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
          <Link href="/hotels" className="mb-4 inline-flex items-center gap-1 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to hotels
          </Link>
          <div className="flex items-center gap-1 text-accent-500">
            {Array.from({ length: hotel.starRating }, (_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <h1 className="mt-2 font-heading text-3xl md:text-4xl font-bold text-white">{hotel.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-white/80">
            <MapPin className="h-4 w-4" /> {hotel.city}, {hotel.country}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-heading text-xl font-bold text-ink-900">About this stay</h2>
            <p className="mt-3 text-ink-600 leading-relaxed">{hotel.description}</p>
          </section>

          {hotel.amenities?.length > 0 && (
            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="font-heading text-xl font-bold text-ink-900">Amenities</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {hotel.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-ink-600">
                    <Wifi className="h-4 w-4 text-primary-500" /> {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hotel.images.length > 1 && (
            <section>
              <h2 className="font-heading text-xl font-bold text-ink-900 mb-4">Gallery</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {hotel.images.slice(1).map((src, i) => (
                  <div key={src + i} className="relative aspect-[16/10] overflow-hidden rounded-xl">
                    <Image
                      src={src}
                      alt={`${hotel.name} photo ${i + 2}`}
                      fill
                      placeholder="blur"
                      blurDataURL={IMAGE_BLUR_DATA_URL}
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border border-line bg-surface p-6 shadow-card">
          <p className="text-sm text-ink-500">From</p>
          <p className="text-3xl font-bold text-ink-900">
            ${hotel.pricePerNight}
            <span className="text-base font-normal text-ink-500"> / night</span>
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700">
              {hotel.avgRating.toFixed(1)}
            </span>
            <span className="text-sm text-ink-500">{hotel.reviewCount} reviews</span>
          </div>
          <Button asChild className="mt-6 w-full h-12 rounded-xl bg-primary-500 hover:bg-primary-700">
            <Link href={`/contact?subject=${encodeURIComponent(`Book ${hotel.name}`)}`}>
              Request to book
            </Link>
          </Button>
          <p className="mt-3 text-xs text-ink-500 text-center">
            Free cancellation on most dates · Secure payment
          </p>
        </aside>
      </div>
    </div>
  );
}
