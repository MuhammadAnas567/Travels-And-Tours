import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CommerceCheckout } from "@/components/booking/commerce-checkout";
import { daysBetween } from "@/lib/commerce";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book car hire",
  description: "Confirm pickup and pay securely with Stripe.",
};

type Props = {
  searchParams: Promise<{
    carId?: string;
    location?: string;
    pickup?: string;
    return?: string;
  }>;
};

export default async function CarBookPage({ searchParams }: Props) {
  const params = await searchParams;
  const carId = params.carId?.trim();
  if (!carId) redirect("/cars");

  const car = await prisma.carListing.findUnique({ where: { id: carId } });
  if (!car || !car.isActive) notFound();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const week = new Date();
  week.setDate(week.getDate() + 4);

  const pickupDate = params.pickup?.trim() || tomorrow.toISOString().slice(0, 10);
  const returnDate = params.return?.trim() || week.toISOString().slice(0, 10);
  const location = params.location?.trim() || car.locations[0] || "Airport";
  const days = daysBetween(pickupDate, returnDate);
  const subtotal = car.pricePerDay * days;

  return (
    <div className="bg-sand min-h-[60vh]">
      <div className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <p className="eyebrow">Car hire checkout</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {car.name}
          </h1>
          <p className="mt-2 text-ink-500">
            {location} · {days} day{days === 1 ? "" : "s"} · {car.transmission}
          </p>
          <Link href="/cars" className="mt-4 inline-block text-sm font-semibold text-pine-600 link-underline">
            ← Back to cars
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <CommerceCheckout
          kind="CAR"
          title={car.name}
          subtitle={`${car.category} · ${location}`}
          subtotal={subtotal}
          requireAuthHref={`/cars/book?carId=${carId}&location=${encodeURIComponent(location)}&pickup=${pickupDate}&return=${returnDate}`}
          summaryRows={[
            { label: "Vehicle", value: car.name },
            { label: "Pickup", value: location },
            { label: "From", value: pickupDate },
            { label: "Until", value: returnDate },
            { label: "Days", value: String(days) },
            { label: "Per day", value: formatPrice(car.pricePerDay) },
          ]}
          bookingPayload={{
            carId: car.id,
            pickupLocation: location,
            pickupDate,
            returnDate,
          }}
        />
      </div>
    </div>
  );
}
