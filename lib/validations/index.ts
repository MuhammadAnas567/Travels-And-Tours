import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const flightBookRequestSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Phone is required"),
  passport: z.string().optional(),
  notes: z.string().optional(),
  routeLabel: z.string().min(3),
  airline: z.string().min(1),
  flightNumbers: z.string().min(1),
  departLabel: z.string().min(1),
  arriveLabel: z.string().min(1),
  fareLabel: z.string().min(1),
  travellers: z.number().int().min(1).max(9),
  price: z.number().positive(),
  currency: z.string().min(3).max(3).optional(),
  compareAtPrice: z.number().positive().optional(),
  stops: z.number().int().min(0).optional(),
  durationMinutes: z.number().int().min(0).optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  outboundDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Outbound date required"),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function todayAtLocalNoon() {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return now;
}

export const flightSearchSchema = z
  .object({
    origin: z
      .string({ error: "Origin is required" })
      .trim()
      .transform((value) => value.toUpperCase())
      .refine((value) => /^[A-Z]{3}$/.test(value), "Origin must be a 3-letter IATA code"),
    destination: z
      .string({ error: "Destination is required" })
      .trim()
      .transform((value) => value.toUpperCase())
      .refine((value) => /^[A-Z]{3}$/.test(value), "Destination must be a 3-letter IATA code"),
    outboundDate: z
      .string({ error: "Outbound date is required" })
      .refine(isValidDateOnly, "Outbound date must be YYYY-MM-DD")
      .refine((value) => new Date(`${value}T12:00:00`).getTime() >= todayAtLocalNoon().getTime(), {
        message: "Outbound date cannot be in the past",
      }),
    returnDate: z
      .string()
      .nullable()
      .optional()
      .transform((value) => (value && value.trim() ? value : null))
      .refine((value) => value === null || isValidDateOnly(value), "Return date must be YYYY-MM-DD"),
    tripType: z.enum(["oneway", "roundtrip"]),
    adults: z.coerce.number().int().min(1).max(9).default(1),
    children: z.coerce.number().int().min(0).max(8).default(0),
    cabinClass: z.coerce.number().int().min(1).max(4).default(1),
    currency: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .default("PKR"),
  })
  .superRefine((data, ctx) => {
    if (data.origin === data.destination) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["destination"],
        message: "Origin and destination must be different",
      });
    }

    if (data.tripType === "roundtrip") {
      if (!data.returnDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["returnDate"],
          message: "Return date is required for round-trip searches",
        });
        return;
      }
      if (data.returnDate < data.outboundDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["returnDate"],
          message: "Return date must be on or after the outbound date",
        });
      }
    }
  });

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const bookingStep1Schema = z.object({
  tourDateId: z.string().min(1, "Please select a date"),
  adults: z.coerce.number().int().min(1, "At least 1 adult required").max(20),
  children: z.coerce.number().int().min(0).max(20),
});

export const bookingStep2Schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Valid phone number required"),
  specialRequests: z.string().optional(),
});

export const reviewSchema = z.object({
  tourId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000),
});

export const tourSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(20),
  location: z.string().min(2),
  country: z.string().min(2),
  category: z.enum([
    "ADVENTURE",
    "FAMILY",
    "HONEYMOON",
    "CULTURAL",
    "BEACH",
    "WILDLIFE",
    "LUXURY",
    "BUDGET",
  ]),
  durationDays: z.coerce.number().int().min(1),
  price: z.coerce.number().positive(),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  images: z.array(z.string().url()).min(1),
  itinerary: z.array(
    z.object({
      day: z.number(),
      title: z.string(),
      details: z.string(),
    })
  ),
  included: z.array(z.string()),
  excluded: z.array(z.string()),
  maxGroupSize: z.coerce.number().int().min(1),
  status: z.enum(["ACTIVE", "DRAFT"]),
});

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type FlightBookRequestInput = z.infer<typeof flightBookRequestSchema>;
export type FlightSearchInput = z.infer<typeof flightSearchSchema>;
export type BookingStep1Input = z.infer<typeof bookingStep1Schema>;
export type BookingStep2Input = z.infer<typeof bookingStep2Schema>;
