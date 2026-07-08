import Link from "next/link";
import { getSession, signOut } from "@/lib/auth";
import { getPreferredCurrency } from "@/lib/locale";
import { Button } from "@/components/ui/button";
import { CurrencySwitcher } from "@/components/shared/currency-switcher";
import { Logo } from "@/components/shared/logo";
import { NavbarMobile } from "./navbar-mobile";

const navLinks = [
  { href: "/tours", label: "Destinations" },
  { href: "/tours?category=LUXURY", label: "Luxury" },
  { href: "/tours?category=ADVENTURE", label: "Adventure" },
  { href: "/visa", label: "Visa" },
  { href: "/deals", label: "Deals" },
  { href: "/blog", label: "Guides" },
  { href: "/contact", label: "Contact" },
];

export async function Navbar() {
  const [session, currency] = await Promise.all([
    getSession(),
    getPreferredCurrency(),
  ]);

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[var(--radius-md)] px-3.5 py-2 text-[0.8125rem] font-medium tracking-wide text-muted transition-colors hover:bg-pearl hover:text-midnight"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <CurrencySwitcher value={currency} />
          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">My Trips</Link>
              </Button>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="outline" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="accent" size="sm" asChild>
                <Link href="/plan-trip">Plan Your Trip</Link>
              </Button>
            </>
          )}
        </div>

        <NavbarMobile session={session} navLinks={navLinks} currency={currency} />
      </div>
    </header>
  );
}
