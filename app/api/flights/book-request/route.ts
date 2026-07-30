import { NextResponse } from "next/server";
import type { Currency, Prisma } from "@prisma/client";
import { flightBookRequestSchema } from "@/lib/validations";
import {
  sendContactEmail,
  sendFlightBookingConfirmationEmail,
} from "@/lib/email";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { resolveCheckoutUserId } from "@/lib/checkout-user";

const rateLimit = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + 60000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

function flightRequestReference() {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FLT-${part}`;
}

function toCurrency(value: string): Currency {
  const upper = value.toUpperCase();
  if (upper === "PKR" || upper === "USD" || upper === "EUR" || upper === "GBP") {
    return upper;
  }
  return "USD";
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = flightBookRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Check passenger details and try again." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const reference = flightRequestReference();
  const passport = data.passport?.trim();
  const notes = data.notes?.trim();
  const currency = toCurrency(data.currency ?? "USD");

  try {
    const session = await getSession();
    const userId = await resolveCheckoutUserId({
      sessionUserId: session?.user?.id,
      email: data.email,
      name: data.name,
    });

    const travelerInfo = {
      name: data.name,
      email: data.email.trim().toLowerCase(),
      phone: data.phone,
      passport: passport || undefined,
    };

    const productSnapshot = {
      title: `${data.airline} · ${data.routeLabel}`,
      subtitle: `${data.flightNumbers} · ${data.travellers} traveller${data.travellers === 1 ? "" : "s"}`,
      location: data.routeLabel,
      startDate: data.outboundDate,
      endDate: data.returnDate ?? data.outboundDate,
    };

    const reservationDetails = {
      source: "serpapi_request",
      routeLabel: data.routeLabel,
      airline: data.airline,
      flightNumbers: data.flightNumbers,
      departLabel: data.departLabel,
      arriveLabel: data.arriveLabel,
      fareLabel: data.fareLabel,
      compareAtPrice: data.compareAtPrice ?? null,
      stops: data.stops ?? null,
      durationMinutes: data.durationMinutes ?? null,
      origin: data.origin ?? null,
      destination: data.destination ?? null,
      outboundDate: data.outboundDate,
      returnDate: data.returnDate ?? null,
      passport: passport || null,
    };

    const booking = await prisma.booking.create({
      data: {
        userId,
        type: "FLIGHT",
        adults: data.travellers,
        children: 0,
        totalPrice: data.price,
        currency,
        status: "PENDING",
        fulfillmentStatus: "PENDING",
        paymentMethod: "BANK_TRANSFER",
        bookingReference: reference,
        travelerInfo: travelerInfo as Prisma.InputJsonValue,
        specialRequests: notes || null,
        productSnapshot: productSnapshot as Prisma.InputJsonValue,
        reservationDetails: reservationDetails as Prisma.InputJsonValue,
      },
    });

    const deskMessage = [
      `Flight booking request ${reference}`,
      `Booking ID: ${booking.id}`,
      `Route: ${data.routeLabel}`,
      `Travel date: ${data.outboundDate}${data.returnDate ? ` → ${data.returnDate}` : ""}`,
      `Airline: ${data.airline}`,
      `Flight: ${data.flightNumbers}`,
      `Depart: ${data.departLabel}`,
      `Arrive: ${data.arriveLabel}`,
      `Fare: ${data.fareLabel}`,
      `Travellers: ${data.travellers}`,
      `Phone: ${data.phone}`,
      passport ? `Passport / CNIC: ${passport}` : null,
      notes ? `Notes: ${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    let deskOk = false;
    try {
      deskOk = await sendContactEmail({
        name: data.name,
        email: data.email,
        subject: `Flight booking: ${data.flightNumbers} ${data.routeLabel} (${reference})`,
        message: deskMessage,
      });
    } catch (error) {
      console.error("[flights/book-request] desk email failed:", error);
    }

    let passengerEmailed = false;
    try {
      await sendFlightBookingConfirmationEmail({
        to: data.email,
        travelerName: data.name,
        reference,
        routeLabel: data.routeLabel,
        airline: data.airline,
        flightNumbers: data.flightNumbers,
        departLabel: data.departLabel,
        arriveLabel: data.arriveLabel,
        fareLabel: data.fareLabel,
        travellers: data.travellers,
        travelDateLabel: data.returnDate
          ? `${data.outboundDate} → ${data.returnDate}`
          : data.outboundDate,
      });
      passengerEmailed = true;
    } catch (error) {
      console.error("[flights/book-request] passenger email failed:", error);
    }

    return NextResponse.json({
      success: true,
      reference,
      bookingId: booking.id,
      deskNotified: deskOk,
      passengerEmailed,
    });
  } catch (error) {
    console.error("[flights/book-request]", error);
    return NextResponse.json(
      { error: "Booking could not be saved. Try again shortly." },
      { status: 500 }
    );
  }
}
