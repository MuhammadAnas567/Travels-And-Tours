import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("[stripe] STRIPE_SECRET_KEY is not set — payments disabled");
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }

  return stripeInstance;
}

/** Generate a human-readable booking reference, e.g. UEB3-A1B2C3 */
export function generateBookingReference() {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `UEB3-${part}`;
}
