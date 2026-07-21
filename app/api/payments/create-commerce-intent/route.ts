import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { connectDB } from "@/lib/db/connect";
import { getFlightById } from "@/lib/data/catalog";
import { Flight } from "@/lib/models/Flight";
import { Hotel } from "@/lib/models/Hotel";
import { resolveCheckoutUserId } from "@/lib/checkout-user";
import { isStripeConfigured, getStripe } from "@/lib/stripe";
import { toCents } from "@/lib/booking";
import {
  currencyToStripe,
  daysBetween,
  holdExpiresAt,
  insurancePremium,
  nightsBetween,
  type FlightReservation,
  type HotelReservation,
  type CarReservation,
} from "@/lib/commerce";

const travelerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
});

const insuranceSchema = z
  .object({
    selected: z.boolean(),
    plan: z.enum(["basic", "plus"]).default("basic"),
  })
  .optional();

const flightBody = z.object({
  type: z.literal("FLIGHT"),
  flightId: z.string().min(1),
  cabin: z.enum(["economy", "business", "first"]),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(8).default(0),
  passengers: z
    .array(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        dateOfBirth: z.string().optional(),
      })
    )
    .min(1),
  travelerInfo: travelerSchema,
  specialRequests: z.string().optional(),
  insurance: insuranceSchema,
});

const hotelBody = z.object({
  type: z.literal("HOTEL"),
  hotelId: z.string().min(1),
  roomName: z.string().min(1),
  checkIn: z.string().min(8),
  checkOut: z.string().min(8),
  adults: z.number().int().min(1).max(8),
  children: z.number().int().min(0).max(6).default(0),
  pricePerNight: z.number().positive(),
  travelerInfo: travelerSchema,
  specialRequests: z.string().optional(),
  insurance: insuranceSchema,
});

const carBody = z.object({
  type: z.literal("CAR"),
  carId: z.string().min(1),
  pickupLocation: z.string().min(2),
  pickupDate: z.string().min(8),
  returnDate: z.string().min(8),
  travelerInfo: travelerSchema,
  specialRequests: z.string().optional(),
  insurance: insuranceSchema,
});

const packageBody = z.object({
  type: z.literal("PACKAGE"),
  tourId: z.string().min(1),
  tourDateId: z.string().min(1),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(20).default(0),
  travelerInfo: travelerSchema,
  specialRequests: z.string().optional(),
  insurance: insuranceSchema,
});

const bodySchema = z.discriminatedUnion("type", [
  flightBody,
  hotelBody,
  carBody,
  packageBody,
]);

/**
 * POST /api/payments/create-commerce-intent
 * Unified Stripe PaymentIntent for flights, hotels, cars, packages.
 */
