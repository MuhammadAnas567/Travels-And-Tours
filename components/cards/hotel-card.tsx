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
    <article className="group relative overflow-hidden rounded-md bg-paper border border-line shadow-sm card-hover">
      <Link
        href="/login?callbackUrl=/dashboard/wishlist"
        className="absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-sm bg-paper/95 text-ink-700 shadow-sm hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
        aria-label={`Save ${name} to wishlist`}
      >
        <Heart className="h-4 w-4" strokeWidth={1.5} />
      </Link>
      <Link
        href={slug === "fallback" || !slug ? "/hotels" : `/hotels/${slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pine-500"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image || PLACEHOLDER_TOUR_IMAGE}
            alt={`${name} in ${city}, ${country}`}
            fill
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            className="img-cover img-editorial"
            sizes="(max-width:768px) 100vw, 33vw"
          />
          {avgRating >= 4.5 && (
            <span className="absolute top-3 left-3 rounded-sm bg-pine-500 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white">
              Best seller
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center gap-1 text-pine-500" aria-label={`${starRating} star hotel`}>
            {Array.from({ length: starRating }, (_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />
            ))}
          </div>
          <h3 className="mt-2 font-display text-lg font-semibold text-ink group-hover:text-pine-500 transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-500">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden /> {city}, {country}
          </p>
          {amenities.length > 0 && (
            <p className="mt-2 flex items-center gap-1 text-xs text-ink-500">
              <Wifi className="h-3 w-3" strokeWidth={1.5} aria-hidden /> {amenities.slice(0, 2).join(" · ")}
            </p>
          )}
          <div className="mt-4 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-pine-100 text-sm font-bold tabular-nums text-pine-700">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-ink-500">{reviewCount} reviews</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-500">per night</p>
              <p className="text-xl font-semibold tabular-nums text-ink" data-price>
                ${pricePerNight}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
