import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import { Flight } from "@/lib/models/Flight";
import { CommerceCheckout } from "@/components/booking/commerce-checkout";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book flight",
  description: "Complete passenger details and pay securely with Stripe.",
};

type Props = {
  searchParams: Promise<{
    flightId?: string;
    cabin?: string;
    adults?: string;
    children?: string;
  }>;
};

function cabinKey(raw?: string): "economy" | "business" | "first" {
  const c = (raw ?? "economy").toLowerCase();
  if (c.includes("business")) return "business";
  if (c.includes("first")) return "first";
  return "economy";
}

function unitPrice(
  prices: { economy?: number; business?: number; first?: number },
  cabin: "economy" | "business" | "first"
) {
  if (cabin === "first") return prices.first ?? prices.business ?? prices.economy ?? 0;
  if (cabin === "business") return prices.business ?? prices.economy ?? 0;
  return prices.economy ?? 0;
}

export default async function FlightBookPage({ searchParams }: Props) {
  const params = await searchParams;
  const flightId = params.flightId?.trim();
  if (!flightId) redirect("/flights");

  const cabin = cabinKey(params.cabin);
  const adults = Math.min(9, Math.max(1, Number(params.adults) || 1));
  const children = Math.min(8, Math.max(0, Number(params.children) || 0));
  const pax = adults + children;

  await connectDB();
  const flight = await Flight.findById(flightId).lean();
  if (!flight) notFound();

  const unit = unitPrice(flight.priceByClass as { economy?: number; business?: number; first?: number }, cabin);
  const subtotal = unit * pax;

  const depart = new Date(flight.departTime);
  const arrive = new Date(flight.arriveTime);

  return (
    <div className="bg-sand min-h-[60vh]">
      <div className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <p className="eyebrow">Flight checkout</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {flight.airline} {flight.flightNumber}
          </h1>
          <p className="mt-2 text-ink-500">
            {flight.from} → {flight.to} · {cabin} · {pax} traveller{pax === 1 ? "" : "s"}
          </p>
          <Link href="/flights" className="mt-4 inline-block text-sm font-semibold text-pine-600 link-underline">
            ← Back to search
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <CommerceCheckout
          kind="FLIGHT"
          title={`${flight.airline} ${flight.flightNumber}`}
          subtitle={`${flight.from} → ${flight.to} · ${cabin}`}
          subtotal={subtotal}
          passengerCount={pax}
          requireAuthHref={`/flights/book?flightId=${flightId}&cabin=${cabin}&adults=${adults}&children=${children}`}
          summaryRows={[
            { label: "Route", value: `${flight.from} → ${flight.to}` },
            {
              label: "Depart",
              value: depart.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              }),
            },
            {
              label: "Arrive",
              value: arrive.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              }),
            },
            { label: "Cabin", value: cabin },
            { label: "Fare / person", value: formatPrice(unit) },
            { label: "Travellers", value: String(pax) },
          ]}
          bookingPayload={{
            flightId: String(flight._id),
            cabin,
            adults,
            children,
          }}
        />
      </div>
    </div>
  );
}
