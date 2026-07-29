import { NextResponse } from "next/server";
import { fetchFlightBookingOptions } from "@/lib/flights/serpapi";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingToken = searchParams.get("bookingToken") ?? "";
    const currency = searchParams.get("currency") ?? "PKR";

    if (!bookingToken.trim()) {
      return NextResponse.json(
        {
          error: "bookingToken is required",
        },
        { status: 400 }
      );
    }

    const payload = await fetchFlightBookingOptions({
      bookingToken,
      currency,
    });

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Booking options lookup failed",
      },
      { status: 500 }
    );
  }
}
