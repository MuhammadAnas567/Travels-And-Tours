import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { Tour } from "@prisma/client";

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
  >;
};

export function TourCard({ tour }: TourCardProps) {
  const unitPrice = tour.discountPrice
    ? Number(tour.discountPrice)
    : Number(tour.price);
  const originalPrice = tour.discountPrice ? Number(tour.price) : null;

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/tours/${tour.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={tour.images[0] ?? "/placeholder-tour.jpg"}
            alt={tour.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {tour.discountPrice && (
            <Badge className="absolute left-3 top-3" variant="destructive">
              Sale
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {tour.category.toLowerCase()}
            </Badge>
            {tour.avgRating > 0 && (
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
                {tour.avgRating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 font-semibold text-ocean-900 group-hover:text-ocean-700">
            {tour.title}
          </h3>
          <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {tour.location}, {tour.country}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {tour.durationDays} days
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-ocean-700">
              {formatPrice(unitPrice)}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-xs text-gray-500">/ person</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
