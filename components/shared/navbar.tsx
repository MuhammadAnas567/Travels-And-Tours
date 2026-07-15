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
    <header className="sticky top-0 z-50 w-full border-b border-line bg-paper">
      <div className="mx-auto flex h-14 min-[480px]:h-[4.5rem] w-full max-w-[1280px] items-center justify-between gap-2 px-3 min-[480px]:px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 shrink">
          <Logo />
        </div>

        <nav className="hidden xl:flex items-center gap-0.5" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-500 transition-colors hover:bg-sand hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-2">
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
