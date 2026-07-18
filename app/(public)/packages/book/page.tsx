import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CommerceCheckout } from "@/components/booking/commerce-checkout";
import { getTourUnitPrice } from "@/lib/booking";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book package",
  description: "Confirm travellers and pay securely for your travel package.",
};

type Props = {
  searchParams: Promise<{
    tourId?: string;
    tourDateId?: string;
    adults?: string;
    children?: string;
  }>;
};

export default async function PackageBookPage({ searchParams }: Props) {
  const params = await searchParams;
  const tourId = params.tourId?.trim();
  const tourDateId = params.tourDateId?.trim();
  if (!tourId || !tourDateId) redirect("/packages");

  const adults = Math.min(20, Math.max(1, Number(params.adults) || 2));
  const children = Math.min(20, Math.max(0, Number(params.children) || 0));

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: { availableDates: true },
  });
  if (!tour || tour.status !== "ACTIVE") notFound();

  const tourDate = tour.availableDates.find((d) => d.id === tourDateId);
  if (!tourDate) notFound();

  const unit = getTourUnitPrice(tour);
  const subtotal = unit * adults + unit * 0.7 * children;

  return (
    <div className="bg-sand min-h-[60vh]">
      <div className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <p className="eyebrow">Package checkout</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {tour.title}
          </h1>
          <p className="mt-2 text-ink-500">
            {tour.location}, {tour.country} · {tour.durationDays} days
          </p>
          <Link
            href={`/tours/${tour.slug}`}
            className="mt-4 inline-block text-sm font-semibold text-pine-600 link-underline"
          >
            ← Package details
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <CommerceCheckout
          kind="PACKAGE"
          title={tour.title}
          subtitle={`${tour.durationDays} days · ${tour.location}`}
          subtotal={subtotal}
          requireAuthHref={`/packages/book?tourId=${tourId}&tourDateId=${tourDateId}&adults=${adults}&children=${children}`}
          summaryRows={[
            {
              label: "Departure",
              value: tourDate.startDate.toISOString().slice(0, 10),
            },
            {
              label: "Return",
              value: tourDate.endDate.toISOString().slice(0, 10),
            },
            { label: "Adults", value: String(adults) },
            { label: "Children", value: String(children) },
            { label: "From / adult", value: formatPrice(unit) },
          ]}
          bookingPayload={{
            tourId,
            tourDateId,
            adults,
            children,
          }}
        />
      </div>
    </div>
  );
}
