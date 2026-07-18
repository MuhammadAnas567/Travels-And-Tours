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
  Tag,
  Kanban,
  UserCog,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/crm", label: "CRM", icon: Kanban },
  { href: "/admin/quotes", label: "Quotes", icon: MessageSquare },
  { href: "/admin/agents", label: "Agents", icon: UserCog },
  { href: "/admin/tours", label: "Tours", icon: Map },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/visa-inquiries", label: "Visa", icon: FileText },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-60">
      <p className="mb-3 hidden text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 lg:block">
        Admin
      </p>
      <nav
        className="flex gap-1 overflow-x-auto scrollbar-hide rounded-md border border-line bg-paper p-1.5 shadow-sm lg:flex-col lg:overflow-visible lg:space-y-0.5 lg:p-2"
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
                "flex min-h-11 shrink-0 items-center gap-2.5 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500",
                active
                  ? "bg-pine-50 text-pine-700 font-semibold"
                  : "text-ink-600 hover:bg-sand hover:text-ink-900"
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
