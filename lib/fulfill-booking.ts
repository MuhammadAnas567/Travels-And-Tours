import { prisma } from "@/lib/db";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { generateBookingReference } from "@/lib/stripe";
import { bookingTitle, type ProductSnapshot } from "@/lib/commerce";
import { formatDate, formatPrice } from "@/lib/utils";

/**
 * Idempotent payment finalization for all booking types.
 * Webhooks are the source of truth.
 */
export async function finalizePaidBooking({
  bookingId,
  paymentIntentId,
  stripeSessionId,
}: {
  bookingId?: string;
  paymentIntentId?: string;
  stripeSessionId?: string;
}) {
  if (!bookingId) {
    console.warn("[fulfill] No bookingId in metadata");
    return;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tour: true, tourDate: true, user: true },
  });

  if (!booking) {
    console.warn(`[fulfill] Booking ${bookingId} not found`);
    return;
  }

  if (booking.status === "CONFIRMED" && booking.bookingReference) {
    return;
  }

  const bookingReference = booking.bookingReference ?? generateBookingReference();
  const seatsNeeded = booking.adults + booking.children;

  if (booking.type === "TOUR" || booking.type === "PACKAGE") {
    if (!booking.tourDateId) throw new Error("Tour date missing");

    await prisma.$transaction(async (tx) => {
      const tourDate = await tx.tourDate.findUnique({
        where: { id: booking.tourDateId! },
      });
      if (!tourDate) throw new Error("Tour date not found");

      if (booking.status !== "CONFIRMED") {
        const seatsLeft = tourDate.seatsTotal - tourDate.seatsBooked;
        if (seatsNeeded > seatsLeft) throw new Error("Overbooking prevented");
        await tx.tourDate.update({
          where: { id: booking.tourDateId! },
          data: { seatsBooked: { increment: seatsNeeded } },
        });
      }

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          fulfillmentStatus: "FULFILLED",
          paymentIntentId: paymentIntentId ?? booking.paymentIntentId,
          stripeSessionId: stripeSessionId ?? booking.stripeSessionId,
          bookingReference,
          holdExpiresAt: null,
        },
      });

      if (booking.couponCode && booking.status !== "CONFIRMED") {
        await tx.coupon.updateMany({
          where: { code: booking.couponCode },
          data: { usageCount: { increment: 1 } },
        });
      }
    });
  } else {
    // FLIGHT / HOTEL / CAR / INSURANCE — flight seats soft-held at intent creation
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        fulfillmentStatus: "FULFILLED",
        paymentIntentId: paymentIntentId ?? booking.paymentIntentId,
        stripeSessionId: stripeSessionId ?? booking.stripeSessionId,
        bookingReference,
        holdExpiresAt: null,
      },
    });
  }

  const refreshed = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tour: true, tourDate: true, user: true },
  });
  if (!refreshed) return;

  const snapshot = refreshed.productSnapshot as ProductSnapshot | null;
  const travelerInfo = refreshed.travelerInfo as { name?: string; email?: string };
  const title =
    refreshed.tour?.title ?? bookingTitle(refreshed.type, snapshot ?? undefined);

  const startDate =
    refreshed.tourDate?.startDate != null
      ? formatDate(refreshed.tourDate.startDate)
      : snapshot?.startDate
        ? formatDate(new Date(snapshot.startDate))
        : "—";
  const endDate =
    refreshed.tourDate?.endDate != null
      ? formatDate(refreshed.tourDate.endDate)
      : snapshot?.endDate
        ? formatDate(new Date(snapshot.endDate))
        : "—";

  try {
    await sendBookingConfirmationEmail({
      to: travelerInfo.email ?? refreshed.user.email,
      bookingId: refreshed.id,
      bookingReference,
      tourTitle: title,
      startDate,
      endDate,
      totalPrice: formatPrice(Number(refreshed.totalPrice)),
      travelerName: travelerInfo.name ?? refreshed.user.name ?? "Traveler",
    });
  } catch (emailErr) {
    console.error("[fulfill] Confirmation email failed:", emailErr);
  }
}