export async function POST(req: Request) {
  let heldFlightId: string | null = null;
  let heldPax = 0;

  try {
    if (!isStripeConfigured() || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      return NextResponse.json(
        {
          error:
            "Online payments are not ready yet. Please try again shortly or contact support.",
        },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Payments temporarily unavailable" }, { status: 503 });
    }

    const session = await getSession();
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const userId = await resolveCheckoutUserId({
      sessionUserId: session?.user?.id,
      email: data.travelerInfo.email,
      name: data.travelerInfo.name,
    });

    let subtotal = 0;
    let title = "";
    let productSnapshot: Prisma.InputJsonValue = {};
    let reservationDetails: Prisma.InputJsonValue = {};
    let adults = 1;
    let children = 0;
    let tourId: string | undefined;
    let tourDateId: string | undefined;
    const bookingType = data.type;

    if (data.type === "FLIGHT") {
      const flight = await getFlightById(data.flightId);
      if (!flight) {
        return NextResponse.json({ error: "Flight not found" }, { status: 404 });
      }
      const cabin = data.cabin;
      const prices = (flight.priceByClass ?? { economy: 0 }) as {
        economy?: number;
        business?: number;
        first?: number;
      };
      const economy = Number(prices.economy ?? 0);
      const business = Number(prices.business ?? economy);
      const first = Number(prices.first ?? business);
      const unit =
        cabin === "first" ? first : cabin === "business" ? business : economy;
      if (!Number.isFinite(unit) || unit <= 0) {
        return NextResponse.json({ error: "Flight fare unavailable" }, { status: 400 });
      }

      adults = data.adults;
      children = data.children;
      const pax = adults + children;
      if (data.passengers.length < pax) {
        return NextResponse.json(
          { error: `Add passenger details for all ${pax} travellers` },
          { status: 400 }
        );
      }
      const seats =
        typeof flight.seatsAvailable === "number" ? flight.seatsAvailable : 100;
      if (seats < pax) {
        return NextResponse.json({ error: "Not enough seats left on this flight" }, { status: 400 });
      }

      subtotal = unit * pax;
      title = `${flight.airline} ${flight.flightNumber}`;
      const reservation: FlightReservation = {
        flightId: String(flight._id),
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        from: flight.from,
        to: flight.to,
        departTime: new Date(flight.departTime).toISOString(),
        arriveTime: new Date(flight.arriveTime).toISOString(),
        durationMins: flight.durationMins,
        stops: flight.stops ?? 0,
        cabin,
        passengers: data.passengers.slice(0, pax),
        source: "catalog",
      };
      productSnapshot = {
        title,
        subtitle: `${flight.from} → ${flight.to} · ${cabin}`,
        startDate: reservation.departTime,
        endDate: reservation.arriveTime,
        location: `${flight.from}–${flight.to}`,
        image: flight.airlineLogo || undefined,
      };
      reservationDetails = reservation;

      // Fallback flights (fb-flight-*) are not Mongo docs — skip seat hold
      if (/^[a-f\d]{24}$/i.test(String(flight._id))) {
        heldFlightId = String(flight._id);
        heldPax = pax;
        await connectDB();
        await Flight.findByIdAndUpdate(flight._id, {
          $inc: { seatsAvailable: -pax },
        });
      }
    } else if (data.type === "HOTEL") {
      await connectDB();
      const hotel = await Hotel.findById(data.hotelId).lean();
      if (!hotel) {
        return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
      }
      const nights = nightsBetween(data.checkIn, data.checkOut);
      adults = data.adults;
      children = data.children;
      // Server-priced only — never trust client amount
      const pricePerNight = hotel.pricePerNight;
      subtotal = pricePerNight * nights;
      title = hotel.name;
      const reservation: HotelReservation = {
        hotelId: String(hotel._id),
        hotelSlug: hotel.slug,
        hotelName: hotel.name,
        city: hotel.city,
        country: hotel.country,
        roomName: data.roomName,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        nights,
        pricePerNight,
        guests: adults + children,
      };
      productSnapshot = {
        title: hotel.name,
        subtitle: `${data.roomName} · ${nights} night${nights === 1 ? "" : "s"}`,
        startDate: data.checkIn,
        endDate: data.checkOut,
        location: `${hotel.city}, ${hotel.country}`,
        image: hotel.images?.[0],
      };
      reservationDetails = reservation;
    } else if (data.type === "CAR") {
      const car = await prisma.carListing.findUnique({ where: { id: data.carId } });
      if (!car || !car.isActive) {
        return NextResponse.json({ error: "Vehicle not available" }, { status: 404 });
      }
      const days = daysBetween(data.pickupDate, data.returnDate);
      adults = 1;
      children = 0;
      subtotal = car.pricePerDay * days;
      title = car.name;
      const reservation: CarReservation = {
        carId: car.id,
        carSlug: car.slug,
        carName: car.name,
        pickupLocation: data.pickupLocation,
        pickupDate: data.pickupDate,
        returnDate: data.returnDate,
        days,
        pricePerDay: car.pricePerDay,
      };
      productSnapshot = {
        title: car.name,
        subtitle: `${days} day${days === 1 ? "" : "s"} · ${data.pickupLocation}`,
        startDate: data.pickupDate,
        endDate: data.returnDate,
        location: data.pickupLocation,
        image: car.image ?? undefined,
      };
      reservationDetails = reservation;
    } else {
      const tour = await prisma.tour.findUnique({ where: { id: data.tourId } });
      const tourDate = await prisma.tourDate.findUnique({ where: { id: data.tourDateId } });
      if (!tour || tour.status !== "ACTIVE" || !tourDate || tourDate.tourId !== tour.id) {
        return NextResponse.json({ error: "Package not available" }, { status: 400 });
      }
      adults = data.adults;
      children = data.children;
      const seats = adults + children;
      const left = tourDate.seatsTotal - tourDate.seatsBooked;
      if (seats > left) {
        return NextResponse.json({ error: `Only ${left} places left` }, { status: 400 });
      }
      const unit = tour.discountPrice && tour.discountPrice < tour.price ? tour.discountPrice : tour.price;
      subtotal = unit * adults + unit * 0.7 * children;
      title = tour.title;
      tourId = tour.id;
      tourDateId = tourDate.id;
      productSnapshot = {
        title: tour.title,
        subtitle: `${tour.durationDays} days · ${tour.location}`,
        startDate: tourDate.startDate.toISOString(),
        endDate: tourDate.endDate.toISOString(),
        location: `${tour.location}, ${tour.country}`,
        image: tour.images?.[0],
      };
      reservationDetails = {
        packageId: tour.id,
        packageSlug: tour.slug,
        includes: tour.included.slice(0, 8),
      };
    }

    const ins = data.insurance;
    const insuranceAmount =
      ins?.selected ? insurancePremium(subtotal, ins.plan ?? "basic") : 0;
    const totalPrice = Math.round((subtotal + insuranceAmount) * 100) / 100;

    if (ins?.selected) {
      reservationDetails = {
        ...reservationDetails,
        insurance: { selected: true, plan: ins.plan ?? "basic", amount: insuranceAmount },
      };
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        type: bookingType,
        tourId,
        tourDateId,
        adults,
        children,
        totalPrice,
        currency: "USD",
        status: "PENDING",
        fulfillmentStatus: "HELD",
        paymentMethod: "STRIPE",
        travelerInfo: data.travelerInfo,
        specialRequests: data.specialRequests,
        productSnapshot,
        reservationDetails,
        holdExpiresAt: holdExpiresAt(),
        insuranceAmount: insuranceAmount || null,
      },
    });

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: toCents(totalPrice),
        currency: currencyToStripe("USD"),
        automatic_payment_methods: { enabled: true },
        receipt_email: data.travelerInfo.email,
        metadata: {
          bookingId: booking.id,
          userId,
          bookingType,
        },
        description: `UEB3 Travel — ${title}`,
      });
    } catch (piErr) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED", fulfillmentStatus: "RELEASED" },
      });
      if (heldFlightId && heldPax) {
        await connectDB();
        await Flight.findByIdAndUpdate(heldFlightId, {
          $inc: { seatsAvailable: heldPax },
        });
        heldFlightId = null;
        heldPax = 0;
      }
      throw piErr;
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      amount: totalPrice,
      insuranceAmount,
      subtotal,
    });
  } catch (error) {
    if (heldFlightId && heldPax) {
      try {
        await connectDB();
        await Flight.findByIdAndUpdate(heldFlightId, {
          $inc: { seatsAvailable: heldPax },
        });
      } catch {
        // ignore rollback failure
      }
    }
    const message = error instanceof Error ? error.message : "Failed to create payment";
    console.error("[create-commerce-intent]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
