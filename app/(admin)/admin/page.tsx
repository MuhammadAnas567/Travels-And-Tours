import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bookingTitle, type ProductSnapshot } from "@/lib/commerce";
import {
  CalendarCheck,
  DollarSign,
  MessageSquare,
  FileText,
  Users,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const [
    bookingCount,
    pendingBookings,
    revenue,
    openQuotes,
    visaCount,
    userCount,
    recentBookings,
    recentQuotes,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({
      where: { status: { in: ["PENDING", "PENDING_VERIFICATION"] } },
    }),
    prisma.booking.aggregate({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      _sum: { totalPrice: true },
    }),
    prisma.quoteRequest.count({ where: { status: "NEW" } }),
    prisma.visaInquiry.count({ where: { status: "NEW" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        tour: { select: { title: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.quoteRequest.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        kind: true,
        name: true,
        email: true,
        destinations: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    {
      label: "All bookings",
      value: bookingCount,
      hint: pendingBookings ? `${pendingBookings} pending` : "Up to date",
      href: "/admin/bookings",
      icon: CalendarCheck,
    },
    {
      label: "Confirmed revenue",
      value: formatPrice(Number(revenue._sum.totalPrice ?? 0)),
      hint: "Confirmed + completed",
      href: "/admin/bookings",
      icon: DollarSign,
    },
    {
      label: "New form inquiries",
      value: openQuotes,
      hint: "Contact, hotels, cars, trips…",
      href: "/admin/quotes",
      icon: MessageSquare,
    },
    {
      label: "New visa inquiries",
      value: visaCount,
      hint: `${userCount} customers`,
      href: "/admin/visa-inquiries",
      icon: FileText,
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Admin Dashboard
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Bookings, website form inquiries, and visa requests in one place.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group block">
            <Card className="transition-shadow group-hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-pine-50">
                  <stat.icon className="size-5 text-pine-600" strokeWidth={1.5} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-ink-500">{stat.label}</p>
                  <p className="text-2xl font-semibold tabular-nums text-pine-700">
                    {stat.value}
                  </p>
                  <p className="truncate text-xs text-ink-400">{stat.hint}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Recent bookings</CardTitle>
            <Link
              href="/admin/bookings"
              className="text-sm font-medium text-pine-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-ink-500">No bookings yet.</p>
            ) : (
              <div className="-mx-6 overflow-x-auto px-6">
                <table className="min-w-[520px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-ink-500">
                      <th className="pb-3 pr-4 font-medium">Booking</th>
                      <th className="pb-3 pr-4 font-medium">Type</th>
                      <th className="pb-3 pr-4 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => {
                      const snapshot = b.productSnapshot as ProductSnapshot | null;
                      const title =
                        b.tour?.title ??
                        bookingTitle(b.type, snapshot ?? undefined);
                      return (
                        <tr key={b.id} className="border-b border-line">
                          <td className="py-3 pr-4 text-ink-900">
                            <p className="font-medium">{title}</p>
                            {b.bookingReference ? (
                              <p className="text-xs tabular-nums text-ink-500">
                                {b.bookingReference}
                              </p>
                            ) : null}
                          </td>
                          <td className="py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-ink-500">
                            {b.type}
                          </td>
                          <td className="py-3 pr-4 text-ink-700">
                            {b.user.name ?? b.user.email}
                          </td>
                          <td className="py-3">
                            <Badge>
                              {b.status.toLowerCase().replace(/_/g, " ")}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Recent form inquiries</CardTitle>
            <Link
              href="/admin/quotes"
              className="text-sm font-medium text-pine-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentQuotes.length === 0 ? (
              <p className="text-sm text-ink-500">No form inquiries yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentQuotes.map((q) => (
                  <li
                    key={q.id}
                    className="rounded-md border border-line bg-sand/60 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink-900">
                          {q.name}
                        </p>
                        <p className="truncate text-xs text-ink-500">{q.email}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge className="text-[0.65rem]">{q.status}</Badge>
                        <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-500">
                          {q.kind}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-ink-700">
                      {q.destinations.join(", ") || "No subject"}
                    </p>
                    <p className="mt-1 text-xs tabular-nums text-ink-400">
                      {formatDate(q.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/bookings"
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-paper px-4 text-sm font-medium text-ink-800 hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
        >
          All bookings
        </Link>
        <Link
          href="/admin/quotes"
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-paper px-4 text-sm font-medium text-ink-800 hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
        >
          All form inquiries
        </Link>
        <Link
          href="/admin/visa-inquiries"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-paper px-4 text-sm font-medium text-ink-800 hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
        >
          <Users className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Visa inquiries
        </Link>
      </div>
    </div>
  );
}
