"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import {
  calculateBookingTotal,
  getTourUnitPrice,
  toCents,
} from "@/lib/booking";
import { bookingStep1Schema, bookingStep2Schema } from "@/lib/validations";
import type { TravelerInfo } from "@/types";
import { sendBookingPendingEmail } from "@/lib/email";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export async function calculatePrice(
  tourId: string,
  tourDateId: string,
  adults: number,
  children: number
) {
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  const tourDate = await prisma.tourDate.findUnique({ where: { id: tourDateId } });

  if (!tour || !tourDate || tourDate.tourId !== tourId) {
    return { error: "Invalid tour or date" };
  }

  const unitPrice = getTourUnitPrice(tour);
  const total = calculateBookingTotal(unitPrice, adults, children);
  const seatsNeeded = adults + children;
  const seatsLeft = tourDate.seatsTotal - tourDate.seatsBooked;

  if (seatsNeeded > seatsLeft) {
    return { error: `Only ${seatsLeft} seats available` };
  }

  return {
    unitPrice,
    total,
    childUnitPrice: unitPrice * 0.7,
    seatsLeft,
  };
}

export async function createBookingAndCheckout(data: {
  tourId: string;
  tourDateId: string;
  adults: number;
  children: number;
  travelerInfo: TravelerInfo;
  specialRequests?: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Please sign in to book" };

  const step1 = bookingStep1Schema.safeParse({
    tourDateId: data.tourDateId,
    adults: data.adults,
    children: data.children,
  });
  const step2 = bookingStep2Schema.safeParse(data.travelerInfo);

  if (!step1.success || !step2.success) {
    return { error: "Invalid booking data" };
  }

  const { tourId, tourDateId, adults, children } = data;
  const seatsNeeded = adults + children;

  const result = await prisma.$transaction(async (tx) => {
    const tour = await tx.tour.findUnique({ where: { id: tourId } });
    const tourDate = await tx.tourDate.findUnique({ where: { id: tourDateId } });

    if (!tour || tour.status !== "ACTIVE") throw new Error("Tour not available");
    if (!tourDate || tourDate.tourId !== tourId) throw new Error("Invalid date");

    const seatsLeft = tourDate.seatsTotal - tourDate.seatsBooked;
    if (seatsNeeded > seatsLeft) {
      throw new Error(`Only ${seatsLeft} seats available`);
    }

    const unitPrice = getTourUnitPrice(tour);
    const totalPrice = calculateBookingTotal(unitPrice, adults, children);

    const booking = await tx.booking.create({
      data: {
        userId: session.user!.id,
        tourId,
        tourDateId,
        adults,
        children,
        totalPrice,
        status: "PENDING",
        travelerInfo: data.travelerInfo,
        specialRequests: data.specialRequests,
      },
      include: { tour: true, tourDate: true },
    });

    return { booking, totalPrice };
  });

  // Legacy Checkout Session path (kept for compatibility).
  // Preferred flow: POST /api/payments/create-intent + Payment Element.
  const stripe = getStripe();
  if (!stripe) {
    return { error: "Payments are not configured. Set STRIPE_SECRET_KEY." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: data.travelerInfo.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: result.booking.tour.title,
            description: `Departure: ${result.booking.tourDate.startDate.toLocaleDateString()}`,
          },
          unit_amount: toCents(Number(result.totalPrice)),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: result.booking.id,
    },
    success_url: `${appUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/booking/cancel?booking_id=${result.booking.id}`,
  });

  await prisma.booking.update({
    where: { id: result.booking.id },
    data: {
      stripeSessionId: checkoutSession.id,
      paymentIntentId: checkoutSession.payment_intent as string | undefined,
    },
  });

  return { url: checkoutSession.url };
}

