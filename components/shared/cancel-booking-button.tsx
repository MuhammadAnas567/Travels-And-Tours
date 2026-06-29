"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cancelBooking } from "@/actions/booking";
import { Button } from "@/components/ui/button";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setLoading(true);
    const result = await cancelBooking(bookingId);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Booking cancelled");
      window.location.reload();
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCancel}
      disabled={loading}
      className="text-red-600"
    >
      {loading ? "Cancelling..." : "Cancel"}
    </Button>
  );
}
