import { NextResponse } from "next/server";
import { flightBookRequestSchema } from "@/lib/validations";
import {
  sendContactEmail,
  sendFlightBookingConfirmationEmail,
} from "@/lib/email";

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

  const deskMessage = [
    `Flight booking request ${reference}`,
    `Route: ${data.routeLabel}`,
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

  try {
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
      });
    } catch (error) {
      console.error("[flights/book-request] passenger email failed:", error);
      return NextResponse.json(
        {
          error:
            "Could not send booking confirmation to your email. Check the address and try again.",
        },
        { status: 502 }
      );
    }

    if (!deskOk) {
      console.warn(
        `[flights/book-request] passenger confirmed (${reference}) but desk notify failed`
      );
    }

    return NextResponse.json({
      success: true,
      reference,
      deskNotified: deskOk,
    });
  } catch (error) {
    console.error("[flights/book-request]", error);
    return NextResponse.json(
      { error: "Booking request failed. Try again shortly." },
      { status: 500 }
    );
  }
}
