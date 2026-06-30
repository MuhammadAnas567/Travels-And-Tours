import Link from "next/link";
import { getSession, signOut } from "@/lib/auth";
import { getPreferredCurrency } from "@/lib/locale";
import { Button } from "@/components/ui/button";
import { CurrencySwitcher } from "@/components/shared/currency-switcher";
import { Logo } from "@/components/shared/logo";
import { NavbarMobile } from "./navbar-mobile";

const navLinks = [
  { href: "/tours?audience=OUTBOUND", label: "Travel Abroad" },
  { href: "/tours?audience=INBOUND", label: "Visit Pakistan" },
  { href: "/visa", label: "Visa" },
  { href: "/plan-trip", label: "Plan Trip" },
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
    <header className="sticky top-0 z-50 border-b border-line/60 bg-sand/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
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
                <Link href="/dashboard">Dashboard</Link>
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
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <NavbarMobile session={session} navLinks={navLinks} currency={currency} />
      </div>
    </header>
  );
}
