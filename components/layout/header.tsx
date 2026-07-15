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

  const elevated = !isHome || scrolled;
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
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

  const linkIdle = "text-[#F6F3EC]/80 hover:text-[#F6F3EC]";
  const linkActive = "text-[#C49A5C]";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-shadow duration-[var(--duration-base)] ease-[var(--ease-brand)]",
        "bg-[#1A1611] text-[#F6F3EC] border-[#2A241C]",
        elevated ? "shadow-md" : "shadow-none"
      )}
    >
      <div className="mx-auto flex h-14 min-[480px]:h-[4.5rem] w-full max-w-[1280px] items-center justify-between gap-2 px-3 min-[480px]:px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 min-[480px]:gap-3 shrink rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B48A50] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1611]"
        >
          <div className="flex h-8 w-8 min-[480px]:h-9 min-[480px]:w-9 shrink-0 items-center justify-center rounded-sm border border-[#B48A50]/50 bg-[#B48A50]/15 font-display text-base min-[480px]:text-lg font-semibold text-[#C49A5C]">
            U
          </div>
          <span className="font-display text-base min-[480px]:text-xl font-semibold tracking-tight text-[#F6F3EC] truncate">
            UEB3<span className="hidden min-[380px]:inline"> Travel</span>
          </span>
        </Link>

        {/* Desktop nav — xl only so mid widths don't overflow */}
        <nav
          className="hidden xl:flex items-center gap-0.5 shrink min-w-0"
          aria-label="Main"
        >
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-1.5 px-2.5 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B48A50] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1611] rounded-sm whitespace-nowrap",
                  active ? linkActive : linkIdle
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                {item.label}
                <span
                  className={cn(
                    "absolute bottom-1 left-3 right-3 h-px bg-[#B48A50] transition-transform duration-[var(--duration-base)] ease-[var(--ease-brand)] origin-left",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-0.5 shrink-0">
          <div className="hidden xl:flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Currency ${currency}. Click to toggle.`}
              onClick={() => setCurrency((c) => (c === "USD" ? "EUR" : c === "EUR" ? "GBP" : "USD"))}
              className="text-[#F6F3EC]/75 hover:bg-white/10 hover:text-[#F6F3EC]"
            >
              <Globe className="h-4 w-4" aria-hidden /> {currency}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Language ${lang}. Click to toggle.`}
              onClick={() => setLang((l) => (l === "EN" ? "FR" : l === "FR" ? "ES" : "EN"))}
              className="text-[#F6F3EC]/75 hover:bg-white/10 hover:text-[#F6F3EC]"
            >
              <Languages className="h-4 w-4" aria-hidden /> {lang}
            </Button>

            {status === "authenticated" && user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild className="text-[#F6F3EC]/75 hover:bg-white/10 hover:text-[#F6F3EC]">
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild className="text-[#F6F3EC]/75 hover:bg-white/10 hover:text-[#F6F3EC]">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" aria-hidden /> Dashboard
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-[#F6F3EC]/75 hover:bg-white/10 hover:text-[#F6F3EC]"
                >
                  <LogOut className="h-4 w-4" aria-hidden /> Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="text-[#F6F3EC]/75 hover:bg-white/10 hover:text-[#F6F3EC]">
                  <Link href="/login">
                    <User className="h-4 w-4" aria-hidden /> Sign in
                  </Link>
                </Button>
                <Button variant="primary" size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile / tablet menu control */}
          <button
            type="button"
            className="xl:hidden flex items-center justify-center p-2.5 min-h-11 min-w-11 rounded-sm text-[#F6F3EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B48A50]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="xl:hidden absolute inset-x-0 top-14 min-[480px]:top-[4.5rem] z-50 border-t border-[#2A241C] bg-[#1A1611] px-4 py-5 shadow-float max-h-[calc(100dvh-3.5rem)] overflow-y-auto"
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
                    "flex min-h-11 items-center gap-2 rounded-sm px-3 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B48A50]",
                    active
                      ? "bg-[#B48A50]/15 text-[#C49A5C]"
                      : "text-[#F6F3EC]/85 hover:bg-white/5 hover:text-[#F6F3EC]"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.5} aria-hidden /> {item.label}
                </Link>
              );
            })}
            <Link
              href="/cars"
              className="flex min-h-11 items-center gap-2 rounded-sm px-3 py-3 text-[#F6F3EC]/85 hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              Car hire
            </Link>
            <hr className="my-3 border-[#2A241C]" />
            <div className="flex flex-wrap gap-2 px-1 pb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrency((c) => (c === "USD" ? "EUR" : c === "EUR" ? "GBP" : "USD"))}
                className="text-[#F6F3EC]/75 hover:bg-white/10"
              >
                <Globe className="h-4 w-4" aria-hidden /> {currency}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLang((l) => (l === "EN" ? "FR" : l === "FR" ? "ES" : "EN"))}
                className="text-[#F6F3EC]/75 hover:bg-white/10"
              >
                <Languages className="h-4 w-4" aria-hidden /> {lang}
              </Button>
            </div>
            {status === "authenticated" && user ? (
              <>
                <Link href="/dashboard" className="px-3 py-3 text-[#C49A5C] font-medium" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="px-3 py-3 text-[#F6F3EC] font-medium" onClick={() => setMobileOpen(false)}>
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  className="px-3 py-3 text-left font-medium text-[#F6F3EC]"
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
                <Link href="/login" className="px-3 py-3 text-[#C49A5C] font-medium" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
                <Link href="/register" className="px-3 py-3 font-medium text-[#F6F3EC]" onClick={() => setMobileOpen(false)}>
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
