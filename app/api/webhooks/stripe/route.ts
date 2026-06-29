import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { formatDate, formatPrice } from "@/lib/utils";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      return NextResponse.json({ error: "No booking ID" }, { status: 400 });
    }

    try {
      await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: { tour: true, tourDate: true, user: true },
        });

        if (!booking || booking.status === "CONFIRMED") return;

        const seatsNeeded = booking.adults + booking.children;
        const tourDate = await tx.tourDate.findUnique({
          where: { id: booking.tourDateId },
        });

        if (!tourDate) throw new Error("Tour date not found");

        const seatsLeft = tourDate.seatsTotal - tourDate.seatsBooked;
        if (seatsNeeded > seatsLeft) {
          throw new Error("Overbooking prevented");
        }

        await tx.tourDate.update({
          where: { id: booking.tourDateId },
          data: { seatsBooked: { increment: seatsNeeded } },
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "CONFIRMED",
            paymentIntentId:
              (session.payment_intent as string) ?? booking.paymentIntentId,
            stripeSessionId: session.id,
          },
        });

        const travelerInfo = booking.travelerInfo as {
          name: string;
          email: string;
        };

        await sendBookingConfirmationEmail({
          to: travelerInfo.email ?? booking.user.email,
          bookingId: booking.id,
          tourTitle: booking.tour.title,
          startDate: formatDate(booking.tourDate.startDate),
          endDate: formatDate(booking.tourDate.endDate),
          totalPrice: formatPrice(Number(booking.totalPrice)),
          travelerName: travelerInfo.name ?? booking.user.name ?? "Traveler",
        });
      });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
