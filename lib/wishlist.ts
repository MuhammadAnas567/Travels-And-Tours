export type WishlistItem = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  image: string;
  pricePerNight: number;
  savedAt: string;
};

const STORAGE_KEY = "ueb3-wishlist";
export const WISHLIST_EVENT = "ueb3-wishlist-change";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readWishlist(): WishlistItem[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeWishlist(items: WishlistItem[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT));
}

export function isInWishlist(idOrSlug: string) {
  return readWishlist().some((i) => i.id === idOrSlug || i.slug === idOrSlug);
}

export function toggleWishlistItem(item: Omit<WishlistItem, "savedAt">): boolean {
  const current = readWishlist();
  const idx = current.findIndex((i) => i.id === item.id || i.slug === item.slug);
  if (idx >= 0) {
    current.splice(idx, 1);
    writeWishlist(current);
    return false;
  }
  writeWishlist([{ ...item, savedAt: new Date().toISOString() }, ...current]);
  return true;
}

export function removeWishlistItem(idOrSlug: string) {
  writeWishlist(readWishlist().filter((i) => i.id !== idOrSlug && i.slug !== idOrSlug));
}

export function replaceWishlist(items: WishlistItem[]) {
  writeWishlist(items);
}
