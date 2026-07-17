"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { removeWishlistItem } from "@/lib/wishlist";
import { DisplayPrice } from "@/components/shared/display-price";
import { usePreferences } from "@/components/providers/preferences-provider";
import { IMAGE_BLUR_DATA_URL, PLACEHOLDER_TOUR_IMAGE } from "@/lib/images";

export default function WishlistPage() {
  const { items } = useWishlist();
  const { t } = usePreferences();

  return (
    <div>
      <p className="eyebrow text-pine-600">{t("dash.account")}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900">
        {t("dash.wishlist")}
      </h1>
      <p className="mt-2 text-ink-500">
        Stays you’ve saved — kept on this device across refresh
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-line bg-sand/40 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-pine-50 text-pine-600">
            <Heart className="size-5" strokeWidth={1.5} aria-hidden />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">
            No saved stays yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
            Tap the heart on a hotel to save it here.
          </p>
          <Button asChild className="mt-6">
            <Link href="/hotels">{t("nav.hotels")}</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-4 rounded-md border border-line bg-sand/40 p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-sm sm:h-24 sm:w-36">
                <Image
                  src={item.image || PLACEHOLDER_TOUR_IMAGE}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="144px"
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR_DATA_URL}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/hotels/${item.slug}`}
                  className="font-display text-lg font-semibold text-ink hover:text-pine-500"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-ink-500">
                  {item.city}, {item.country}
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-pine-600">
                  <DisplayPrice amount={item.pricePerNight} />{" "}
                  <span className="font-normal text-ink-500">/ {t("common.perNight")}</span>
                </p>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <Button asChild size="sm">
                  <Link href={`/hotels/${item.slug}`}>View</Link>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => removeWishlistItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
