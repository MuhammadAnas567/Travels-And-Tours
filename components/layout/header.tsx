"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu, X, Globe, User, Plane, Hotel, Package, MapPin, Tag,
  LayoutDashboard, LogOut, Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/flights", label: "Flights", icon: Plane },
  { href: "/hotels", label: "Hotels", icon: Hotel },
  { href: "/packages", label: "Packages", icon: Package },
  { href: "/things-to-do", label: "Destinations", icon: MapPin },
  { href: "/deals", label: "Deals", icon: Tag },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [lang, setLang] = useState("EN");

  const solid = !isHome || scrolled;
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        solid
          ? "bg-white/95 shadow-card border-b border-line backdrop-blur-md"
          : "bg-gradient-to-b from-primary-900/70 via-primary-900/35 to-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-lg">
            U
          </div>
          <span
            className={cn(
              "font-heading text-xl font-bold tracking-tight",
              solid ? "text-ink-900" : "text-white drop-shadow-sm"
            )}
          >
            UEB3 Travel
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                  solid
                    ? active
                      ? "bg-primary-100 text-primary-500"
                      : "text-ink-700 hover:bg-primary-100 hover:text-primary-500"
                    : active
                      ? "bg-white/20 text-white"
                      : "text-white/95 hover:bg-white/15 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Currency ${currency}. Click to toggle.`}
            onClick={() => setCurrency((c) => (c === "USD" ? "EUR" : c === "EUR" ? "GBP" : "USD"))}
            className={cn(
              solid
                ? "text-ink-700 hover:bg-primary-100"
                : "text-white hover:bg-white/15 hover:text-white"
            )}
          >
            <Globe className="h-4 w-4" aria-hidden /> {currency}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Language ${lang}. Click to toggle.`}
            onClick={() => setLang((l) => (l === "EN" ? "FR" : l === "FR" ? "ES" : "EN"))}
            className={cn(
              solid
                ? "text-ink-700 hover:bg-primary-100"
                : "text-white hover:bg-white/15 hover:text-white"
            )}
          >
            <Languages className="h-4 w-4" aria-hidden /> {lang}
          </Button>

          {status === "authenticated" && user ? (
            <>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    solid
                      ? "text-ink-700 hover:bg-primary-100"
                      : "text-white hover:bg-white/15 hover:text-white"
                  )}
                >
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  solid
                    ? "text-ink-700 hover:bg-primary-100"
                    : "text-white hover:bg-white/15 hover:text-white"
                )}
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" aria-hidden /> Dashboard
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className={cn(
                  solid
                    ? "text-ink-700 hover:bg-primary-100"
                    : "text-white hover:bg-white/15 hover:text-white"
                )}
              >
                <LogOut className="h-4 w-4" aria-hidden /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  solid
                    ? "text-ink-700 hover:bg-primary-100"
                    : "text-white hover:bg-white/15 hover:text-white"
                )}
              >
                <Link href="/login">
                  <User className="h-4 w-4" aria-hidden /> Sign in
                </Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                asChild
                className="bg-primary-500 hover:bg-primary-700 text-white"
              >
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className={cn(
            "lg:hidden p-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            solid ? "text-ink-900" : "text-white"
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden absolute inset-x-0 top-16 z-50 border-t border-line bg-white px-4 py-4 shadow-float max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                    active
                      ? "bg-primary-100 text-primary-500 font-semibold"
                      : "text-ink-700 hover:bg-primary-100"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4" aria-hidden /> {item.label}
                </Link>
              );
            })}
            <Link
              href="/cars"
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-ink-700 hover:bg-primary-100"
              onClick={() => setMobileOpen(false)}
            >
              Car hire
            </Link>
            <hr className="my-2 border-line" />
            {status === "authenticated" && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-primary-500 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 font-medium text-ink-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  className="px-3 py-2 text-left font-medium text-ink-900"
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-primary-500 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 font-medium text-ink-900"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
