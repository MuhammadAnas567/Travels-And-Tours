import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BookingActions } from "@/components/shared/booking-actions";

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
      <div className="mt-6 overflow-x-auto rounded-md border border-line bg-paper">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-sand text-left text-ink-500">
              <th className="p-4 font-medium">Tour</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-line">
                <td className="p-4 text-ink-900">{b.tour.title}</td>
                <td className="p-4 text-ink-700">{b.user.name ?? b.user.email}</td>
                <td className="p-4 tabular-nums text-ink-700">
                  {formatDate(b.tourDate.startDate)}
                </td>
                <td className="p-4 tabular-nums text-ink-900">
                  {formatPrice(Number(b.totalPrice))}
                </td>
                <td className="p-4">
                  <Badge>{b.status.toLowerCase()}</Badge>
                </td>
                <td className="p-4">
                  <BookingActions bookingId={b.id} status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
