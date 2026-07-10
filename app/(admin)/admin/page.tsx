import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import {
  CalendarCheck,
  DollarSign,
  Map,
  Users,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const [bookingCount, revenue, tourCount, userCount, recentBookings] =
    await Promise.all([
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.booking.aggregate({
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
        _sum: { totalPrice: true },
      }),
      prisma.tour.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          tour: { select: { title: true } },
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

  const stats = [
    {
      label: "Total Bookings",
      value: bookingCount,
      icon: CalendarCheck,
    },
    {
      label: "Revenue",
      value: formatPrice(Number(revenue._sum.totalPrice ?? 0)),
      icon: DollarSign,
    },
    {
      label: "Active Tours",
      value: tourCount,
      icon: Map,
    },
    {
      label: "Customers",
      value: userCount,
      icon: Users,
    },
  ];

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <AdminSidebar />
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-ink-900">Admin Dashboard</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <stat.icon className="h-6 w-6 text-primary-500" aria-hidden />
                </div>
                <div>
                  <p className="text-sm text-ink-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-primary-700">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-ink-500">
                    <th className="pb-3 pr-4">Tour</th>
                    <th className="pb-3 pr-4">Customer</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="border-b border-line">
                      <td className="py-3 pr-4">{b.tour.title}</td>
                      <td className="py-3 pr-4">
                        {b.user.name ?? b.user.email}
                      </td>
                      <td className="py-3 pr-4">
                        {formatPrice(Number(b.totalPrice))}
                      </td>
                      <td className="py-3 capitalize">{b.status.toLowerCase()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link
              href="/admin/bookings"
              className="mt-4 inline-block text-sm text-primary-500 hover:underline"
            >
              View all bookings →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
