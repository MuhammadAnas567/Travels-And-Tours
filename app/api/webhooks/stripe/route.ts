import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe, generateBookingReference, isStripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { formatDate, formatPrice } from "@/lib/utils";
import type Stripe from "stripe";

/**
 * Stripe webhook — source of truth for payment finalization.
 * Handles PaymentIntent (new Payment Element flow) and Checkout Session (legacy).
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
      await finalizeBooking({
        bookingId: intent.metadata?.bookingId,
        paymentIntentId: intent.id,
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await finalizeBooking({
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

async function finalizeBooking({
  bookingId,
  paymentIntentId,
  stripeSessionId,
}: {
  bookingId?: string;
  paymentIntentId?: string;
  stripeSessionId?: string;
}) {
  if (!bookingId) {
    console.warn("[stripe webhook] No bookingId in metadata");
    return;
  }

  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { tour: true, tourDate: true, user: true },
    });

    if (!booking) {
      console.warn(`[stripe webhook] Booking ${bookingId} not found`);
      return;
    }

    // Idempotent — already finalized
    if (booking.status === "CONFIRMED" && booking.bookingReference) {
      return;
    }

    const seatsNeeded = booking.adults + booking.children;
    const tourDate = await tx.tourDate.findUnique({
      where: { id: booking.tourDateId },
    });

    if (!tourDate) throw new Error("Tour date not found");

    // Only increment seats if not already confirmed
    if (booking.status !== "CONFIRMED") {
      const seatsLeft = tourDate.seatsTotal - tourDate.seatsBooked;
      if (seatsNeeded > seatsLeft) {
        throw new Error("Overbooking prevented");
      }

      await tx.tourDate.update({
        where: { id: booking.tourDateId },
        data: { seatsBooked: { increment: seatsNeeded } },
      });
    }

    const bookingReference =
      booking.bookingReference ?? generateBookingReference();

    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paymentIntentId: paymentIntentId ?? booking.paymentIntentId,
        stripeSessionId: stripeSessionId ?? booking.stripeSessionId,
        bookingReference,
      },
    });

    if (booking.couponCode && booking.status !== "CONFIRMED") {
      await tx.coupon.updateMany({
        where: { code: booking.couponCode },
        data: { usageCount: { increment: 1 } },
      });
    }

    const travelerInfo = booking.travelerInfo as {
      name?: string;
      email?: string;
    };

    try {
      await sendBookingConfirmationEmail({
        to: travelerInfo.email ?? booking.user.email,
        bookingId: bookingReference,
        tourTitle: booking.tour.title,
        startDate: formatDate(booking.tourDate.startDate),
        endDate: formatDate(booking.tourDate.endDate),
        totalPrice: formatPrice(Number(booking.totalPrice)),
        travelerName: travelerInfo.name ?? booking.user.name ?? "Traveler",
      });
    } catch (emailErr) {
      // Email must never break booking finalization
      console.error("[stripe webhook] Confirmation email failed:", emailErr);
    }
  });
}
