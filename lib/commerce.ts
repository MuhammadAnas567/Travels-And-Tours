import { generateBookingReference } from "@/lib/stripe";
import type { BookingType, Currency } from "@prisma/client";

export type TravelerContact = {
  name: string;
  email: string;
  phone: string;
};

export type ProductSnapshot = {
  title: string;
  subtitle?: string;
  image?: string;
  location?: string;
  /** ISO dates for display */
  startDate?: string;
  endDate?: string;
};

export type FlightReservation = {
  flightId: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  durationMins: number;
  stops: number;
  cabin: "economy" | "business" | "first";
  passengers: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
  }>;
  source?: string;
};

export type HotelReservation = {
  hotelId: string;
  hotelSlug: string;
  hotelName: string;
  city: string;
  country: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  guests: number;
};

export type CarReservation = {
  carId: string;
  carSlug: string;
  carName: string;
  pickupLocation: string;
  pickupDate: string;
  returnDate: string;
  days: number;
  pricePerDay: number;
};

export type PackageReservation = {
  packageId: string;
  packageSlug: string;
  includes: string[];
};

export type InsuranceAddOn = {
  selected: boolean;
  plan: "basic" | "plus";
  amount: number;
};

export const HOLD_MINUTES = 30;

export function holdExpiresAt(from = new Date()) {
  return new Date(from.getTime() + HOLD_MINUTES * 60 * 1000);
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const ms = b.getTime() - a.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function daysBetween(start: string, end: string) {
  return nightsBetween(start, end);
}

/** Simple travel insurance pricing (USD) based on trip total */
export function insurancePremium(tripTotal: number, plan: "basic" | "plus" = "basic") {
  const rate = plan === "plus" ? 0.08 : 0.045;
  const min = plan === "plus" ? 24 : 12;
  return Math.max(min, Math.round(tripTotal * rate * 100) / 100);
}

export function bookingTitle(type: BookingType, snapshot: ProductSnapshot | null | undefined) {
  if (snapshot?.title) return snapshot.title;
  switch (type) {
    case "FLIGHT":
      return "Flight booking";
    case "HOTEL":
      return "Hotel stay";
    case "CAR":
      return "Car hire";
    case "PACKAGE":
      return "Travel package";
    case "INSURANCE":
      return "Travel insurance";
    default:
      return "Tour booking";
  }
}

export function newBookingReference() {
  return generateBookingReference();
}

export function currencyToStripe(currency: Currency | string) {
  return String(currency || "USD").toLowerCase();
}
