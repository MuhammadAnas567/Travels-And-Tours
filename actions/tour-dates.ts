"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") return null;
  return session;
}

export async function addTourDate(tourId: string, formData: FormData) {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const seatsTotal = Number(formData.get("seatsTotal") ?? 0);

  if (!startDate || !endDate || seatsTotal < 1) {
    return { error: "Start date, end date, and seats are required" };
  }
  if (new Date(endDate) < new Date(startDate)) {
    return { error: "End date must be on or after start date" };
  }

  await prisma.tourDate.create({
    data: {
      tourId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      seatsTotal,
      seatsBooked: 0,
    },
  });

  revalidatePath(`/admin/tours/${tourId}/edit`);
  revalidatePath(`/tours`);
  return { success: true };
}

export async function deleteTourDate(tourDateId: string, tourId: string) {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const date = await prisma.tourDate.findUnique({ where: { id: tourDateId } });
  if (!date || date.tourId !== tourId) return { error: "Date not found" };
  if (date.seatsBooked > 0) {
    return { error: "Cannot delete a departure with existing bookings" };
  }

  await prisma.tourDate.delete({ where: { id: tourDateId } });
  revalidatePath(`/admin/tours/${tourId}/edit`);
  return { success: true };
}
