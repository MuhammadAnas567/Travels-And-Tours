import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const SESSION_COOKIE_PREFIXES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
] as const;

/** Routes agents may access (CRM / quotes / visa). Everything else under /admin is ADMIN-only. */
const AGENT_ALLOWED = [
  "/admin/quotes",
  "/admin/crm",
  "/admin/visa-inquiries",
  "/admin", // overview landing — page itself can show limited widgets
];

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

function agentMayAccess(pathname: string) {
  if (pathname === "/admin" || pathname === "/admin/") return true;
  return AGENT_ALLOWED.some(
    (prefix) => prefix !== "/admin" && (pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}

/**
 * Only run auth on protected areas — public pages skip NextAuth for TTFB.
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
    if (!isLoggedIn) {
      response = NextResponse.redirect(new URL("/login", req.url));
    } else if (role === "ADMIN") {
      response = NextResponse.next();
    } else if (role === "AGENT") {
      if (agentMayAccess(pathname)) {
        response = NextResponse.next();
      } else {
        response = NextResponse.redirect(new URL("/admin/quotes", req.url));
      }
    } else {
      response = NextResponse.redirect(new URL("/", req.url));
    }
  } else if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${pathname}${req.nextUrl.search || ""}`
    );
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
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
