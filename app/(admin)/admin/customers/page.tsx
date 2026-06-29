import Link from "next/link";
import { prisma } from "@/lib/db";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true } },
      bookings: {
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { tour: { select: { title: true } } },
      },
    },
  });

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <AdminSidebar />
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-ocean-900">Customers</h1>
        <div className="mt-6 space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-ocean-100 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold">{user.name ?? "No name"}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Joined {formatDate(user.createdAt)} · {user._count.bookings} bookings
                  </p>
                </div>
              </div>
              {user.bookings.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-ocean-50 pt-3 text-sm text-gray-600">
                  {user.bookings.map((b) => (
                    <li key={b.id}>• {b.tour.title} ({b.status.toLowerCase()})</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
