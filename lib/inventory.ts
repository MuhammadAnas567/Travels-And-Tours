/** Inventory commerce mode — drives honest CTAs across the site */

export type InventoryMode = "bookable" | "inquire" | "coming_soon";

export function isFallbackId(id: string | null | undefined) {
  if (!id) return true;
  return id.startsWith("fallback") || id === "fallback";
}

export function tourInventoryMode(tourId: string): InventoryMode {
  return isFallbackId(tourId) ? "inquire" : "bookable";
}

export function hotelInventoryMode(slug?: string | null, id?: string | null): InventoryMode {
  if (isFallbackId(id) || slug === "fallback" || !slug) return "inquire";
  return "inquire"; // hotels are inquire-only until PMS exists
}

export function flightInventoryMode(): InventoryMode {
  return "inquire";
}

export function carInventoryMode(): InventoryMode {
  return "inquire";
}

export const CTA_LABEL: Record<InventoryMode, string> = {
  bookable: "Book now",
  inquire: "Request quote",
  coming_soon: "Coming soon",
};

export const INVENTORY_BADGE: Record<InventoryMode, string> = {
  bookable: "Instant book",
  inquire: "Inquire only",
  coming_soon: "Coming soon",
};
