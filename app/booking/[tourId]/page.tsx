import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { BookingFlow } from "@/components/shared/booking-flow";

type Props = {
  params: Promise<{ tourId: string }>;
  searchParams: Promise<{
    tourDateId?: string;
    adults?: string;
    children?: string;
  }>;
};

export default async function BookingPage({ params, searchParams }: Props) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login?callbackUrl=/booking");
  }

  const { tourId } = await params;
  const sp = await searchParams;

  const tourDateId = sp.tourDateId;
  const adults = Number(sp.adults) || 1;
  const children = Number(sp.children) || 0;

  if (!tourDateId) redirect("/tours");

  const tour = await prisma.tour.findUnique({
    where: { id: tourId, status: "ACTIVE" },
  });

  if (!tour) notFound();

  return (
    <BookingFlow
      tour={{ id: tour.id, title: tour.title }}
      tourDateId={tourDateId}
      adults={adults}
      children={children}
    />
  );
}
