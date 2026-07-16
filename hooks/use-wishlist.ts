"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  isInWishlist,
  readWishlist,
  toggleWishlistItem,
  WISHLIST_EVENT,
  type WishlistItem,
} from "@/lib/wishlist";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(WISHLIST_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(WISHLIST_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useWishlist() {
  const items = useSyncExternalStore(subscribe, readWishlist, () => [] as WishlistItem[]);

  const toggle = useCallback((item: Omit<WishlistItem, "savedAt">) => {
    return toggleWishlistItem(item);
  }, []);

  const has = useCallback(
    (idOrSlug: string) => items.some((i) => i.id === idOrSlug || i.slug === idOrSlug),
    [items]
  );

  return { items, toggle, has, count: items.length };
}

export function useWishlistSaved(idOrSlug: string) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInWishlist(idOrSlug));
    const onChange = () => setSaved(isInWishlist(idOrSlug));
    window.addEventListener(WISHLIST_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(WISHLIST_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [idOrSlug]);

  return saved;
}
