import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Atlas from Vercel needs longer than 2s on cold start.
 * Public pages still use withDbTimeout(..., 800) so they stay fast.
 */
function databaseUrlWithTimeouts() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    // mongodb+srv URLs work with URL() in Node; keep query params
    const isProd = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    // Auth login must feel snappy — fail fast rather than hang 10–20s
    const selectMs = isProd ? "8000" : "4000";
    const connectMs = isProd ? "8000" : "4000";
    const socketMs = isProd ? "15000" : "8000";

    url.searchParams.set("serverSelectionTimeoutMS", selectMs);
    url.searchParams.set("connectTimeoutMS", connectMs);
    url.searchParams.set("socketTimeoutMS", socketMs);
    if (!url.searchParams.has("retryWrites")) url.searchParams.set("retryWrites", "true");
    if (!url.searchParams.has("w")) url.searchParams.set("w", "majority");
    // Keep a small pool warm for repeated auth/session hits on the same isolate
    if (!url.searchParams.has("maxPoolSize")) url.searchParams.set("maxPoolSize", "10");
    if (!url.searchParams.has("minPoolSize")) url.searchParams.set("minPoolSize", "1");
    return url.toString();
  } catch {
    return raw;
  }
}

function createPrismaClient() {
  const url = databaseUrlWithTimeouts();
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Always pin on globalThis so serverless warm instances reuse one client
globalForPrisma.prisma = prisma;

/** Race a DB call so public pages never wait the full Atlas timeout */
export async function withDbTimeout<T>(
  promise: Promise<T>,
  fallback: T,
  ms = 800
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
