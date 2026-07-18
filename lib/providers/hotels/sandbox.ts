import type { HotelAvailabilityOffer, HotelAvailabilityQuery } from "./types";

function nightsBetween(checkIn: string, checkOut: string) {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  const n = Math.max(1, Math.round((b - a) / 86_400_000));
  return n;
}

const ROOM_TEMPLATES = [
  { roomName: "Standard King", board: "Room only", base: 85, refundable: true },
  { roomName: "Deluxe Twin", board: "Breakfast included", base: 110, refundable: true },
  { roomName: "Executive Suite", board: "Half board", base: 175, refundable: false },
];

/** Always-on availability generator for demos and when BedBank keys are absent. */
export function getSandboxHotelAvailability(
  q: HotelAvailabilityQuery
): HotelAvailabilityOffer[] {
  const nights = nightsBetween(q.checkIn, q.checkOut);
  const cityKey = q.city.trim().toLowerCase() || "city";
  const hotelLabel = q.hotelName?.trim() || `${q.city} Stay`;
  const adults = q.adults ?? 2;
  const demand = (cityKey.length + adults + nights) % 7;

  return ROOM_TEMPLATES.map((t, i) => {
    const pricePerNight = Math.round(t.base * (1 + demand * 0.04) * (1 + i * 0.08));
    return {
      id: `sandbox-${cityKey}-${i}-${q.checkIn}`,
      hotelId: `sandbox-${cityKey}`,
      name: hotelLabel,
      city: q.city,
      checkIn: q.checkIn,
      checkOut: q.checkOut,
      roomName: t.roomName,
      board: t.board,
      pricePerNight,
      currency: "USD" as const,
      provider: "sandbox" as const,
      refundable: t.refundable,
    };
  });
}
