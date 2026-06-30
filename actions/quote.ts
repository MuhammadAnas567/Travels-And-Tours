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
