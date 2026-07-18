"use client";

import { toast } from "sonner";
import { moderateReview } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ReviewActions({
  reviewId,
  approved,
}: {
  reviewId: string;
  approved: boolean;
}) {
  async function handleModerate(approve: boolean) {
    await moderateReview(reviewId, approve);
    toast.success(approve ? "Review approved" : "Review hidden");
    window.location.reload();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Badge variant={approved ? "success" : "warning"}>
        {approved ? "Approved" : "Pending"}
      </Badge>
      {!approved && (
        <Button size="sm" onClick={() => handleModerate(true)}>
          Approve
        </Button>
      )}
      {approved && (
        <Button size="sm" variant="outline" onClick={() => handleModerate(false)}>
          Hide
        </Button>
      )}
    </div>
  );
}
