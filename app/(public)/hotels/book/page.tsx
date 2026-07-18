import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import { Hotel } from "@/lib/models/Hotel";
import { CommerceCheckout } from "@/components/booking/commerce-checkout";
import { nightsBetween } from "@/lib/commerce";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book hotel",
  description: "Confirm your stay and pay securely with Stripe.",
};

type Props = {
  searchParams: Promise<{
    hotelId?: string;
    room?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
    price?: string;
  }>;
};

export default async function HotelBookPage({ searchParams }: Props) {
  const params = await searchParams;
  const hotelId = params.hotelId?.trim();
  const checkIn = params.checkIn?.trim();
  const checkOut = params.checkOut?.trim();
  if (!hotelId || !checkIn || !checkOut) redirect("/hotels");

  const adults = Math.min(8, Math.max(1, Number(params.adults) || 2));
  const children = Math.min(6, Math.max(0, Number(params.children) || 0));
  const roomName = params.room?.trim() || "Standard room";

  await connectDB();
  const hotel = await Hotel.findById(hotelId).lean();
  if (!hotel) notFound();

  const nights = nightsBetween(checkIn, checkOut);
  const pricePerNight = Number(params.price) || hotel.pricePerNight;
  const subtotal = pricePerNight * nights;

  return (
    <div className="bg-sand min-h-[60vh]">
      <div className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <p className="eyebrow">Hotel checkout</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {hotel.name}
          </h1>
          <p className="mt-2 text-ink-500">
            {hotel.city}, {hotel.country} · {roomName} · {nights} night
            {nights === 1 ? "" : "s"}
          </p>
          <Link
            href={`/hotels/${hotel.slug}`}
            className="mt-4 inline-block text-sm font-semibold text-pine-600 link-underline"
          >
            ← Back to hotel
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <CommerceCheckout
          kind="HOTEL"
          title={hotel.name}
          subtitle={`${roomName} · ${hotel.city}`}
          subtotal={subtotal}
          requireAuthHref={`/hotels/book?hotelId=${hotelId}&room=${encodeURIComponent(roomName)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&price=${pricePerNight}`}
          summaryRows={[
            { label: "Room", value: roomName },
            { label: "Check-in", value: checkIn },
            { label: "Check-out", value: checkOut },
            { label: "Nights", value: String(nights) },
            { label: "Guests", value: String(adults + children) },
            { label: "Per night", value: formatPrice(pricePerNight) },
          ]}
          bookingPayload={{
            hotelId: String(hotel._id),
            roomName,
            checkIn,
            checkOut,
            adults,
            children,
            pricePerNight,
          }}
        />
      </div>
    </div>
  );
}
