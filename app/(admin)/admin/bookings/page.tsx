import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BookingActions } from "@/components/shared/booking-actions";
import { bookingTitle, type ProductSnapshot } from "@/lib/commerce";

function parseBookingDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const raw = value.trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = new Date(`${raw}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tour: { select: { title: true } },
      tourDate: true,
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Bookings
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        All flight, tour, hotel, and package bookings from the site.
      </p>
      {bookings.length === 0 ? (
        <p className="mt-8 rounded-md border border-line bg-paper p-6 text-sm text-ink-500">
          No bookings yet. New flight and tour bookings will appear here.
        </p>
      ) : (
      <div className="-mx-4 mt-6 overflow-x-auto overscroll-x-contain border-y border-line bg-paper sm:mx-0 sm:rounded-md sm:border [-webkit-overflow-scrolling:touch]">
        <table className="min-w-[800px] w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-sand text-left text-ink-500">
              <th className="p-4 font-medium">Booking</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const snapshot = b.productSnapshot as ProductSnapshot | null;
              const title =
                b.tour?.title ?? bookingTitle(b.type, snapshot ?? undefined);
              const start =
                parseBookingDate(b.tourDate?.startDate) ??
                parseBookingDate(snapshot?.startDate);
              return (
                <tr key={b.id} className="border-b border-line">
                  <td className="p-4 text-ink-900">
                    <p className="font-medium">{title}</p>
                    {b.bookingReference ? (
                      <p className="mt-0.5 text-xs tabular-nums text-ink-500">
                        {b.bookingReference}
                      </p>
                    ) : null}
                  </td>
                  <td className="p-4 text-xs font-semibold uppercase tracking-wider text-ink-500">
                    {b.type}
                  </td>
                  <td className="p-4 text-ink-700">{b.user.name ?? b.user.email}</td>
                  <td className="p-4 tabular-nums text-ink-700">
                    {start ? formatDate(start) : "—"}
                  </td>
                  <td className="p-4 tabular-nums text-ink-900">
                    {formatPrice(Number(b.totalPrice))}
                  </td>
                  <td className="p-4">
                    <Badge>{b.status.toLowerCase().replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="p-4">
                    <BookingActions bookingId={b.id} status={b.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
