import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CancelBookingButton } from "@/components/shared/cancel-booking-button";
import Link from "next/link";
import { Ticket } from "lucide-react";

const statusVariant = {
  PENDING: "warning",
  PENDING_VERIFICATION: "warning",
  DEPOSIT_PAID: "secondary",
  CONFIRMED: "success",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
} as const;

export default async function BookingsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { tour: true, tourDate: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        My Bookings
      </h1>
      <p className="mt-1 text-ink-500">{bookings.length} total bookings</p>

      <div className="mt-6 space-y-4">
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
          bookings.map((booking) => {
            const daysUntil = Math.ceil(
              (booking.tourDate.startDate.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            );
            const canCancel =
              ["PENDING", "CONFIRMED"].includes(booking.status) && daysUntil >= 7;

            return (
              <div
                key={booking.id}
                className="rounded-md border border-line bg-sand/40 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-ink-900">
                      {booking.tour.title}
                    </h2>
                    <p className="mt-1 text-sm text-ink-500">
                      {booking.tour.location}, {booking.tour.country}
                    </p>
                    <p className="mt-2 text-sm tabular-nums text-ink-700">
                      {formatDate(booking.tourDate.startDate)} —{" "}
                      {formatDate(booking.tourDate.endDate)}
                    </p>
                    <p className="text-sm text-ink-500">
                      {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
                      {booking.children > 0 &&
                        `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={statusVariant[booking.status]}>
                      {booking.status.toLowerCase()}
                    </Badge>
                    <span className="text-lg font-semibold tabular-nums text-pine-700">
                      {formatPrice(Number(booking.totalPrice))}
                    </span>
                    <div className="flex gap-2">
                      {booking.status === "CONFIRMED" && (
                        <Link
                          href={`/dashboard/bookings/${booking.id}/ticket`}
                          className="flex min-h-11 items-center gap-1 text-sm font-medium text-pine-600 hover:text-pine-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2"
                        >
                          <Ticket
                            className="size-5"
                            strokeWidth={1.5}
                            aria-hidden
                          />
                          E-ticket
                        </Link>
                      )}
                      {canCancel && (
                        <CancelBookingButton bookingId={booking.id} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
