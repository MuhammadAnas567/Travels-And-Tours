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
        <a
          href="/dashboard/bookings"
          className="text-sm font-medium text-pine-600 hover:text-pine-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
        >
          ← Back to bookings
        </a>
        <PrintButton />
      </div>

      <div className="rounded-md border-2 border-line bg-paper p-8 shadow-sm">
        <div className="border-b border-line pb-6 text-center">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
            UEB3 Tours
          </h1>
          <p className="mt-1 text-sm text-ink-500">Electronic Travel Ticket</p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">Booking ID</span>
            <span className="font-mono font-medium text-ink-900">
              {booking.id}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">Tour</span>
            <span className="font-medium text-ink-900">{booking.tour.title}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">Destination</span>
            <span className="text-ink-700">
              {booking.tour.location}, {booking.tour.country}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">Departure</span>
            <span className="tabular-nums text-ink-700">
              {formatDate(booking.tourDate.startDate)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">Return</span>
            <span className="tabular-nums text-ink-700">
              {formatDate(booking.tourDate.endDate)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">Travelers</span>
            <span className="text-ink-700">
              {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
              {booking.children > 0 && `, ${booking.children} children`}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">Lead traveler</span>
            <span className="text-ink-700">{traveler.name}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">Email</span>
            <span className="text-ink-700">{traveler.email}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-4">
            <span className="font-semibold text-ink-900">Total Paid</span>
            <span className="text-lg font-semibold tabular-nums text-pine-700">
              {formatPrice(Number(booking.totalPrice))}
            </span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-ink-300">
          Present this e-ticket at check-in. For support, contact
          hello@ueb3tours.com
        </p>
      </div>
    </div>
  );
}
