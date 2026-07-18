import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import type { TravelerInfo } from "@/types";
import { PrintButton } from "@/components/shared/print-button";
import { bookingTitle, type ProductSnapshot } from "@/lib/commerce";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: {
      userId: session.user.id,
      status: "CONFIRMED",
      OR: [{ id }, { bookingReference: id }],
    },
    include: { tour: true, tourDate: true },
  });

  if (!booking) notFound();

  const traveler = booking.travelerInfo as TravelerInfo;
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
            UEB3 Travel
          </h1>
          <p className="mt-1 text-sm text-ink-500">Electronic Travel Ticket / Voucher</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-pine-600">
            {booking.type}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">Reference</span>
            <span className="font-mono font-medium text-ink-900">
              {booking.bookingReference ?? booking.id}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink-500">Product</span>
            <span className="font-medium text-right text-ink-900">{title}</span>
          </div>
          {(snapshot?.location || booking.tour) && (
            <div className="flex justify-between gap-4">
              <span className="text-ink-500">Location</span>
              <span className="text-right text-ink-700">
                {snapshot?.location ??
                  `${booking.tour!.location}, ${booking.tour!.country}`}
              </span>
            </div>
          )}
          {start ? (
            <div className="flex justify-between gap-4">
              <span className="text-ink-500">Start</span>
              <span className="tabular-nums text-ink-700">{formatDate(start)}</span>
            </div>
          ) : null}
          {end ? (
            <div className="flex justify-between gap-4">
              <span className="text-ink-500">End</span>
              <span className="tabular-nums text-ink-700">{formatDate(end)}</span>
            </div>
          ) : null}
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
          Present this e-ticket at check-in. For support, contact hello@ueb3tours.com
        </p>
      </div>
    </div>
  );
}
