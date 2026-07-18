import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { finalizePaidBooking } from "@/lib/fulfill-booking";
import type Stripe from "stripe";

/**
 * Stripe webhook — source of truth for payment finalization.
 * Handles PaymentIntent (Payment Element) and Checkout Session (legacy).
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export async function POST(req: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("[stripe webhook] Stripe or webhook secret not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe unavailable" }, { status: 503 });
  }

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[stripe webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      await finalizePaidBooking({
        bookingId: intent.metadata?.bookingId,
        paymentIntentId: intent.id,
      });
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.bookingId;
      if (bookingId) {
        const { prisma } = await import("@/lib/db");
        await prisma.booking.updateMany({
          where: { id: bookingId, status: "PENDING" },
          data: { fulfillmentStatus: "FAILED" },
        });
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await finalizePaidBooking({
        bookingId: session.metadata?.bookingId,
        paymentIntentId: (session.payment_intent as string) ?? undefined,
        stripeSessionId: session.id,
      });
    }
  } catch (error) {
    console.error("[stripe webhook] Processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
