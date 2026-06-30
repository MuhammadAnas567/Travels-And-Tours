"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { tourSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { TourCategory, TourStatus, BookingStatus } from "@prisma/client";

export async function createTour(formData: FormData) {
  await requireAdmin();

  const data = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    location: formData.get("location") as string,
    country: formData.get("country") as string,
    category: formData.get("category") as TourCategory,
    durationDays: Number(formData.get("durationDays")),
    price: Number(formData.get("price")),
    discountPrice: formData.get("discountPrice")
      ? Number(formData.get("discountPrice"))
      : null,
    images: (formData.get("images") as string).split("\n").filter(Boolean),
    itinerary: JSON.parse((formData.get("itinerary") as string) || "[]"),
    included: (formData.get("included") as string).split("\n").filter(Boolean),
    excluded: (formData.get("excluded") as string).split("\n").filter(Boolean),
    maxGroupSize: Number(formData.get("maxGroupSize")),
    status: formData.get("status") as TourStatus,
  };

  const parsed = tourSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid tour data" };

  await prisma.tour.create({ data: parsed.data });
  revalidatePath("/tours");
  revalidatePath("/admin/tours");
  return { success: true };
}

export async function updateTour(id: string, formData: FormData) {
  await requireAdmin();

  const data = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    location: formData.get("location") as string,
    country: formData.get("country") as string,
    category: formData.get("category") as TourCategory,
    durationDays: Number(formData.get("durationDays")),
    price: Number(formData.get("price")),
    discountPrice: formData.get("discountPrice")
      ? Number(formData.get("discountPrice"))
      : null,
    images: (formData.get("images") as string).split("\n").filter(Boolean),
    itinerary: JSON.parse((formData.get("itinerary") as string) || "[]"),
    included: (formData.get("included") as string).split("\n").filter(Boolean),
    excluded: (formData.get("excluded") as string).split("\n").filter(Boolean),
    maxGroupSize: Number(formData.get("maxGroupSize")),
    status: formData.get("status") as TourStatus,
  };

  const parsed = tourSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid tour data" };

  await prisma.tour.update({ where: { id }, data: parsed.data });
  revalidatePath("/tours");
  revalidatePath("/admin/tours");
  return { success: true };
}

export async function deleteTour(id: string) {
  await requireAdmin();
  await prisma.tour.delete({ where: { id } });
  revalidatePath("/admin/tours");
  return { success: true };
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
) {
  await requireAdmin();
  await prisma.booking.update({ where: { id: bookingId }, data: { status } });
  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function refundBooking(bookingId: string) {
  await requireAdmin();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tourDate: true },
  });

  if (!booking?.paymentIntentId) return { error: "No payment to refund" };

  await getStripe().refunds.create({
    payment_intent: booking.paymentIntentId,
  });

  await prisma.$transaction(async (tx) => {
    if (booking.status === "CONFIRMED") {
      await tx.tourDate.update({
        where: { id: booking.tourDateId },
        data: { seatsBooked: { decrement: booking.adults + booking.children } },
      });
    }
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
  });

  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function moderateReview(reviewId: string, approved: boolean) {
  await requireAdmin();
  await prisma.review.update({ where: { id: reviewId }, data: { approved } });

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (review) {
    const avg = await prisma.review.aggregate({
      where: { tourId: review.tourId, approved: true },
      _avg: { rating: true },
    });
    await prisma.tour.update({
      where: { id: review.tourId },
      data: { avgRating: avg._avg.rating ?? 0 },
    });
  }

  revalidatePath("/admin/reviews");
  return { success: true };
}
