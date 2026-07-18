import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

export default async function BookingCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ booking_id?: string }>;
}) {
  const { booking_id } = await searchParams;

  if (booking_id) {
    await prisma.booking.updateMany({
      where: { id: booking_id, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <XCircle className="h-16 w-16 text-warning" strokeWidth={1.5} aria-hidden />
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Payment cancelled</h1>
      <p className="mt-2 text-ink-500 max-w-md leading-relaxed">
        Your payment was not completed. No charges were made and your seats were
        not reserved.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/tours">Back to Tours</Link>
        </Button>
      </div>
    </div>
  );
}
