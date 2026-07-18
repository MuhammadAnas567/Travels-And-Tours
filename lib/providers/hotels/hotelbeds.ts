import { createHash } from "crypto";
import type { HotelAvailabilityOffer, HotelAvailabilityQuery } from "./types";
import { getSandboxHotelAvailability } from "./sandbox";

function isHotelbedsConfigured() {
  return !!(process.env.HOTELBEDS_API_KEY && process.env.HOTELBEDS_API_SECRET);
}

function hotelbedsBase() {
  return process.env.HOTELBEDS_ENV === "live"
    ? "https://api.hotelbeds.com"
    : "https://api.test.hotelbeds.com";
}

function signature() {
  const apiKey = process.env.HOTELBEDS_API_KEY!;
  const secret = process.env.HOTELBEDS_API_SECRET!;
  const ts = Math.floor(Date.now() / 1000);
  const hash = createHash("sha256").update(apiKey + secret + ts).digest("hex");
  return { apiKey, hash };
}

/**
 * Hotelbeds Availability API (test/live).
 * On any failure, falls back to sandbox offers so the UI never breaks.
 */
export async function getHotelbedsAvailability(
  q: HotelAvailabilityQuery
): Promise<HotelAvailabilityOffer[]> {
  if (!isHotelbedsConfigured()) {
    return getSandboxHotelAvailability(q);
  }

  try {
    const { apiKey, hash } = signature();
    // Hotels API availability — destination as city text search via hotels filter.
    // Full destination codes require Hotelbeds destinations content API;
    // for test keys we attempt a lightweight hotels search then map rates.
    const res = await fetch(`${hotelbedsBase()}/hotel-api/1.0/hotels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-key": apiKey,
        "X-Signature": hash,
        Accept: "application/json",
      },
      body: JSON.stringify({
        stay: { checkIn: q.checkIn, checkOut: q.checkOut },
        occupancies: [{ rooms: 1, adults: q.adults ?? 2, children: 0 }],
        // When destination code unknown, caller should use sandbox;
        // many test accounts expect a destination.code — without it we fall back.
        filter: { maxHotels: 5 },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn("[hotelbeds] availability", res.status, await res.text());
      return getSandboxHotelAvailability(q);
    }

    const data = (await res.json()) as {
      hotels?: {
        hotels?: Array<{
          code?: number;
          name?: string;
          destinationName?: string;
          minRate?: string;
          currency?: string;
          rooms?: Array<{
            name?: string;
            rates?: Array<{
              boardName?: string;
              net?: string;
              packing?: string;
              rateClass?: string;
            }>;
          }>;
        }>;
      };
    };

    const hotels = data.hotels?.hotels ?? [];
    if (!hotels.length) return getSandboxHotelAvailability(q);

    const offers: HotelAvailabilityOffer[] = [];
    for (const h of hotels) {
      const rooms = h.rooms ?? [{ name: "Standard", rates: [{ net: h.minRate, boardName: "RO" }] }];
      for (const room of rooms.slice(0, 2)) {
        const rate = room.rates?.[0];
        const net = Number(rate?.net ?? h.minRate ?? 0);
        if (!net) continue;
        offers.push({
          id: `hb-${h.code}-${room.name}`,
          hotelId: String(h.code ?? ""),
          name: h.name ?? q.hotelName ?? "Hotel",
          city: h.destinationName ?? q.city,
          checkIn: q.checkIn,
          checkOut: q.checkOut,
          roomName: room.name ?? "Room",
          board: rate?.boardName ?? "Room only",
          pricePerNight: Math.round(net),
          currency: "USD",
          provider: "hotelbeds",
          refundable: rate?.rateClass !== "NRF",
        });
      }
    }

    return offers.length ? offers : getSandboxHotelAvailability(q);
  } catch (e) {
    console.error("[hotelbeds]", e);
    return getSandboxHotelAvailability(q);
  }
}
