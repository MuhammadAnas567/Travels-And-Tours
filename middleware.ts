import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const SESSION_COOKIE_PREFIXES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
] as const;

function isSessionCookie(name: string) {
  return SESSION_COOKIE_PREFIXES.some(
    (prefix) => name === prefix || name.startsWith(`${prefix}.`)
  );
}

function clearSessionCookies(
  response: NextResponse,
  cookies: { name: string }[]
) {
  for (const cookie of cookies) {
    if (isSessionCookie(cookie.name)) {
      response.cookies.delete(cookie.name);
    }
  }
}

/**
 * Only run auth on protected areas — public pages (/, /tours, /packages, …)
 * skip NextAuth entirely so Vercel TTFB stays low.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const allCookies = req.cookies.getAll();
  const hasSessionCookie = allCookies.some((c) => isSessionCookie(c.name));
  const shouldClearStaleSession = hasSessionCookie && !isLoggedIn;

  let response: NextResponse;

  if (pathname.startsWith("/admin")) {
    const role = req.auth?.user?.role;
    const isStaff = role === "ADMIN" || role === "AGENT";
    if (!isLoggedIn) {
      response = NextResponse.redirect(new URL("/login", req.url));
    } else if (!isStaff) {
      response = NextResponse.redirect(new URL("/", req.url));
    } else {
      response = NextResponse.next();
    }
  } else if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/booking")) &&
    !isLoggedIn
  ) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    response = NextResponse.redirect(loginUrl);
  } else {
    response = NextResponse.next();
  }

  if (shouldClearStaleSession) {
    clearSessionCookies(response, allCookies);
  }

  return response;
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/booking/:path*"],
};
