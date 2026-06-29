"use client";

import { toast } from "sonner";
import { updateBookingStatus, refundBooking } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@prisma/client";

export function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  async function handleStatus(newStatus: BookingStatus) {
    await updateBookingStatus(bookingId, newStatus);
    toast.success("Status updated");
    window.location.reload();
  }

  async function handleRefund() {
    if (!confirm("Issue refund and cancel this booking?")) return;
    const result = await refundBooking(bookingId);
    if ("error" in result && result.error) toast.error(result.error);
    else {
      toast.success("Refund issued");
      window.location.reload();
    }
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status === "CONFIRMED" && (
        <>
          <Button size="sm" variant="ghost" onClick={() => handleStatus("COMPLETED")}>
            Complete
          </Button>
          <Button size="sm" variant="ghost" className="text-red-600" onClick={handleRefund}>
            Refund
          </Button>
        </>
      )}
      {status === "PENDING" && (
        <Button size="sm" variant="ghost" onClick={() => handleStatus("CANCELLED")}>
          Cancel
        </Button>
      )}
    </div>
  );
}
