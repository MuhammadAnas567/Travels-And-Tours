import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Public health check — no secrets. Use to verify Vercel ↔ Atlas. */
export async function GET() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
  const hasAuthSecret = Boolean(
    process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim()
  );
  const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || null;

  let dbOk = false;
  let userCount: number | null = null;
  let demoUser = false;

  if (hasDatabaseUrl) {
    try {
      const count = await withDbTimeout(prisma.user.count(), -1, 3000);
      if (count >= 0) {
        dbOk = true;
        userCount = count;
        const demo = await withDbTimeout(
          prisma.user.findUnique({
            where: { email: "user@example.com" },
            select: { id: true },
          }),
          null,
          2000
        );
        demoUser = !!demo;
      }
    } catch {
      dbOk = false;
    }
  }

  const ok = hasDatabaseUrl && hasAuthSecret && dbOk && demoUser;

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
      },
      hint: ok
        ? "Auth should work with user@example.com / user123"
        : !hasDatabaseUrl
          ? "Set DATABASE_URL (Atlas) on Vercel Environment Variables, then Redeploy"
          : !hasAuthSecret
            ? "Set AUTH_SECRET on Vercel, then Redeploy"
            : !dbOk
              ? "Atlas unreachable — allow 0.0.0.0/0 in Atlas Network Access"
              : !demoUser
                ? "Run npm run seed:atlas locally so user@example.com exists"
                : "Check AUTH_URL matches your live domain",
    },
    { status: ok ? 200 : 503 }
  );
}
