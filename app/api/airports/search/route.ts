import { NextResponse } from "next/server";
import { searchCommercialAirports } from "@/lib/airports/commercial";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const limitRaw = Number(searchParams.get("limit") ?? "12");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 12;

  const results = searchCommercialAirports(q, limit);
  return NextResponse.json({
    query: q,
    count: results.length,
    results,
  });
}
