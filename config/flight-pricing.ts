/**
 * Flight retail pricing (server-only business rules).
 *
 * - commissionPercent: markup on the supplier fare → customer buy price
 * - strikethroughPercent: inflate the "was" price so the UI reads as a discount
 *
 * The supplier/source fare must never leave the server (API, HTML, or logs).
 */
export const flightPricingConfig = {
  /** Shown with strikethrough (“was”) — percent bump used for discount theatre. */
  strikethroughPercent: {
    min: 2,
    max: 5,
  },
  /** Added to the supplier fare to produce the buy / sell price. */
  commissionPercent: {
    min: 4,
    max: 6,
  },
} as const;

export type FlightPricingPercentRange = {
  min: number;
  max: number;
};
