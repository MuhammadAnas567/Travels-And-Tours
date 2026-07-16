import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";
import { sendContactEmail } from "@/lib/email";
import { prisma, withDbTimeout } from "@/lib/db";

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

async function persistInquiry(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    const row = await withDbTimeout(
      prisma.quoteRequest.create({
        data: {
          name: data.name,
          email: data.email,
          destinations: [data.subject.slice(0, 120)],
          preferences: data.message,
          status: "NEW",
        },
      }),
      null,
      2000
    );
    return !!row;
  } catch (error) {
    console.error("[contact] persist failed:", error);
    return false;
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
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const emailed = await sendContactEmail(parsed.data);
    const stored = emailed ? true : await persistInquiry(parsed.data);

    if (!emailed && !stored) {
      return NextResponse.json(
        {
          error:
            "We could not deliver or save your message. Email hello@ueb3tours.com or try WhatsApp.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      delivered: emailed ? "email" : "stored",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
