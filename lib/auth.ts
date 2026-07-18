import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import type { Provider } from "next-auth/providers";

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
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.hashedPassword) {
          console.error("[auth] user not found or no password:", email);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) return null;

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

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
});

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
