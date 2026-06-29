import type {
  Booking,
  BookingStatus,
  Review,
  Tour,
  TourCategory,
  TourDate,
  TourStatus,
  User,
  UserRole,
} from "@prisma/client";

export type {
  Booking,
  BookingStatus,
  Review,
  Tour,
  TourCategory,
  TourDate,
  TourStatus,
  User,
  UserRole,
};

export type ItineraryDay = {
  day: number;
  title: string;
  details: string;
};

export type TravelerInfo = {
  name: string;
  email: string;
  phone: string;
};

export type TourWithDates = Tour & {
  availableDates: TourDate[];
  _count?: { reviews: number; bookings: number };
};

export type BookingWithRelations = Booking & {
  tour: Tour;
  tourDate: TourDate;
  user: Pick<User, "id" | "name" | "email">;
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">;
};
