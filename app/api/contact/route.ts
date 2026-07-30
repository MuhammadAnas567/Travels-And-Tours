import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { contactSchema } from "@/lib/validations";
import { sendContactEmail } from "@/lib/email";
import { prisma, withDbTimeout } from "@/lib/db";
import { getContactInbox } from "@/lib/site-config";

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

function inferKind(subject: string, explicit?: string) {
  if (explicit?.trim()) return explicit.trim().toUpperCase().slice(0, 40);
  const s = subject.toLowerCase();
  if (s.includes("hotel")) return "HOTEL";
  if (s.includes("car")) return "CAR";
  if (s.includes("visa")) return "VISA";
  if (s.includes("flight")) return "FLIGHT";
  if (s.includes("tour") || s.includes("package")) return "PACKAGE";
  if (s.includes("plan") || s.includes("trip")) return "TRIP";
  if (s.includes("deal")) return "DEAL";
  if (s.includes("blog")) return "BLOG";
  return "CONTACT";
}

async function persistInquiry(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  kind?: string;
  phone?: string;
}): Promise<{ id: string } | null> {
  const kind = inferKind(data.subject, data.kind);
  try {
    const row = await withDbTimeout(
      prisma.quoteRequest.create({
        data: {
          kind,
          name: data.name,
          email: data.email.trim().toLowerCase(),
          phone: data.phone?.trim() || null,
          destinations: [data.subject.slice(0, 120)],
          preferences: data.message,
          status: "NEW",
        },
      }),
      null,
      2500
    );
    if (row) return { id: row.id };
  } catch (error) {
    console.error("[contact] quoteRequest failed:", error);
  }

  try {
    const key = "contact_inbox";
    const existing = await withDbTimeout(
      prisma.siteSettings.findUnique({ where: { key } }),
      null,
      2000
    );
    const prev =
      existing?.value &&
      typeof existing.value === "object" &&
      Array.isArray((existing.value as { items?: unknown[] }).items)
        ? (existing.value as { items: unknown[] }).items
        : [];
    const items = [
      {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        kind,
        phone: data.phone ?? null,
        at: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 200) as Prisma.InputJsonArray;
    const value = { items } as Prisma.InputJsonValue;
    const saved = await withDbTimeout(
      prisma.siteSettings.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
      null,
      2000
    );
    return saved ? { id: "fallback-settings" } : null;
  } catch (error) {
    console.error("[contact] siteSettings failed:", error);
    return null;
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill all fields (message at least 10 characters)." },
      { status: 400 }
    );
  }

  try {
    const stored = await persistInquiry(parsed.data);

    let emailed = false;
    try {
      emailed = await sendContactEmail(parsed.data);
    } catch (error) {
      console.error("[contact] email send failed:", error);
    }

    if (!stored && !emailed) {
      const inbox = getContactInbox();
      return NextResponse.json(
        {
          error: `Could not save your message (database offline). Email ${inbox} or try WhatsApp.`,
          mailto: `mailto:${inbox}?subject=${encodeURIComponent(parsed.data.subject)}&body=${encodeURIComponent(`From: ${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`)}`,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      saved: Boolean(stored),
      quoteId: stored && stored.id !== "fallback-settings" ? stored.id : null,
      emailed,
      delivered: stored ? "stored" : "email",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
