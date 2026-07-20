import { NextResponse } from "next/server";
import { searchFlights } from "@/lib/providers/flights";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const date = searchParams.get("date") ?? undefined;
  const adults = Number(searchParams.get("adults") ?? "1");
  const cabin = searchParams.get("cabin") ?? undefined;

  const flights = await searchFlights({ from, to, date, adults, cabin });
  const live = flights.some((f) => f.source === "duffel" || f.source === "amadeus");
  const provider = flights.some((f) => f.source === "duffel")
    ? "duffel"
    : flights.some((f) => f.source === "amadeus")
      ? "amadeus"
      : "catalog";
  return NextResponse.json({
    count: flights.length,
    source: live ? `${provider}+catalog` : "catalog",
    flights,
  });
}
