"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe, User, Plane, Hotel, Package, Car, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/flights", label: "Flights", icon: Plane },
  { href: "/hotels", label: "Hotels", icon: Hotel },
  { href: "/packages", label: "Packages", icon: Package },
  { href: "/cars", label: "Cars", icon: Car },
  { href: "/things-to-do", label: "Things to Do", icon: MapPin },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // On home: transparent over hero until scroll. Elsewhere: always solid.
  const solid = !isHome || scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
        <Link href="/" className="flex items-center gap-2 shrink-0">
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

        <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                solid
                  ? "text-ink-700 hover:bg-primary-100 hover:text-primary-500"
                  : "text-white/95 hover:bg-white/15 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              solid
                ? "text-ink-700 hover:bg-primary-100"
                : "text-white hover:bg-white/15 hover:text-white"
            )}
          >
            <Globe className="h-4 w-4" /> USD
          </Button>
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
              <User className="h-4 w-4" /> Sign in
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
        </div>

        <button
          type="button"
          className={cn(
            "lg:hidden p-2 rounded-lg",
            solid ? "text-ink-900" : "text-white"
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-line bg-white px-4 py-4 shadow-float">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-xl px-3 py-3 text-ink-700 hover:bg-primary-100"
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
            <hr className="my-2 border-line" />
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
          </nav>
        </div>
      )}
    </header>
  );
}
