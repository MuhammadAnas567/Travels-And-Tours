"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

const couponSchema = z.object({
  code: z.string().min(3).max(32),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().positive(),
  minSpend: z.coerce.number().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  validFrom: z.string().min(1),
  validTo: z.string().min(1),
  isActive: z.coerce.boolean().optional(),
});

export async function createCoupon(formData: FormData) {
  await requireAdmin();
  const parsed = couponSchema.safeParse({
    code: String(formData.get("code") ?? "").toUpperCase(),
    type: formData.get("type"),
    value: formData.get("value"),
    minSpend: formData.get("minSpend") || undefined,
    usageLimit: formData.get("usageLimit") || undefined,
    validFrom: formData.get("validFrom"),
    validTo: formData.get("validTo"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { error: "Invalid coupon data" };
  }

  const data = parsed.data;
  if (data.type === "PERCENT" && data.value > 100) {
    return { error: "Percent cannot exceed 100" };
  }

  await prisma.coupon.create({
    data: {
      code: data.code,
      type: data.type,
      value: data.value,
      minSpend: data.minSpend,
      usageLimit: data.usageLimit,
      validFrom: new Date(data.validFrom),
      validTo: new Date(data.validTo),
      isActive: data.isActive ?? true,
      applicableTours: [],
    },
  });

  revalidatePath("/admin/coupons");
  revalidatePath("/deals");
  return { success: true };
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/coupons");
  revalidatePath("/deals");
  return { success: true };
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  revalidatePath("/deals");
  return { success: true };
}
