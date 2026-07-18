import Link from "next/link";
import { getSession, signOut } from "@/lib/auth";
import { getPreferredCurrency } from "@/lib/locale";
import { Button } from "@/components/ui/button";
import { CurrencySwitcher } from "@/components/shared/currency-switcher";
import { Logo } from "@/components/shared/logo";
import { NavbarMobile } from "./navbar-mobile";
import { PRIMARY_NAV, MORE_NAV, ALL_NAV } from "@/components/layout/nav-config";

const desktopLinks = [
  ...PRIMARY_NAV.map(({ href, label }) => ({ href, label })),
  ...MORE_NAV.slice(0, 3).map(({ href, label }) => ({ href, label })),
];

export async function Navbar() {
  const [session, currency] = await Promise.all([
    getSession(),
    getPreferredCurrency(),
  ]);

  const mobileLinks = ALL_NAV.map(({ href, label }) => ({ href, label }));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-paper">
      <div className="mx-auto flex h-14 min-[480px]:h-[4.5rem] w-full max-w-[1280px] items-center justify-between gap-2 px-3 min-[480px]:px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 shrink">
          <Logo />
        </div>

        <nav className="hidden lg:flex items-center gap-0.5 min-w-0 overflow-x-auto scrollbar-hide" aria-label="Main">
          {desktopLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm px-2 xl:px-3 py-2 text-[0.625rem] xl:text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-500 transition-colors hover:bg-sand hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <CurrencySwitcher value={currency} />
          {session?.user ? (
            <>
              {(session.user.role === "ADMIN" || session.user.role === "AGENT") && (
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

        <NavbarMobile session={session} navLinks={mobileLinks} currency={currency} />
      </div>
    </header>
  );
}
