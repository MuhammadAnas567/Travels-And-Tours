import { prisma } from "@/lib/db";
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
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Customers
      </h1>
      <div className="mt-6 space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-md border border-line bg-paper p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-ink-900">
                  {user.name ?? "No name"}
                </h2>
                <p className="text-sm text-ink-500">{user.email}</p>
                <p className="mt-1 text-xs text-ink-300">
                  Joined {formatDate(user.createdAt)} · {user._count.bookings}{" "}
                  bookings
                </p>
              </div>
            </div>
            {user.bookings.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-line pt-3 text-sm text-ink-500">
                {user.bookings.map((b) => (
                  <li key={b.id}>
                    • {b.tour.title} ({b.status.toLowerCase()})
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
