import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Keep Atlas from hanging Vercel serverless for ~30s on every miss */
function databaseUrlWithTimeouts() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has("serverSelectionTimeoutMS")) {
      url.searchParams.set("serverSelectionTimeoutMS", "5000");
    }
    if (!url.searchParams.has("connectTimeoutMS")) {
      url.searchParams.set("connectTimeoutMS", "5000");
    }
    if (!url.searchParams.has("socketTimeoutMS")) {
      url.searchParams.set("socketTimeoutMS", "10000");
    }
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

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** Race a DB call so pages never wait the full Atlas timeout */
export async function withDbTimeout<T>(
  promise: Promise<T>,
  fallback: T,
  ms = 6000
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
