import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import type { TravelerInfo } from "@/types";
import { PrintButton } from "@/components/shared/print-button";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id, userId: session.user.id, status: "CONFIRMED" },
    include: { tour: true, tourDate: true },
  });

  if (!booking) notFound();

  const traveler = booking.travelerInfo as TravelerInfo;

  return (
    <div className="mx-auto max-w-2xl print:max-w-none">
      <div className="mb-4 flex justify-between print:hidden">
        <a href="/dashboard/bookings" className="text-sm text-ocean-600 hover:underline">
          ← Back to bookings
        </a>
        <PrintButton />
      </div>

      <div className="rounded-xl border-2 border-ocean-200 bg-white p-8">
        <div className="border-b border-ocean-100 pb-6 text-center">
          <h1 className="text-2xl font-bold text-ocean-800">UEB3 Tours</h1>
          <p className="mt-1 text-sm text-gray-500">Electronic Travel Ticket</p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Booking ID</span>
            <span className="font-mono font-medium">{booking.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tour</span>
            <span className="font-medium">{booking.tour.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Destination</span>
            <span>{booking.tour.location}, {booking.tour.country}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Departure</span>
            <span>{formatDate(booking.tourDate.startDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Return</span>
            <span>{formatDate(booking.tourDate.endDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Travelers</span>
            <span>
              {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
              {booking.children > 0 && `, ${booking.children} children`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Lead traveler</span>
            <span>{traveler.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span>{traveler.email}</span>
          </div>
          <div className="flex justify-between border-t border-ocean-100 pt-4">
            <span className="font-semibold">Total Paid</span>
            <span className="text-lg font-bold text-ocean-700">
              {formatPrice(Number(booking.totalPrice))}
            </span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Present this e-ticket at check-in. For support, contact hello@ueb3tours.com
        </p>
      </div>
    </div>
  );
}
