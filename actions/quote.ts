"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";
import { z } from "zod";

const quoteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  destinations: z.string().min(2),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  adults: z.coerce.number().min(1).max(50),
  children: z.coerce.number().min(0).max(50),
  budget: z.coerce.number().optional(),
  preferences: z.string().max(3000).optional(),
});

export async function submitQuoteRequest(formData: FormData) {
  const parsed = quoteSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    destinations: formData.get("destinations"),
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    adults: formData.get("adults"),
    children: formData.get("children"),
    budget: formData.get("budget") || undefined,
    preferences: formData.get("preferences") || undefined,
  });

  if (!parsed.success) {
    return { error: "Please check your form and try again" };
  }

  const session = await getSession();
  const data = parsed.data;
  const destinations = data.destinations
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  const quote = await prisma.quoteRequest.create({
    data: {
      userId: session?.user?.id,
      kind: "TRIP",
      name: data.name,
      email: data.email,
      phone: data.phone,
      destinations,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      adults: data.adults,
      children: data.children,
      budget: data.budget,
      preferences: data.preferences,
    },
  });

  await sendEmail({
    to: siteConfig.office.email,
    subject: `Custom trip quote: ${destinations.join(", ")}`,
    html: `
      <h2>New Quote Request</h2>
      <p><strong>Name:</strong> ${data.name} (${data.email})</p>
      <p><strong>Destinations:</strong> ${destinations.join(", ")}</p>
      <p><strong>Travelers:</strong> ${data.adults} adults, ${data.children} children</p>
      <p><strong>Budget:</strong> ${data.budget ?? "Not specified"}</p>
      <p>${data.preferences ?? ""}</p>
    `,
  }).catch(() => {});

  revalidatePath("/admin/quotes");
  return { success: true, id: quote.id };
}

const hotelInquirySchema = z.object({
  hotelName: z.string().min(2),
  city: z.string().min(1),
  country: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.number().int().min(1).max(20),
  notes: z.string().max(3000).optional(),
  priceHint: z.number().optional(),
});

export async function submitHotelInquiry(input: z.infer<typeof hotelInquirySchema>) {
  const parsed = hotelInquirySchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please check your details and try again" };
  }

  const session = await getSession();
  const data = parsed.data;

  const quote = await prisma.quoteRequest.create({
    data: {
      userId: session?.user?.id,
      kind: "HOTEL",
      name: data.name,
      email: data.email,
      phone: data.phone,
      destinations: [`${data.hotelName} — ${data.city}, ${data.country}`],
      startDate: data.checkIn ? new Date(data.checkIn) : null,
      endDate: data.checkOut ? new Date(data.checkOut) : null,
      adults: data.guests,
      children: 0,
      budget: data.priceHint,
      preferences: data.notes ?? `Hotel stay inquiry for ${data.hotelName}`,
    },
  });

  await sendEmail({
    to: siteConfig.office.email,
    subject: `Hotel quote: ${data.hotelName}`,
    html: `
      <h2>Hotel stay request</h2>
      <p><strong>Hotel:</strong> ${data.hotelName} (${data.city}, ${data.country})</p>
      <p><strong>Guest:</strong> ${data.name} (${data.email})</p>
      <p><strong>Dates:</strong> ${data.checkIn ?? "—"} → ${data.checkOut ?? "—"}</p>
      <p><strong>Guests:</strong> ${data.guests}</p>
      <p>${data.notes ?? ""}</p>
      <p>Ref: ${quote.id}</p>
    `,
  }).catch(() => {});

  revalidatePath("/admin/quotes");
  return { id: quote.id };
}
