import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Wifi, Heart } from "lucide-react";
import { IMAGE_BLUR_DATA_URL, PLACEHOLDER_TOUR_IMAGE } from "@/lib/images";

type HotelCardProps = {
  slug: string;
  name: string;
  city: string;
  country: string;
  image: string;
  starRating: number;
  avgRating: number;
  reviewCount: number;
  pricePerNight: number;
  amenities?: string[];
};

export function HotelCard({
  slug,
  name,
  city,
  country,
  image,
  starRating,
  avgRating,
  reviewCount,
  pricePerNight,
  amenities = [],
}: HotelCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl bg-surface border border-line shadow-card card-hover">
      <Link
        href="/login?callbackUrl=/dashboard/wishlist"
        className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-card hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label={`Save ${name} to wishlist`}
      >
        <Heart className="h-4 w-4" />
      </Link>
      <Link href={`/hotels/${slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={image || PLACEHOLDER_TOUR_IMAGE}
            alt={`${name} in ${city}, ${country}`}
            fill
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
          />
          {avgRating >= 4.5 && (
            <span className="absolute top-3 left-3 rounded-lg bg-primary-500 px-2 py-1 text-xs font-bold text-white">
              Best seller
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-1 text-accent-600" aria-label={`${starRating} star hotel`}>
            {Array.from({ length: starRating }, (_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />
            ))}
          </div>
          <h3 className="mt-2 font-heading text-lg font-bold text-ink-900 group-hover:text-primary-500 transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-500">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {city}, {country}
          </p>
          {amenities.length > 0 && (
            <p className="mt-2 flex items-center gap-1 text-xs text-ink-500">
              <Wifi className="h-3 w-3" aria-hidden /> {amenities.slice(0, 2).join(" · ")}
            </p>
          )}
          <div className="mt-4 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-ink-500">{reviewCount} reviews</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-500">per night</p>
              <p className="text-xl font-bold text-ink-900">${pricePerNight}</p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
