import { createHash } from "crypto";
import { flightPricingConfig } from "@/config/flight-pricing";

export type PublicFlightPrice = {
  /** Customer buy price (supplier + commission). */
  price: number;
  /** Inflated “was” price shown with strikethrough. */
  compareAtPrice: number;
};

export type FlightPricingRates = {
  commissionPercent: number;
  strikethroughPercent: number;
};

/** Deterministic 0..1 from a seed (stable within a search / cache entry). */
function unitFromSeed(seed: string): number {
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 8);
  return parseInt(hex, 16) / 0xffffffff;
}

function percentInRange(seed: string, min: number, max: number): number {
  if (max <= min) return min;
  return min + unitFromSeed(seed) * (max - min);
}

/** Pick commission + strikethrough rates once per search so ranking stays fair. */
export function pickFlightPricingRates(searchSeed: string): FlightPricingRates {
  const { commissionPercent, strikethroughPercent } = flightPricingConfig;
  return {
    commissionPercent: percentInRange(
      `${searchSeed}:commission`,
      commissionPercent.min,
      commissionPercent.max
    ),
    strikethroughPercent: percentInRange(
      `${searchSeed}:strike`,
      strikethroughPercent.min,
      strikethroughPercent.max
    ),
  };
}

/**
 * Convert a supplier fare into public display amounts.
 * Never return or log the source amount from call sites that touch the client.
 */
export function toPublicFlightPrice(
  sourceAmount: number,
  rates: FlightPricingRates
): PublicFlightPrice {
  if (!Number.isFinite(sourceAmount) || sourceAmount <= 0) {
    return { price: 0, compareAtPrice: 0 };
  }

  const price = Math.round(sourceAmount * (1 + rates.commissionPercent / 100));
  // “Was” must always read higher than buy so the UI shows a discount.
  let compareAtPrice = Math.round(sourceAmount * (1 + rates.strikethroughPercent / 100));
  if (compareAtPrice <= price) {
    compareAtPrice = Math.round(price * (1 + rates.strikethroughPercent / 100));
  }

  return { price, compareAtPrice };
}

export function applyRatesToAmount(sourceAmount: number, rates: FlightPricingRates): number {
  return toPublicFlightPrice(sourceAmount, rates).price;
}

