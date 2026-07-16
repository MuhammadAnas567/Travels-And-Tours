"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Users,
  Star,
  FileText,
  MessageSquare,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/tours", label: "Tours", icon: Map },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/visa-inquiries", label: "Visa", icon: FileText },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/quotes", label: "Quotes", icon: MessageSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-56">
      <nav
        className="flex gap-1 overflow-x-auto scrollbar-hide pb-1 lg:flex-col lg:overflow-visible lg:space-y-1 lg:pb-0"
        aria-label="Admin navigation"
      >
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-2 rounded-sm border-b-2 border-transparent px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 lg:border-b-0 lg:border-l-2 lg:gap-3",
                active
                  ? "border-pine-500 bg-pine-50 text-pine-700"
                  : "text-ink-500 hover:bg-sand hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
