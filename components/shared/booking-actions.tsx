"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateBookingStatus, refundBooking } from "@/actions/admin";
import { verifyBookingPayment } from "@/actions/booking";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@prisma/client";

export function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function handleStatus(newStatus: BookingStatus) {
    await updateBookingStatus(bookingId, newStatus);
    toast.success("Status updated");
    window.location.reload();
  }

  async function handleVerify() {
    setVerifying(true);
    const result = await verifyBookingPayment(bookingId);
    setVerifying(false);
    if ("error" in result && result.error) toast.error(result.error);
    else {
      toast.success("Payment verified — booking confirmed");
      window.location.reload();
    }
  }

  async function handleConfirmRefund() {
    setRefunding(true);
    const result = await refundBooking(bookingId);
    setRefunding(false);
    setShowRefundConfirm(false);
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
          {showRefundConfirm ? (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-ink-500 px-1">Refund &amp; cancel?</span>
              <Button size="sm" variant="destructive" onClick={handleConfirmRefund} disabled={refunding}>
                {refunding ? "Processing..." : "Confirm"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRefundConfirm(false)}
                disabled={refunding}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-error"
              onClick={() => setShowRefundConfirm(true)}
            >
              Refund
            </Button>
          )}
        </>
      )}
      {status === "PENDING" && (
        <Button size="sm" variant="ghost" onClick={() => handleStatus("CANCELLED")}>
          Cancel
        </Button>
      )}
      {status === "PENDING_VERIFICATION" && (
        <>
          <Button size="sm" onClick={() => void handleVerify()} disabled={verifying}>
            {verifying ? "Verifying…" : "Verify payment"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleStatus("CANCELLED")}>
            Reject
          </Button>
        </>
      )}
    </div>
  );
}
