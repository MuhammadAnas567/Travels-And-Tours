import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Star, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, convertPrice } from "@/lib/currency";
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
    <article className="group overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none">
      <Link href={`/tours/${tour.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden sm:aspect-[4/3]">
          <Image
            src={tour.images[0] ?? "/placeholder-tour.jpg"}
            alt={tour.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transform-none"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 image-overlay opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="font-display text-lg text-sand">{tour.location}</p>
            <p className="flex items-center gap-1 text-sm text-sand/80">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              {tour.country}
            </p>
          </div>
          {tour.isFeatured && (
            <Badge variant="accent" className="absolute left-3 top-3">
              Featured
            </Badge>
          )}
          {tour.discountPrice && (
            <Badge variant="warning" className="absolute right-3 top-3">
              Sale
            </Badge>
          )}
        </div>
        <div className="p-5">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {tour.category.toLowerCase()}
            </Badge>
            {tour.avgRating > 0 && (
              <span className="flex items-center gap-1 text-sm text-muted">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
                {tour.avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 font-display text-lg font-medium text-ink group-hover:text-primary">
            {tour.title}
          </h3>
          <div className="mt-2 flex items-center gap-3 text-sm text-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              {tour.durationDays} days
            </span>
            <span>Max {tour.maxGroupSize}</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <span className="text-caption">From</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-primary">
                  {formatCurrency(displayPrice, currency)}
                </span>
                {displayOriginal && (
                  <span className="text-sm text-muted line-through">
                    {formatCurrency(displayOriginal, currency)}
                  </span>
                )}
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </article>
  );
}
