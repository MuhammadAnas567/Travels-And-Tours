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
      status: "COMPLETED",
    },
  });

  if (!completedBooking) {
    return { error: "You can only review tours you have completed" };
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
  // In production, integrate with email marketing service
  console.log(`Newsletter subscription: ${email}`);
  return { success: true };
}
