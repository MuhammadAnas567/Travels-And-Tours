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
import { applyCouponToTotal } from "@/actions/coupons";
import { holdExpiresAt } from "@/lib/commerce";
import { resolveCheckoutUserId } from "@/lib/checkout-user";

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
  couponCode: z.string().optional(),
});

/**
 * POST /api/payments/create-intent
 * Guest checkout supported — creates user from traveller email when needed.
 */
export async function POST(req: Request) {
  try {
    if (!isStripeConfigured() || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      return NextResponse.json(
        { error: "Online payments are not ready yet. Please try again shortly." },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Payments temporarily unavailable" }, { status: 503 });
    }

    const session = await getSession();
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const userId = await resolveCheckoutUserId({
      sessionUserId: session?.user?.id,
      email: data.travelerInfo.email,
      name: data.travelerInfo.name,
    });

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

    const tourPre = await prisma.tour.findUnique({ where: { id: data.tourId } });
    if (!tourPre || tourPre.status !== "ACTIVE") {
      return NextResponse.json({ error: "Tour not available" }, { status: 400 });
    }
    const subtotalPre = calculateBookingTotal(
      getTourUnitPrice(tourPre),
      data.adults,
      data.children
    );
    let priced: { total: number; couponCode?: string; discountAmount: number };
    try {
      priced = await applyCouponToTotal(data.couponCode, data.tourId, subtotalPre);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Invalid coupon" },
        { status: 400 }
      );
    }

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

      const created = await tx.booking.create({
        data: {
          userId,
          type: "TOUR",
          tourId: data.tourId,
          tourDateId: data.tourDateId,
          adults: data.adults,
          children: data.children,
          totalPrice: priced.total,
          couponCode: priced.couponCode,
          status: "PENDING",
          fulfillmentStatus: "HELD",
          paymentMethod: "STRIPE",
          travelerInfo: data.travelerInfo,
          specialRequests: data.specialRequests,
          holdExpiresAt: holdExpiresAt(),
          productSnapshot: {
            title: tour.title,
            subtitle: `${tour.location}, ${tour.country}`,
            startDate: tourDate.startDate.toISOString(),
            endDate: tourDate.endDate.toISOString(),
            location: `${tour.location}, ${tour.country}`,
            image: tour.images?.[0],
          },
        },
      });

      return { booking: created, totalPrice: priced.total, tourTitle: tour.title };
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toCents(totalPrice),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: data.travelerInfo.email,
      metadata: {
        bookingId: booking.id,
        userId,
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
