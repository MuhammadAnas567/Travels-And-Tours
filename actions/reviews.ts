"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { reviewSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function submitReview(data: {
  tourId: string;
  rating: number;
  comment: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Please sign in" };

  const parsed = reviewSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid review" };

  const completedBooking = await prisma.booking.findFirst({
    where: {
      userId: session.user.id,
      tourId: data.tourId,
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
  });

  if (!completedBooking) {
    return { error: "You can only review tours you have booked" };
  }

  await prisma.review.upsert({
    where: {
      userId_tourId: { userId: session.user.id, tourId: data.tourId },
    },
    create: {
      userId: session.user.id,
      tourId: data.tourId,
      rating: data.rating,
      comment: data.comment,
      approved: false,
    },
    update: {
      rating: data.rating,
      comment: data.comment,
      approved: false,
    },
  });

  revalidatePath(`/tours`);
  return { success: true };
}

export async function subscribeNewsletter(email: string) {
  if (!email || !email.includes("@")) return { error: "Invalid email" };
  const normalized = email.trim().toLowerCase();

  try {
    const { prisma, withDbTimeout } = await import("@/lib/db");
    const key = "newsletter_subscribers";
    const existing = await withDbTimeout(
      prisma.siteSettings.findUnique({ where: { key } }),
      null,
      2000
    );
    const list = Array.isArray(existing?.value)
      ? (existing.value as string[])
      : typeof existing?.value === "object" &&
          existing?.value !== null &&
          Array.isArray((existing.value as { emails?: string[] }).emails)
        ? ((existing.value as { emails: string[] }).emails)
        : [];

    if (!list.includes(normalized)) {
      list.push(normalized);
    }

    const saved = await withDbTimeout(
      prisma.siteSettings.upsert({
        where: { key },
        create: { key, value: { emails: list } },
        update: { value: { emails: list } },
      }),
      null,
      2000
    );

    if (!saved) {
      return {
        error: "Could not save your email right now. Please try again or contact us.",
      };
    }
    return { success: true };
  } catch (error) {
    console.error("[newsletter]", error);
    return {
      error: "Could not save your email right now. Please try again or contact us.",
    };
  }
}
