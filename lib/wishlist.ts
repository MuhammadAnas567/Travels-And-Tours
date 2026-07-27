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

const STORAGE_KEY = "arreat-wishlist";
export const WISHLIST_EVENT = "arreat-wishlist-change";

/** Cached snapshot — useSyncExternalStore requires referential stability. */
let cachedItems: WishlistItem[] = [];
let cachedRaw: string | null = null;
let cacheHydrated = false;

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function normalizeItem(raw: unknown): WishlistItem | null {
  if (!raw || typeof raw !== "object") return null;
  const i = raw as Partial<WishlistItem>;
  if (typeof i.id !== "string" || !i.id) return null;
  if (typeof i.slug !== "string" || !i.slug) return null;
  return {
    id: i.id,
    slug: i.slug,
    name: typeof i.name === "string" && i.name ? i.name : "Saved stay",
    city: typeof i.city === "string" ? i.city : "",
    country: typeof i.country === "string" ? i.country : "",
    image: typeof i.image === "string" ? i.image : "",
    pricePerNight:
      typeof i.pricePerNight === "number" && Number.isFinite(i.pricePerNight)
        ? i.pricePerNight
        : 0,
    savedAt:
      typeof i.savedAt === "string" && i.savedAt
        ? i.savedAt
        : new Date(0).toISOString(),
  };
}

function parseWishlist(raw: string | null): WishlistItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeItem).filter((i): i is WishlistItem => i !== null);
  } catch {
    return [];
  }
}

/** Stable getSnapshot for useSyncExternalStore (client). */
export function getWishlistSnapshot(): WishlistItem[] {
  if (!canUseStorage()) return cachedItems;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (cacheHydrated && raw === cachedRaw) return cachedItems;
    cachedRaw = raw;
    cachedItems = parseWishlist(raw);
    cacheHydrated = true;
    return cachedItems;
  } catch {
    return cachedItems;
  }
}

export function readWishlist(): WishlistItem[] {
  return getWishlistSnapshot();
}

export function writeWishlist(items: WishlistItem[]) {
  const normalized = items
    .map(normalizeItem)
    .filter((i): i is WishlistItem => i !== null);
  if (!canUseStorage()) {
    cachedItems = normalized;
    cachedRaw = JSON.stringify(normalized);
    cacheHydrated = true;
    return;
  }
  const raw = JSON.stringify(normalized);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedItems = normalized;
  cacheHydrated = true;
  window.dispatchEvent(new CustomEvent(WISHLIST_EVENT));
}

export function isInWishlist(idOrSlug: string) {
  return getWishlistSnapshot().some((i) => i.id === idOrSlug || i.slug === idOrSlug);
}

export function toggleWishlistItem(item: Omit<WishlistItem, "savedAt">): boolean {
  const current = getWishlistSnapshot();
  const idx = current.findIndex((i) => i.id === item.id || i.slug === item.slug);
  if (idx >= 0) {
    writeWishlist(current.filter((_, i) => i !== idx));
    return false;
  }
  writeWishlist([{ ...item, savedAt: new Date().toISOString() }, ...current]);
  return true;
}

export function removeWishlistItem(idOrSlug: string) {
  writeWishlist(
    getWishlistSnapshot().filter((i) => i.id !== idOrSlug && i.slug !== idOrSlug)
  );
}

export function replaceWishlist(items: WishlistItem[]) {
  writeWishlist(items);
}
