"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Globe,
  User,
  LayoutDashboard,
  LogOut,
  Languages,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, MORE_NAV, ALL_NAV, isActivePath } from "@/components/layout/nav-config";
import { CURRENCY_COOKIE } from "@/lib/constants";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { notifyCurrencyChange } from "@/components/shared/display-price";
import { toast } from "sonner";
import type { Currency } from "@prisma/client";

const CURRENCY_CYCLE = SUPPORTED_CURRENCIES;

function readCurrencyCookie(): Currency {
  if (typeof document === "undefined") return "USD";
  const match = document.cookie.match(new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`));
  const value = match?.[1] as Currency | undefined;
  if (value && CURRENCY_CYCLE.includes(value)) return value;
  return "USD";
}

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [lang, setLang] = useState("EN");
  const moreRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";
  const moreActive = MORE_NAV.some((item) => isActivePath(pathname, item.href));
  // Always readable glass — never white text on light sky
  const compact = !isHome || scrolled || mobileOpen;

  useEffect(() => {
    setCurrency(readCurrencyCookie());
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function cycleCurrency() {
    const idx = CURRENCY_CYCLE.indexOf(currency);
    const next = CURRENCY_CYCLE[(idx + 1) % CURRENCY_CYCLE.length] ?? "USD";
    document.cookie = `${CURRENCY_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
    setCurrency(next);
    notifyCurrencyChange();
    toast.success(`Prices shown in ${next}`);
  }

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const el = moreRef.current;
      if (el && !el.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-[100] isolate w-full transition-all duration-[var(--duration-base)] ease-[var(--ease-brand)]",
        "border-b border-white/50 bg-paper/85 text-ink-900 backdrop-blur-xl",
        compact ? "shadow-md" : "shadow-sm"
      )}
    >
      <div className="relative z-[101] mx-auto flex h-14 min-[480px]:h-16 w-full max-w-[1280px] items-center justify-between gap-2 px-3 min-[480px]:px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="relative z-[102] flex min-w-0 items-center gap-2.5 shrink rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine-500 font-display text-base font-bold text-white shadow-sm">
            U
          </div>
          <span className="font-display text-lg min-[480px]:text-xl font-semibold tracking-tight text-ink-900 truncate">
            UEB3<span className="hidden min-[380px]:inline"> Travel</span>
          </span>
        </Link>

        <nav
          className="relative z-[102] hidden lg:flex items-center gap-0.5 shrink min-w-0"
          aria-label="Main"
        >
          {PRIMARY_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative z-[102] flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 whitespace-nowrap pointer-events-auto",
                  active
                    ? "bg-pine-50 text-pine-600"
                    : "text-ink-700 hover:bg-sand-100 hover:text-pine-600"
                )}
              >
                {Icon && (
                  <Icon className="h-4 w-4 shrink-0 hidden xl:block" strokeWidth={1.5} aria-hidden />
                )}
                {item.label}
              </Link>
            );
          })}

          <div className="relative z-[103]" ref={moreRef}>
            <button
              type="button"
              className={cn(
                "group relative flex items-center gap-1 rounded-full px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500",
                moreActive || moreOpen
                  ? "bg-pine-50 text-pine-600"
                  : "text-ink-700 hover:bg-sand-100 hover:text-pine-600"
              )}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((o) => !o)}
            >
              More
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", moreOpen && "rotate-180")}
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
            {moreOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-full z-[104] mt-2 min-w-[13rem] rounded-md border border-line bg-paper py-2 shadow-lg"
              >
                {MORE_NAV.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      role="menuitem"
                      href={item.href}
                      prefetch
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-2 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-inset",
                        active
                          ? "bg-pine-50 text-pine-600 font-semibold"
                          : "text-ink-700 hover:bg-sand-100"
                      )}
                      onClick={() => setMoreOpen(false)}
                    >
                      {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <div className="hidden lg:flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Currency ${currency}. Click to change.`}
              onClick={cycleCurrency}
              className="text-ink-500 hover:bg-sand-100 hover:text-ink-900 hidden md:inline-flex tabular-nums"
            >
              <Globe className="h-4 w-4" aria-hidden /> {currency}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Language ${lang}`}
              onClick={() => setLang((l) => (l === "EN" ? "UR" : l === "UR" ? "AR" : "EN"))}
              className="text-ink-500 hover:bg-sand-100 hover:text-ink-900 hidden lg:inline-flex"
            >
              <Languages className="h-4 w-4" aria-hidden /> {lang}
            </Button>

            {status === "authenticated" && user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild className="text-ink-700 hover:bg-sand-100">
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild className="text-ink-700 hover:bg-sand-100">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" aria-hidden />
                    <span className="hidden xl:inline">Dashboard</span>
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-ink-700 hover:bg-sand-100"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  <span className="hidden xl:inline">Sign out</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  prefetch
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-700 hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
                >
                  <User className="h-4 w-4" aria-hidden />
                  <span className="hidden xl:inline">Sign in</span>
                </Link>
                <Link
                  href="/flights"
                  prefetch
                  className="inline-flex min-h-11 items-center rounded-full bg-pine-500 px-5 text-sm font-semibold text-white shadow-sm hover:bg-pine-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden flex items-center justify-center p-2.5 min-h-11 min-w-11 rounded-full text-ink-900 hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" strokeWidth={1.5} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden absolute inset-x-0 top-14 min-[480px]:top-16 z-50 border-t border-line bg-paper px-4 py-5 shadow-float max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {ALL_NAV.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-md px-3 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500",
                    active
                      ? "bg-pine-50 text-pine-600"
                      : "text-ink-800 hover:bg-sand-100"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {Icon && <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
                  {item.label}
                </Link>
              );
            })}
            <hr className="my-3 border-line" />
            <div className="flex flex-wrap gap-2 px-1 pb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cycleCurrency}
                className="text-ink-600"
              >
                <Globe className="h-4 w-4" aria-hidden /> {currency}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLang((l) => (l === "EN" ? "UR" : l === "UR" ? "AR" : "EN"))}
                className="text-ink-600"
              >
                <Languages className="h-4 w-4" aria-hidden /> {lang}
              </Button>
            </div>
            {status === "authenticated" && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex min-h-11 items-center px-3 py-3 text-pine-600 font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex min-h-11 items-center px-3 py-3 text-ink-800 font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  className="flex min-h-11 items-center px-3 py-3 text-left font-medium text-ink-800"
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
                  className="flex min-h-11 items-center px-3 py-3 text-ink-800 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/flights"
                  className="mt-2 flex min-h-11 items-center justify-center rounded-full bg-pine-500 px-3 py-3 font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Book Now
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
