import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CancelBookingButton } from "@/components/shared/cancel-booking-button";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { bookingTitle, type ProductSnapshot } from "@/lib/commerce";

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
            <Link href="/flights" className="font-medium text-pine-600 hover:underline">
              Book a flight
            </Link>
            {" · "}
            <Link href="/hotels" className="font-medium text-pine-600 hover:underline">
              Find hotels
            </Link>
            {" · "}
            <Link href="/tours" className="font-medium text-pine-600 hover:underline">
              Browse tours
            </Link>
          </p>
        ) : (
          bookings.map((booking) => {
            const snapshot = booking.productSnapshot as ProductSnapshot | null;
            const title =
              booking.tour?.title ?? bookingTitle(booking.type, snapshot ?? undefined);
            const start = booking.tourDate?.startDate
              ? booking.tourDate.startDate
              : snapshot?.startDate
                ? new Date(snapshot.startDate)
                : null;
            const end = booking.tourDate?.endDate
              ? booking.tourDate.endDate
              : snapshot?.endDate
                ? new Date(snapshot.endDate)
                : null;
            const daysUntil = start
              ? Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : 999;
            const canCancel =
              ["PENDING", "CONFIRMED"].includes(booking.status) && daysUntil >= 7;

            return (
              <div
                key={booking.id}
                className="rounded-md border border-line bg-sand/40 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-ink-900">{title}</h2>
                      <span className="rounded-sm bg-pine-50 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-pine-700">
                        {booking.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-500">
                      {snapshot?.location ??
                        (booking.tour
                          ? `${booking.tour.location}, ${booking.tour.country}`
                          : "—")}
                    </p>
                    {start && end ? (
                      <p className="mt-2 text-sm tabular-nums text-ink-700">
                        {formatDate(start)} — {formatDate(end)}
                      </p>
                    ) : null}
                    <p className="text-sm text-ink-500">
                      {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
                      {booking.children > 0 &&
                        `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}`}
                    </p>
                    {booking.bookingReference ? (
                      <p className="mt-1 text-xs font-medium tabular-nums text-ink-500">
                        Ref {booking.bookingReference}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-stretch gap-2 sm:items-end">
                    <Badge variant={statusVariant[booking.status]}>
                      {booking.status.replace(/_/g, " ")}
                    </Badge>
                    <p className="text-lg font-semibold tabular-nums text-ink-900">
                      {formatPrice(Number(booking.totalPrice))}
                    </p>
                    {booking.status === "CONFIRMED" ? (
                      <Link
                        href={`/dashboard/bookings/${booking.id}/ticket`}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-line bg-paper px-3 text-sm font-semibold text-pine-700 hover:bg-pine-50"
                      >
                        <Ticket className="h-4 w-4" strokeWidth={1.5} />
                        E-ticket
                      </Link>
                    ) : null}
                    {canCancel ? <CancelBookingButton bookingId={booking.id} /> : null}
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
