import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/payments/wallets/sandbox?provider=jazzcash|easypaisa&bookingId=...
 * Sandbox-only success simulator — confirms booking and redirects to success page.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("bookingId");
  const provider = url.searchParams.get("provider");

  const jazzSandbox = process.env.JAZZCASH_SANDBOX !== "false";
  const easySandbox = process.env.EASYPAISA_SANDBOX !== "false";
  const sandboxOk =
    (provider === "jazzcash" && jazzSandbox) ||
    (provider === "easypaisa" && easySandbox);

  if (!sandboxOk) {
    return NextResponse.json(
      { error: "Wallet sandbox is disabled for this provider" },
      { status: 403 }
    );
  }

  if (!bookingId || !provider) {
    return NextResponse.json({ error: "Missing bookingId or provider" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.redirect(new URL("/dashboard/bookings", appUrl));
    }

    if (booking.status !== "CONFIRMED") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          paymentMethod: provider === "jazzcash" ? "JAZZCASH" : "EASYPAISA",
          verifiedAt: new Date(),
          verifiedBy: `sandbox:${provider}`,
        },
      });
    }

    return NextResponse.redirect(
      new URL(`/booking/success?booking_id=${encodeURIComponent(bookingId)}`, appUrl)
    );
  } catch (error) {
    console.error("[wallets/sandbox]", error);
    return NextResponse.redirect(new URL("/dashboard/bookings", appUrl));
  }
}
