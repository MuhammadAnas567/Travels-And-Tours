import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import {
  calculateBookingTotal,
  getTourUnitPrice,
  toCents,
} from "@/lib/booking";
import { bookingStep1Schema, bookingStep2Schema } from "@/lib/validations";

const bodySchema = z.object({
  tourId: z.string().min(1),
  tourDateId: z.string().min(1),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(20),
  travelerInfo: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
  }),
  specialRequests: z.string().optional(),
});

/**
 * POST /api/payments/create-intent
 * Auth required. Recomputes price server-side, creates PENDING booking + Stripe PaymentIntent.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to book" }, { status: 401 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Payments are not configured. Set STRIPE_SECRET_KEY in .env.local" },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe unavailable" }, { status: 503 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const step1 = bookingStep1Schema.safeParse({
      tourDateId: data.tourDateId,
      adults: data.adults,
      children: data.children,
    });
    const step2 = bookingStep2Schema.safeParse(data.travelerInfo);
    if (!step1.success || !step2.success) {
      return NextResponse.json({ error: "Invalid booking data" }, { status: 400 });
    }

    const seatsNeeded = data.adults + data.children;

    const { booking, totalPrice, tourTitle } = await prisma.$transaction(async (tx) => {
      const tour = await tx.tour.findUnique({ where: { id: data.tourId } });
      const tourDate = await tx.tourDate.findUnique({ where: { id: data.tourDateId } });

      if (!tour || tour.status !== "ACTIVE") {
        throw new Error("Tour not available");
      }
      if (!tourDate || tourDate.tourId !== data.tourId) {
        throw new Error("Invalid date");
      }

      const seatsLeft = tourDate.seatsTotal - tourDate.seatsBooked;
      if (seatsNeeded > seatsLeft) {
        throw new Error(`Only ${seatsLeft} seats available`);
      }

      // Never trust client totals — recompute on server
      const unitPrice = getTourUnitPrice(tour);
      const total = calculateBookingTotal(unitPrice, data.adults, data.children);

      const created = await tx.booking.create({
        data: {
          userId: session.user!.id,
          tourId: data.tourId,
          tourDateId: data.tourDateId,
          adults: data.adults,
          children: data.children,
          totalPrice: total,
          status: "PENDING",
          paymentMethod: "STRIPE",
          travelerInfo: data.travelerInfo,
          specialRequests: data.specialRequests,
        },
      });

      return { booking: created, totalPrice: total, tourTitle: tour.title };
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toCents(totalPrice),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: data.travelerInfo.email,
      metadata: {
        bookingId: booking.id,
        userId: session.user.id,
        tourId: data.tourId,
      },
      description: `UEB3 Tours — ${tourTitle}`,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      amount: totalPrice,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create payment";
    console.error("[create-intent]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
