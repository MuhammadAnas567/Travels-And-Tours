"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitVisaInquiry } from "@/actions/visa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type VisaInquiryFormProps = {
  visaInfoId: string;
  country: string;
  isLoggedIn: boolean;
};

export function VisaInquiryForm({
  visaInfoId,
  country,
  isLoggedIn,
}: VisaInquiryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/visa/${country.toLowerCase().replace(/\s+/g, "-")}`);
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await submitVisaInquiry(formData);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Visa assistance request submitted!");
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-md">
      <input type="hidden" name="visaInfoId" value={visaInfoId} />
      <input type="hidden" name="country" value={country} />
      <div>
        <Label htmlFor="travelDate">Planned travel date</Label>
        <Input id="travelDate" name="travelDate" type="date" className="mt-1.5 h-12" />
      </div>
      <div>
        <Label htmlFor="notes">Additional notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Passport details, family members travelling, urgency..."
          className="mt-1.5"
        />
      </div>
      <Button type="submit" variant="accent" className="w-full" disabled={loading}>
        {loading ? "Submitting..." : "Request Visa Assistance"}
      </Button>
      {!isLoggedIn && (
        <p className="text-center text-sm text-muted">
          You&apos;ll be asked to sign in before submitting.
        </p>
      )}
    </form>
  );
}
