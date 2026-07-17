import { NextResponse } from "next/server";
import { getHotelAvailability } from "@/lib/providers/hotels";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? "";
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";
  const adults = Number(searchParams.get("adults") ?? "2");
  const hotelName = searchParams.get("hotelName") ?? undefined;

  if (!city || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "city, checkIn, checkOut required" },
      { status: 400 }
    );
  }

  const result = await getHotelAvailability({
    city,
    checkIn,
    checkOut,
    adults,
    hotelName,
  });

  return NextResponse.json(result);
}
