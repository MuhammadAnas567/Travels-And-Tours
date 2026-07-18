import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function sanitizeError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  return msg
    .replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, "mongodb://***@")
    .replace(/:[^:@/\s]+@/g, ":***@")
    .slice(0, 280);
}

function describeUrl(raw: string | undefined) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return {
      protocol: u.protocol.replace(":", ""),
      host: u.host,
      db: u.pathname.replace(/^\//, "") || "(default)",
      hasUser: Boolean(u.username),
    };
  } catch {
    return { parseError: true as const };
  }
}

/** Public health check — no secrets. Use to verify Vercel ↔ Atlas. */
export async function GET() {
  const rawUrl = process.env.DATABASE_URL?.trim();
  const hasDatabaseUrl = Boolean(rawUrl);
  const hasAuthSecret = Boolean(
    process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim()
  );
  const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || null;

  let dbOk = false;
  let userCount: number | null = null;
  let demoUser = false;
  let dbError: string | null = null;

  if (hasDatabaseUrl) {
    try {
      // Real wait — do not use short withDbTimeout here (false "unreachable")
      const count = await prisma.user.count();
      dbOk = true;
      userCount = count;
      const demo = await prisma.user.findUnique({
        where: { email: "user@example.com" },
        select: { id: true },
      });
      demoUser = !!demo;
    } catch (error) {
      dbOk = false;
      dbError = sanitizeError(error);
    }
  }

  const ok = hasDatabaseUrl && hasAuthSecret && dbOk && demoUser;

  let hint = "Auth should work with user@example.com / user123";
  if (!ok) {
    if (!hasDatabaseUrl) {
      hint = "Set DATABASE_URL (Atlas) on Vercel Environment Variables, then Redeploy";
    } else if (!hasAuthSecret) {
      hint = "Set AUTH_SECRET on Vercel, then Redeploy";
    } else if (!dbOk) {
      if (dbError?.toLowerCase().includes("authentication failed")) {
        hint =
          "Wrong Atlas username/password in DATABASE_URL — copy fresh URI from Atlas → Connect";
      } else if (dbError?.toLowerCase().includes("enotfound") || dbError?.toLowerCase().includes("querySrv")) {
        hint =
          "DNS/SRV failed — in Atlas Connect use the standard connection string, or check cluster is not paused";
      } else if (dbError?.toLowerCase().includes("timeout") || dbError?.toLowerCase().includes("timed out")) {
        hint =
          "Still timing out: Network Access must show 0.0.0.0/0 Active; also check Atlas cluster is not Paused";
      } else {
        hint =
          "Atlas unreachable. Confirm: (1) Network Access 0.0.0.0/0 Active (2) cluster not Paused (3) DATABASE_URL password correct — then Redeploy";
      }
    } else if (!demoUser) {
      hint = "DB connected but no demo user — run npm run seed:atlas locally";
    } else {
      hint = "Check AUTH_URL matches your live domain";
    }
  }

  return NextResponse.json(
    {
      ok,
      checks: {
        DATABASE_URL: hasDatabaseUrl,
        AUTH_SECRET: hasAuthSecret,
        AUTH_URL: Boolean(authUrl),
        databaseReachable: dbOk,
        demoUserExists: demoUser,
        userCount,
        dbHost: describeUrl(rawUrl),
        dbError,
      },
      hint,
    },
    { status: ok ? 200 : 503 }
  );
}
