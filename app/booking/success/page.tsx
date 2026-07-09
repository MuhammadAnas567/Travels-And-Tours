import Link from "next/link";
import { CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { formatDate, formatPrice } from "@/lib/utils";

type SearchParams = Promise<{
  booking_id?: string;
  payment_intent?: string;
  payment_intent_client_secret?: string;
  redirect_status?: string;
  session_id?: string;
}>;

async function resolveBooking(params: Awaited<SearchParams>) {
  if (params.booking_id) {
    const byId = await prisma.booking.findUnique({
      where: { id: params.booking_id },
      include: { tour: true, tourDate: true },
    });
    if (byId) return byId;
  }

  if (params.payment_intent) {
    const byPi = await prisma.booking.findFirst({
      where: { paymentIntentId: params.payment_intent },
      include: { tour: true, tourDate: true },
    });
    if (byPi) return byPi;
  }

  if (params.session_id) {
    const bySession = await prisma.booking.findFirst({
      where: { stripeSessionId: params.session_id },
      include: { tour: true, tourDate: true },
    });
    if (bySession) return bySession;

    // Fallback: look up Checkout Session → booking metadata
    const stripe = getStripe();
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(params.session_id);
        const bookingId = session.metadata?.bookingId;
        if (bookingId) {
          return prisma.booking.findUnique({
            where: { id: bookingId },
            include: { tour: true, tourDate: true },
          });
        }
      } catch {
        // ignore
      }
    }
  }

  return null;
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const booking = await resolveBooking(params);
  const confirmed = booking?.status === "CONFIRMED";
  const traveler = booking?.travelerInfo as { name?: string } | null;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      {confirmed ? (
        <CheckCircle className="h-16 w-16 text-success" aria-hidden />
      ) : (
        <Clock className="h-16 w-16 text-accent-500" aria-hidden />
      )}

      <h1 className="mt-4 text-2xl font-bold text-ink-900">
        {confirmed ? "Booking confirmed!" : "Payment received"}
      </h1>

      <p className="mt-2 text-ink-500">
        {confirmed
          ? "Thank you. A confirmation email with your e-ticket has been sent."
          : "Your payment is processing. Confirmation usually completes within a few seconds — refresh this page or check My Bookings."}
      </p>

      {booking && (
        <div className="mt-6 w-full rounded-2xl border border-line bg-surface p-5 text-left text-sm shadow-card space-y-2">
          {booking.bookingReference && (
            <p>
              <span className="text-ink-500">Reference</span>
              <br />
              <strong className="text-lg tracking-wide text-primary-500">
                {booking.bookingReference}
              </strong>
            </p>
          )}
          <p>
            <span className="text-ink-500">Tour</span>
            <br />
            <strong>{booking.tour.title}</strong>
          </p>
          <p>
            <span className="text-ink-500">Dates</span>
            <br />
            {formatDate(booking.tourDate.startDate)} — {formatDate(booking.tourDate.endDate)}
          </p>
          <p>
            <span className="text-ink-500">Traveler</span>
            <br />
            {traveler?.name ?? "—"}
          </p>
          <p>
            <span className="text-ink-500">Total paid</span>
            <br />
            <strong>{formatPrice(Number(booking.totalPrice))}</strong>
          </p>
          <p>
            <span className="text-ink-500">Status</span>
            <br />
            <strong className={confirmed ? "text-success" : "text-accent-600"}>
              {booking.status}
            </strong>
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Button asChild className="bg-primary-500 hover:bg-primary-700">
          <Link href="/dashboard/bookings">View bookings</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/tours">Browse more tours</Link>
        </Button>
      </div>
    </div>
  );
}
