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
    <article className="group card-luxury overflow-hidden motion-reduce:transform-none">
      <Link href={`/tours/${tour.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={tour.images[0] ?? "/placeholder-tour.jpg"}
            alt={tour.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transform-none"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 image-overlay opacity-70" />
          <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4">
            {tour.isFeatured ? (
              <Badge className="bg-gold/90 text-midnight border-0 font-semibold text-[0.6875rem] tracking-wide uppercase">
                Featured
              </Badge>
            ) : <span />}
            {tour.discountPrice && (
              <Badge className="bg-danger/90 text-pearl border-0 font-semibold text-[0.6875rem] tracking-wide uppercase">
                On Sale
              </Badge>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="font-display text-2xl text-pearl leading-tight">{tour.location}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-cream/75">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              {tour.country}
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-[0.6875rem] capitalize tracking-wide font-medium bg-cream text-muted border-line">
              {tour.category.toLowerCase()}
            </Badge>
            {tour.avgRating > 0 && (
              <span className="flex items-center gap-1 text-sm font-medium text-muted">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />
                {tour.avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 font-display text-xl text-ink group-hover:text-ocean transition-colors">
            {tour.title}
          </h3>
          <div className="mt-2.5 flex items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              {tour.durationDays} days
            </span>
            <span>Up to {tour.maxGroupSize} guests</span>
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-line pt-4">
            <div>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-muted">From</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-ocean">
                  {formatCurrency(displayPrice, currency)}
                </span>
                {displayOriginal && (
                  <span className="text-sm text-muted line-through">
                    {formatCurrency(displayOriginal, currency)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean/10 text-ocean transition-all group-hover:bg-ocean group-hover:text-pearl">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
