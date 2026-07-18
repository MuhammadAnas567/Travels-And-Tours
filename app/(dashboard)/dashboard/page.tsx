import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { DashboardWelcome, DashLabel } from "@/components/dashboard/dashboard-chrome";
import { DisplayPrice } from "@/components/shared/display-price";

const statusVariant = {
  PENDING: "warning",
  PENDING_VERIFICATION: "warning",
  DEPOSIT_PAID: "secondary",
  CONFIRMED: "success",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
} as const;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { tour: true, tourDate: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const upcoming = bookings.filter(
    (b) =>
      b.status === "CONFIRMED" && new Date(b.tourDate.startDate) > new Date()
  );
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <div>
      <DashboardWelcome name={session.user.name ?? "Traveler"} />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { key: "dash.totalBookings", value: bookings.length },
          { key: "dash.upcoming", value: upcoming.length },
          { key: "dash.completed", value: completed },
        ].map((stat) => (
          <div
            key={stat.key}
            className="rounded-md border border-line bg-sand/50 p-5 sm:p-6"
          >
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
              <DashLabel k={stat.key} />
            </p>
            <p className="mt-2 font-display text-3xl font-semibold tabular-nums text-pine-700">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            <DashLabel k="dash.recent" />
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-semibold text-pine-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
          >
            <DashLabel k="dash.viewAll" />
          </Link>
        </div>

        <div className="mt-4">
          {bookings.length === 0 ? (
            <p className="rounded-md border border-dashed border-line bg-sand/40 px-5 py-8 text-ink-500">
              <DashLabel k="dash.noBookings" />{" "}
              <Link href="/tours" className="font-semibold text-pine-600 hover:underline">
                <DashLabel k="dash.browseTours" />
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-3 rounded-md border border-line bg-sand/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink-900">
                      {booking.tour.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-ink-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                        {formatDate(booking.tourDate.startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                        {booking.tour.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[booking.status]}>
                      {booking.status.toLowerCase()}
                    </Badge>
                    <span className="font-semibold tabular-nums text-ink-900">
                      <DisplayPrice amount={Number(booking.totalPrice)} />
                    </span>
                    {booking.status === "CONFIRMED" && (
                      <Link
                        href={`/dashboard/bookings/${booking.id}/ticket`}
                        className="rounded-sm text-pine-600 hover:text-pine-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
                      >
                        <Ticket className="h-5 w-5" strokeWidth={1.5} aria-label="View e-ticket" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
