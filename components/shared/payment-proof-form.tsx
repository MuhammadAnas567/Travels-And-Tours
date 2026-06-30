"use client";

import { useState } from "react";
import { toast } from "sonner";
import { uploadPaymentProof } from "@/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PaymentProofForm({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const proofUrl = (new FormData(e.currentTarget).get("proofUrl") as string)?.trim();
    if (!proofUrl) {
      toast.error("Please enter a proof URL");
      return;
    }
    setLoading(true);
    const result = await uploadPaymentProof(bookingId, proofUrl);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Payment proof submitted! We'll verify within 24 hours.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[var(--radius-lg)] border border-line bg-sand/50 p-6">
      <h3 className="font-medium text-ink">Upload payment proof</h3>
      <p className="text-sm text-muted">
        Paste a link to your receipt screenshot or PDF (Google Drive, Imgur, etc.)
      </p>
      <div>
        <Label htmlFor="proofUrl">Proof URL</Label>
        <Input id="proofUrl" name="proofUrl" type="url" required className="mt-1.5 h-12" placeholder="https://..." />
      </div>
      <Button type="submit" variant="accent" disabled={loading}>
        {loading ? "Uploading..." : "Submit proof"}
      </Button>
    </form>
  );
}
