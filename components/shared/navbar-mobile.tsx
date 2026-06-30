"use client";

import { useState } from "react";
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

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="rounded-lg p-2 text-ink hover:bg-surface"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-line bg-surface p-4 shadow-lg">
          {currency && (
            <div className="mb-3">
              <CurrencySwitcher value={currency} />
            </div>
          )}
          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-ocean-50"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-ocean-100" />
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-ocean-50"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-ocean-50"
                    onClick={() => setOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full">Get started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
