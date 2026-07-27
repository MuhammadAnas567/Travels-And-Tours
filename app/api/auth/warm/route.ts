import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * Lightweight DB warm for the login page — one tiny query, no health payload.
 * Call on /login mount so the first Sign in does not pay cold-connect cost.
 */
export async function GET() {
  const started = Date.now();
  try {
    if (!process.env.DATABASE_URL?.trim()) {
      return NextResponse.json(
        { ok: false, ms: Date.now() - started },
        { status: 503 }
      );
    }
    await prisma.$connect();
    await prisma.user.findFirst({
      select: { id: true },
      take: 1,
    });
    return NextResponse.json({ ok: true, ms: Date.now() - started });
  } catch {
    return NextResponse.json(
      { ok: false, ms: Date.now() - started },
      { status: 503 }
    );
  }
}
