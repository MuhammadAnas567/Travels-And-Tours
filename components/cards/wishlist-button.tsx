"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWishlistSaved } from "@/hooks/use-wishlist";
import { toggleWishlistItem } from "@/lib/wishlist";
import { usePreferences } from "@/components/providers/preferences-provider";

type Props = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  image: string;
  pricePerNight: number;
  className?: string;
};

export function WishlistButton({
  id,
  slug,
  name,
  city,
  country,
  image,
  pricePerNight,
  className,
}: Props) {
  const saved = useWishlistSaved(id || slug);
  const { t } = usePreferences();

  return (
    <button
      type="button"
      className={cn(
        "absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-sm bg-paper/95 shadow-sm hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500",
        saved ? "text-pine-600" : "text-ink-700",
        className
      )}
      aria-label={saved ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowSaved = toggleWishlistItem({
          id: id || slug,
          slug,
          name,
          city,
          country,
          image,
          pricePerNight,
        });
        toast.success(nowSaved ? t("common.wishlistSave") : t("common.wishlistRemove"));
      }}
    >
      <Heart
        className={cn("h-4 w-4", saved && "fill-current")}
        strokeWidth={1.5}
      />
    </button>
  );
}
