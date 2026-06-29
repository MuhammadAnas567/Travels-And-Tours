import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CancelBookingButton } from "@/components/shared/cancel-booking-button";
import Link from "next/link";
import { Ticket } from "lucide-react";

const statusVariant = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
} as const;

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { tour: true, tourDate: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ocean-900">My Bookings</h1>
      <p className="mt-1 text-gray-600">{bookings.length} total bookings</p>

      <div className="mt-6 space-y-4">
        {bookings.length === 0 ? (
          <p className="text-gray-500">
            No bookings yet.{" "}
            <Link href="/tours" className="text-ocean-600 hover:underline">
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
                className="rounded-xl border border-ocean-100 bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-ocean-900">
                      {booking.tour.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {booking.tour.location}, {booking.tour.country}
                    </p>
                    <p className="mt-2 text-sm">
                      {formatDate(booking.tourDate.startDate)} —{" "}
                      {formatDate(booking.tourDate.endDate)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
                      {booking.children > 0 &&
                        `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={statusVariant[booking.status]}>
                      {booking.status.toLowerCase()}
                    </Badge>
                    <span className="text-lg font-bold text-ocean-700">
                      {formatPrice(Number(booking.totalPrice))}
                    </span>
                    <div className="flex gap-2">
                      {booking.status === "CONFIRMED" && (
                        <Link
                          href={`/dashboard/bookings/${booking.id}/ticket`}
                          className="flex items-center gap-1 text-sm text-ocean-600 hover:underline"
                        >
                          <Ticket className="h-4 w-4" aria-hidden />
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
