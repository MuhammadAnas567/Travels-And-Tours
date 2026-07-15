"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cancelBooking } from "@/actions/booking";
import { Button } from "@/components/ui/button";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleConfirmCancel() {
    setLoading(true);
    const result = await cancelBooking(bookingId);
    setLoading(false);
    setShowConfirm(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Booking cancelled");
      window.location.reload();
    }
  }

  if (showConfirm) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-500">Cancel this booking?</span>
        <Button size="sm" variant="destructive" onClick={handleConfirmCancel} disabled={loading}>
          {loading ? "Cancelling..." : "Confirm"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)} disabled={loading}>
          Keep
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowConfirm(true)}
      disabled={loading}
      className="text-error"
    >
      Cancel
    </Button>
  );
}