export async function cancelBooking(bookingId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: session.user.id },
    include: { tourDate: true },
  });

  if (!booking) return { error: "Booking not found" };
  if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
    return { error: "Cannot cancel this booking" };
  }

  // Only allow cancellation if departure is more than 7 days away
  const daysUntil = Math.ceil(
    (booking.tourDate.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntil < 7) {
    return { error: "Cancellation not allowed within 7 days of departure" };
  }

  await prisma.$transaction(async (tx) => {
    if (booking.status === "CONFIRMED") {
      await tx.tourDate.update({
        where: { id: booking.tourDateId },
        data: {
          seatsBooked: {
            decrement: booking.adults + booking.children,
          },
        },
      });
    }
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
  });

  return { success: true };
}

export async function createBookingWithLocalPayment(data: {
  tourId: string;
  tourDateId: string;
  adults: number;
  children: number;
  travelerInfo: TravelerInfo;
  specialRequests?: string;
  paymentMethod: "BANK_TRANSFER" | "EASYPAISA" | "JAZZCASH";
}) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Please sign in to book" };

  if (data.paymentMethod === "BANK_TRANSFER" && !siteConfig.bankTransfer.enabled) {
    return { error: "Bank transfer is not available right now" };
  }
  if (data.paymentMethod === "EASYPAISA" && !siteConfig.easypaisa.enabled) {
    return { error: "EasyPaisa is not available right now" };
  }
  if (data.paymentMethod === "JAZZCASH" && !siteConfig.jazzcash.enabled) {
    return { error: "JazzCash is not available right now" };
  }

  const seatsNeeded = data.adults + data.children;

  const result = await prisma.$transaction(async (tx) => {
    const tour = await tx.tour.findUnique({ where: { id: data.tourId } });
    const tourDate = await tx.tourDate.findUnique({ where: { id: data.tourDateId } });

    if (!tour || tour.status !== "ACTIVE") throw new Error("Tour not available");
    if (!tourDate || tourDate.tourId !== data.tourId) throw new Error("Invalid date");

    const seatsLeft = tourDate.seatsTotal - tourDate.seatsBooked;
    if (seatsNeeded > seatsLeft) throw new Error(`Only ${seatsLeft} seats available`);

    const unitPrice = getTourUnitPrice(tour);
    const totalPrice = calculateBookingTotal(unitPrice, data.adults, data.children);

    const booking = await tx.booking.create({
      data: {
        userId: session.user!.id,
        tourId: data.tourId,
        tourDateId: data.tourDateId,
        adults: data.adults,
        children: data.children,
        totalPrice,
        status: "PENDING_VERIFICATION",
        paymentMethod: data.paymentMethod,
        travelerInfo: data.travelerInfo,
        specialRequests: data.specialRequests,
      },
    });

    return { booking, totalPrice, tourTitle: tour.title };
  });

  try {
    await sendBookingPendingEmail({
      to: data.travelerInfo.email,
      bookingId: result.booking.id,
      tourTitle: result.tourTitle,
      totalPrice: formatPrice(result.totalPrice),
      travelerName: data.travelerInfo.name,
      paymentMethod: data.paymentMethod.replace("_", " "),
    });
  } catch {
    // never block booking on email
  }

  return {
    bookingId: result.booking.id,
    totalPrice: result.totalPrice,
    redirectUrl: `/booking/pending/${result.booking.id}`,
  };
}

export async function uploadPaymentProof(bookingId: string, proofUrl: string) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: session.user.id, status: "PENDING_VERIFICATION" },
  });
  if (!booking) return { error: "Booking not found" };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentProofUrl: proofUrl },
  });

  return { success: true };
}

export async function verifyBookingPayment(bookingId: string) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { tourDate: true },
    });
    if (!booking || booking.status !== "PENDING_VERIFICATION") {
      throw new Error("Invalid booking");
    }

    const seatsNeeded = booking.adults + booking.children;
    const seatsLeft = booking.tourDate.seatsTotal - booking.tourDate.seatsBooked;
    if (seatsNeeded > seatsLeft) throw new Error("Not enough seats");

    await tx.tourDate.update({
      where: { id: booking.tourDateId },
      data: { seatsBooked: { increment: seatsNeeded } },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        verifiedAt: new Date(),
        verifiedBy: session.user!.id,
      },
    });
  });

  return { success: true };
}
