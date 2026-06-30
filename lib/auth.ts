import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getToken } from "@auth/core/jwt";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import type { Provider } from "next-auth/providers";

const SESSION_COOKIE_PREFIXES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
] as const;

async function clearInvalidSessionCookie() {
  const cookieStore = await cookies();
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) return;

  const allCookies = cookieStore.getAll();
  const hasSessionCookie = allCookies.some((cookie) =>
    SESSION_COOKIE_PREFIXES.some(
      (prefix) =>
        cookie.name === prefix || cookie.name.startsWith(`${prefix}.`)
    )
  );

  if (!hasSessionCookie) return;

  const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");

  try {
    const token = await getToken({
      req: { headers: { cookie: cookieHeader } },
      secret,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (token) return;
  } catch {
    // stale or tampered session cookie
  }

  for (const cookie of allCookies) {
    if (
      SESSION_COOKIE_PREFIXES.some(
        (prefix) =>
          cookie.name === prefix || cookie.name.startsWith(`${prefix}.`)
      )
    ) {
      cookieStore.delete(cookie.name);
    }
  }
}

const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const email = credentials.email as string;
      const password = credentials.password as string;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.hashedPassword) return null;

      const isValid = await bcrypt.compare(password, user.hashedPassword);
      if (!isValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
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
  await clearInvalidSessionCookie();
  return auth();
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
