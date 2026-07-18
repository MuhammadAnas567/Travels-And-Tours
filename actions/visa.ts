"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { getContactInbox } from "@/lib/site-config";
import { z } from "zod";
import type { VisaInquiryStatus } from "@prisma/client";

const inquirySchema = z.object({
  visaInfoId: z.string().min(1),
  country: z.string().min(1),
  travelDate: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export async function submitVisaInquiry(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Please sign in to request visa assistance" };
  }

  const parsed = inquirySchema.safeParse({
    visaInfoId: formData.get("visaInfoId"),
    country: formData.get("country"),
    travelDate: formData.get("travelDate") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Invalid form data" };
  }

  const { visaInfoId, country, travelDate, notes } = parsed.data;

  const visa = await prisma.visaInfo.findUnique({ where: { id: visaInfoId } });
  if (!visa) return { error: "Visa information not found" };

  const inquiry = await prisma.visaInquiry.create({
    data: {
      userId: session.user.id,
      visaInfoId,
      country,
      travelDate: travelDate ? new Date(travelDate) : null,
      notes,
    },
    include: { user: true },
  });

  await sendEmail({
    to: getContactInbox(),
    subject: `New visa inquiry: ${country}`,
    html: `
      <h2>New Visa Assistance Request</h2>
      <p><strong>Country:</strong> ${country}</p>
      <p><strong>User:</strong> ${inquiry.user.name ?? ""} (${inquiry.user.email})</p>
      <p><strong>Travel date:</strong> ${travelDate ?? "Not specified"}</p>
      <p><strong>Notes:</strong> ${notes ?? "—"}</p>
    `,
  }).catch(() => {});

  revalidatePath("/dashboard");
  revalidatePath("/admin/visa-inquiries");
  return { success: true, id: inquiry.id };
}

export async function updateVisaInquiryStatus(
  id: string,
  status: VisaInquiryStatus,
  adminNotes?: string
) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  await prisma.visaInquiry.update({
    where: { id },
    data: { status, adminNotes },
  });

  await prisma.auditLog.create({
    data: {
      adminId: session.user.id,
      action: "UPDATE_VISA_INQUIRY",
      entity: "VisaInquiry",
      entityId: id,
      details: { status, adminNotes },
    },
  });

  revalidatePath("/admin/visa-inquiries");
  revalidatePath("/dashboard");
  return { success: true };
}
