import { NextResponse } from "next/server";
import { fetchReturnFlights } from "@/lib/flights/serpapi";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departureToken = searchParams.get("departureToken") ?? "";
    const origin = searchParams.get("origin") ?? "";
    const destination = searchParams.get("destination") ?? "";
    const outboundDate = searchParams.get("outboundDate") ?? "";
    const returnDate = searchParams.get("returnDate") ?? "";

    if (!departureToken.trim()) {
      return NextResponse.json({ error: "departureToken is required" }, { status: 400 });
    }
    if (!origin || !destination || !outboundDate || !returnDate) {
      return NextResponse.json(
        {
          error: "origin, destination, outboundDate, and returnDate are required for return flights",
        },
        { status: 400 }
      );
    }

    // Round-trip return lookup costs a SerpApi credit — only invoked after Select.
    const payload = await fetchReturnFlights({
      departureToken,
      origin,
      destination,
      outboundDate,
      returnDate,
      adults: Number(searchParams.get("adults") ?? "1"),
      children: Number(searchParams.get("children") ?? "0"),
      cabinClass: Number(searchParams.get("cabinClass") ?? "1"),
      currency: searchParams.get("currency") ?? "PKR",
    });

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Return flight lookup failed",
      },
      { status: 500 }
    );
  }
}
