import { NextResponse } from "next/server";
import { z } from "zod";
import { searchSerpApiFlights } from "@/lib/flights/serpapi";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const payload = await searchSerpApiFlights({
      origin: searchParams.get("origin") ?? "",
      destination: searchParams.get("destination") ?? "",
      outboundDate: searchParams.get("outboundDate") ?? "",
      returnDate: searchParams.get("returnDate"),
      tripType: searchParams.get("tripType") ?? "roundtrip",
      adults: searchParams.get("adults") ?? "1",
      children: searchParams.get("children") ?? "0",
      cabinClass: searchParams.get("cabinClass") ?? "1",
      currency: searchParams.get("currency") ?? "PKR",
    });

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Invalid flight search parameters",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Flight search failed",
      },
      { status: 500 }
    );
  }
}
