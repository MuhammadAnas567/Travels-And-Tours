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

const adminRoutes = ["/admin"];
const protectedRoutes = ["/dashboard", "/booking"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const allCookies = req.cookies.getAll();
  const hasSessionCookie = allCookies.some((c) => isSessionCookie(c.name));
  const shouldClearStaleSession = hasSessionCookie && !isLoggedIn;

  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));

  let response: NextResponse;

  if (isAdminRoute) {
    if (!isLoggedIn) {
      response = NextResponse.redirect(new URL("/login", req.url));
    } else if (req.auth?.user?.role !== "ADMIN") {
      response = NextResponse.redirect(new URL("/", req.url));
    } else {
      response = NextResponse.next();
    }
  } else if (isProtectedRoute && !isLoggedIn) {
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
