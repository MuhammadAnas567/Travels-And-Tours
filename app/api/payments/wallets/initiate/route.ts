import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";
import { initiateJazzCashPayment } from "@/lib/payments/jazzcash";
import { initiateEasyPaisaPayment } from "@/lib/payments/easypaisa";

const bodySchema = z.object({
  bookingId: z.string().min(1),
  provider: z.enum(["jazzcash", "easypaisa"]),
});

/**
 * POST /api/payments/wallets/initiate
 * Auth required. Returns { redirectUrl } for JazzCash / EasyPaisa (sandbox or live).
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { bookingId, provider } = parsed.data;

    if (provider === "jazzcash" && !siteConfig.jazzcash.enabled) {
      return NextResponse.json({ error: "JazzCash is not enabled" }, { status: 503 });
    }
    if (provider === "easypaisa" && !siteConfig.easypaisa.enabled) {
      return NextResponse.json({ error: "EasyPaisa is not enabled" }, { status: 503 });
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: session.user.id },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.status === "CONFIRMED" || booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking cannot be paid" }, { status: 400 });
    }

    const paymentMethod = provider === "jazzcash" ? "JAZZCASH" : "EASYPAISA";
    if (booking.paymentMethod !== paymentMethod) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentMethod },
      });
    }

    const result =
      provider === "jazzcash"
        ? initiateJazzCashPayment({
            bookingId: booking.id,
            amount: booking.totalPrice,
            currency: booking.currency,
            description: `Booking ${booking.bookingReference ?? booking.id}`,
          })
        : initiateEasyPaisaPayment({
            bookingId: booking.id,
            amount: booking.totalPrice,
            currency: booking.currency,
            description: `Booking ${booking.bookingReference ?? booking.id}`,
          });

    return NextResponse.json({
      redirectUrl: result.redirectUrl,
      sandbox: result.sandbox,
    });
  } catch (error) {
    console.error("[wallets/initiate]", error);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}
