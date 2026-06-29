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
export type BookingStep1Input = z.infer<typeof bookingStep1Schema>;
export type BookingStep2Input = z.infer<typeof bookingStep2Schema>;
