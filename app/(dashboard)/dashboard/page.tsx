import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Ticket } from "lucide-react";

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
      b.status === "CONFIRMED" &&
      new Date(b.tourDate.startDate) > new Date()
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Welcome, {session.user.name ?? "Traveler"}
      </h1>
      <p className="mt-1 text-ink-500">Manage your bookings and profile</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-ink-500">Total Bookings</p>
            <p className="text-3xl font-semibold tabular-nums text-pine-700">
              {bookings.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-ink-500">Upcoming Trips</p>
            <p className="text-3xl font-semibold tabular-nums text-pine-700">
              {upcoming.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-ink-500">Completed</p>
            <p className="text-3xl font-semibold tabular-nums text-pine-700">
              {bookings.filter((b) => b.status === "COMPLETED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-medium text-pine-600 hover:text-pine-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-ink-500">
              No bookings yet.{" "}
              <Link
                href="/tours"
                className="font-medium text-pine-600 hover:underline"
              >
                Browse tours
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-2 rounded-md border border-line bg-sand/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-medium text-ink-900">
                      {booking.tour.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-ink-500">
                      <span className="flex items-center gap-1">
                        <Calendar
                          className="size-5"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                        {formatDate(booking.tourDate.startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin
                          className="size-5"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                        {booking.tour.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[booking.status]}>
                      {booking.status.toLowerCase()}
                    </Badge>
                    <span className="font-semibold tabular-nums text-ink-900">
                      {formatPrice(Number(booking.totalPrice))}
                    </span>
                    {booking.status === "CONFIRMED" && (
                      <Link
                        href={`/dashboard/bookings/${booking.id}/ticket`}
                        className="rounded-sm text-pine-600 hover:text-pine-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
                      >
                        <Ticket
                          className="size-5"
                          strokeWidth={1.5}
                          aria-label="View e-ticket"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
