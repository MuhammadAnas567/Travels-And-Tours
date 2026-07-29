import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import type { Provider } from "next-auth/providers";
import type { NextAuthConfig } from "next-auth";

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const email = (credentials.email as string).trim().toLowerCase();
      const password = credentials.password as string;

      if (!process.env.DATABASE_URL?.trim()) {
        console.error("[auth] DATABASE_URL missing on this environment");
        return null;
      }

      try {
        // Reuse pooled connection — avoids cold handshake on every login
        await prisma.$connect();

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            hashedPassword: true,
            emailVerified: true,
          },
        });

        if (!user?.hashedPassword) return null;

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) return null;
        if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      } catch (error) {
        console.error("[auth] database error during login:", error);
        return null;
      }
    },
  }),
];

if (googleConfigured) {
  providers.unshift(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

/**
 * JWT sessions do not need the Prisma adapter for credentials login.
 * Adapter only adds DB round-trips — keep it for Google account linking only.
 */
const authOptions: NextAuthConfig = {
  ...authConfig,
  providers,
  ...(googleConfigured ? { adapter: PrismaAdapter(prisma) } : {}),
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export async function getSession() {
  try {
    return await auth();
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session;
}

/** ADMIN or AGENT — for quotes CRM and shared ops surfaces */
export async function requireStaff() {
  const session = await requireAuth();
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "AGENT") {
    throw new Error("Forbidden");
  }
  return session;
}

export function isStaffRole(role?: string | null) {
  return role === "ADMIN" || role === "AGENT";
}
