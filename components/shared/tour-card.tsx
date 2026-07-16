import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Star, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, convertPrice } from "@/lib/currency";
import { IMAGE_BLUR_DATA_URL, PLACEHOLDER_TOUR_IMAGE } from "@/lib/images";
import type { Currency, Tour } from "@prisma/client";

type TourCardProps = {
  tour: Pick<
    Tour,
    | "slug"
    | "title"
    | "location"
    | "country"
    | "durationDays"
    | "price"
    | "discountPrice"
    | "images"
    | "avgRating"
    | "category"
    | "baseCurrency"
    | "isFeatured"
    | "maxGroupSize"
  >;
  currency?: Currency;
  rates?: Record<Currency, number>;
};

export function TourCard({ tour, currency = "USD", rates }: TourCardProps) {
  const basePrice = tour.discountPrice ? Number(tour.discountPrice) : Number(tour.price);
  const originalPrice = tour.discountPrice ? Number(tour.price) : null;
  const displayPrice =
    rates
      ? convertPrice(basePrice, tour.baseCurrency ?? "USD", currency, rates)
      : basePrice;
  const displayOriginal =
    originalPrice && rates
      ? convertPrice(originalPrice, tour.baseCurrency ?? "USD", currency, rates)
      : originalPrice;

  return (
    <article className="group overflow-hidden rounded-md border border-line bg-paper shadow-sm card-hover">
      <Link
        href={`/tours/${tour.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pine-500"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={tour.images[0] ?? PLACEHOLDER_TOUR_IMAGE}
            alt={tour.title}
            fill
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            className="img-cover img-editorial"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 image-scrim" />
          <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4">
            {tour.isFeatured ? (
              <span className="rounded-sm bg-pine-500 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white">
                Featured
              </span>
            ) : (
              <span />
            )}
            {tour.discountPrice && (
              <Badge className="bg-error text-paper border-0 font-semibold text-[0.6875rem] tracking-wide uppercase">
                On Sale
              </Badge>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="font-display text-2xl font-semibold text-paper leading-tight">{tour.location}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-paper/75">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              {tour.country}
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-[0.6875rem] capitalize tracking-wide font-medium bg-sand text-ink-500 border-line"
            >
              {tour.category.toLowerCase()}
            </Badge>
            {tour.avgRating > 0 && (
              <span className="flex items-center gap-1 text-sm font-medium tabular-nums text-ink-500">
                <Star className="h-3.5 w-3.5 fill-pine-500 text-pine-500" aria-hidden />
                {tour.avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 font-display text-xl font-semibold text-ink group-hover:text-pine-500 transition-colors">
            {tour.title}
          </h3>
          <div className="mt-2.5 flex items-center gap-4 text-sm text-ink-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              {tour.durationDays} days
            </span>
            <span>Up to {tour.maxGroupSize} guests</span>
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
            <div>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-ink-500">
                From
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums text-pine-500">
                  {formatCurrency(displayPrice, currency)}
                </span>
                {displayOriginal && (
                  <span className="text-sm tabular-nums text-ink-500 line-through">
                    {formatCurrency(displayOriginal, currency)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-pine-100 text-pine-500 transition-colors group-hover:bg-pine-500 group-hover:text-paper">
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
