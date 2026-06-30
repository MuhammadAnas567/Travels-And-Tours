"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateVisaInquiryStatus } from "@/actions/visa";
import type { VisaInquiryStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const statuses: VisaInquiryStatus[] = [
  "NEW",
  "IN_REVIEW",
  "DOCS_NEEDED",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
];

export function VisaInquiryActions({
  inquiryId,
  currentStatus,
}: {
  inquiryId: string;
  currentStatus: VisaInquiryStatus;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    const result = await updateVisaInquiryStatus(inquiryId, status);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Status updated");
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Select value={status} onValueChange={(v) => setStatus(v as VisaInquiryStatus)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" onClick={handleUpdate} disabled={loading}>
        Update
      </Button>
    </div>
  );
}
