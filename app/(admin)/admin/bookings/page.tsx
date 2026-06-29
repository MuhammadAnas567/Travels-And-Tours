import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
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
    <div className="flex flex-col gap-8 lg:flex-row">
      <AdminSidebar />
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-ocean-900">Bookings</h1>
        <div className="mt-6 overflow-x-auto rounded-xl border border-ocean-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ocean-100 bg-ocean-50 text-left text-gray-600">
                <th className="p-4">Tour</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-ocean-50">
                  <td className="p-4">{b.tour.title}</td>
                  <td className="p-4">{b.user.name ?? b.user.email}</td>
                  <td className="p-4">{formatDate(b.tourDate.startDate)}</td>
                  <td className="p-4">{formatPrice(Number(b.totalPrice))}</td>
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
    </div>
  );
}
