"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Ticket, User, Heart, Star } from "lucide-react";
import { usePreferences } from "@/components/providers/preferences-provider";

const links = [
  { href: "/dashboard", labelKey: "dash.overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", labelKey: "dash.bookings", icon: Ticket },
  { href: "/dashboard/reviews", labelKey: "dash.reviews", icon: Star },
  { href: "/dashboard/wishlist", labelKey: "dash.wishlist", icon: Heart },
  { href: "/dashboard/profile", labelKey: "dash.profile", icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { t } = usePreferences();

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <p className="mb-3 hidden text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 lg:block">
        {t("dash.account")}
      </p>
      <nav
        className="flex gap-1 overflow-x-auto scrollbar-hide rounded-md border border-line bg-paper p-1.5 shadow-sm lg:flex-col lg:overflow-visible lg:space-y-0.5 lg:p-2"
        aria-label="Dashboard navigation"
      >
        {links.map(({ href, labelKey, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500",
                active
                  ? "bg-pine-50 text-pine-700 font-semibold"
                  : "text-ink-600 hover:bg-sand hover:text-ink-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
              <span className="whitespace-nowrap">{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
