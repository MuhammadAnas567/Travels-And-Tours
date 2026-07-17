"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Coupon, CouponType } from "@prisma/client";

export type CouponPreview = {
  code: string;
  type: CouponType;
  value: number;
  discountAmount: number;
  finalTotal: number;
};

function computeDiscount(coupon: Coupon, subtotal: number): number {
  if (coupon.type === "PERCENT") {
    return Math.round((subtotal * coupon.value) / 100);
  }
  return Math.min(coupon.value, subtotal);
}

export async function validateCouponCode(input: {
  code: string;
  tourId: string;
  subtotal: number;
}): Promise<{ ok: true; coupon: CouponPreview } | { ok: false; error: string }> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a coupon code" };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) {
    return { ok: false, error: "Invalid or inactive coupon" };
  }

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validTo) {
    return { ok: false, error: "This coupon has expired" };
  }

  if (coupon.minSpend != null && input.subtotal < coupon.minSpend) {
    return {
      ok: false,
      error: `Minimum spend is ${coupon.minSpend} USD for this coupon`,
    };
  }

  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    return { ok: false, error: "This coupon has reached its usage limit" };
  }

  if (
    coupon.applicableTours.length > 0 &&
    !coupon.applicableTours.includes(input.tourId)
  ) {
    return { ok: false, error: "Coupon not valid for this tour" };
  }

  const session = await getSession();
  if (session?.user?.id && coupon.perUserLimit > 0) {
    const used = await prisma.booking.count({
      where: {
        userId: session.user.id,
        couponCode: code,
        status: { in: ["CONFIRMED", "PENDING", "PENDING_VERIFICATION", "DEPOSIT_PAID", "COMPLETED"] },
      },
    });
    if (used >= coupon.perUserLimit) {
      return { ok: false, error: "You have already used this coupon" };
    }
  }

  const discountAmount = computeDiscount(coupon, input.subtotal);
  const finalTotal = Math.max(0, Math.round((input.subtotal - discountAmount) * 100) / 100);

  return {
    ok: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
      finalTotal,
    },
  };
}

export async function applyCouponToTotal(
  code: string | undefined,
  tourId: string,
  subtotal: number
): Promise<{ total: number; couponCode?: string; discountAmount: number }> {
  if (!code?.trim()) {
    return { total: subtotal, discountAmount: 0 };
  }
  const result = await validateCouponCode({ code, tourId, subtotal });
  if (!result.ok) {
    throw new Error(result.error);
  }
  return {
    total: result.coupon.finalTotal,
    couponCode: result.coupon.code,
    discountAmount: result.coupon.discountAmount,
  };
}
