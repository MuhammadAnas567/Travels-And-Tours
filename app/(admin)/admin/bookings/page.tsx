import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BookingActions } from "@/components/shared/booking-actions";
import { bookingTitle, type ProductSnapshot } from "@/lib/commerce";

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
      <div className="-mx-4 mt-6 overflow-x-auto border-y border-line bg-paper sm:mx-0 sm:rounded-md sm:border">
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
              const start = b.tourDate?.startDate
                ? b.tourDate.startDate
                : snapshot?.startDate
                  ? new Date(snapshot.startDate)
                  : null;
              return (
                <tr key={b.id} className="border-b border-line">
                  <td className="p-4 text-ink-900">{title}</td>
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
    </div>
  );
}
