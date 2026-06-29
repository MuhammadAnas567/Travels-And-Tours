import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingSuccessPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <CheckCircle className="h-16 w-16 text-green-600" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold text-ocean-900">Booking Confirmed!</h1>
      <p className="mt-2 text-gray-600">
        Thank you for your payment. A confirmation email with your e-ticket has
        been sent to your inbox.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/dashboard/bookings">View Bookings</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/tours">Browse More Tours</Link>
        </Button>
      </div>
    </div>
  );
}
