"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

import type { Currency } from "@prisma/client";
import { CurrencySwitcher } from "@/components/shared/currency-switcher";

export function NavbarMobile({
  session,
  navLinks,
  currency,
}: {
  session: Session | null;
  navLinks: { href: string; label: string }[];
  currency?: Currency;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-sm p-2 text-ink hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="auth-mobile-nav"
      >
        {open ? (
          <X className="size-5" strokeWidth={1.5} />
        ) : (
          <Menu className="size-5" strokeWidth={1.5} />
        )}
      </button>

      {open && (
        <div
          id="auth-mobile-nav"
          className="absolute left-0 right-0 top-14 min-[480px]:top-[4.5rem] z-50 border-b border-line bg-paper p-4 shadow-md max-h-[calc(100dvh-3.5rem)] min-[480px]:max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          {currency && (
            <div className="mb-3">
              <CurrencySwitcher value={currency} />
            </div>
          )}
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center rounded-sm px-3 py-2 text-sm font-medium text-ink-700 hover:bg-sand hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-line" />
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex min-h-11 items-center rounded-sm px-3 py-2 text-sm font-medium text-ink-700 hover:bg-sand hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex min-h-11 items-center rounded-sm px-3 py-2 text-sm font-medium text-pine-700 hover:bg-brass-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
                    onClick={() => setOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full min-h-11">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full min-h-11">Get started</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
