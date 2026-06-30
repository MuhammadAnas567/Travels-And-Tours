"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitQuoteRequest } from "@/actions/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PlanTripForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await submitQuoteRequest(new FormData(e.currentTarget));
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Quote request submitted! We'll respond within 24 hours.");
    e.currentTarget.reset();
    setStep(1);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-line"}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required className="mt-1.5 h-12" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="mt-1.5 h-12" />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">WhatsApp / phone</Label>
            <Input id="phone" name="phone" className="mt-1.5 h-12" placeholder="+92 300 ..." />
          </div>
          <Button type="button" variant="accent" onClick={() => setStep(2)}>
            Next: Destinations
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="destinations">Destinations (comma-separated)</Label>
            <Input
              id="destinations"
              name="destinations"
              required
              className="mt-1.5 h-12"
              placeholder="Turkey, Dubai, Hunza"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" name="startDate" type="date" className="mt-1.5 h-12" />
            </div>
            <div>
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" name="endDate" type="date" className="mt-1.5 h-12" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" variant="accent" onClick={() => setStep(3)}>
              Next: Details
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="adults">Adults</Label>
              <Input id="adults" name="adults" type="number" min={1} defaultValue={2} className="mt-1.5 h-12" />
            </div>
            <div>
              <Label htmlFor="children">Children</Label>
              <Input id="children" name="children" type="number" min={0} defaultValue={0} className="mt-1.5 h-12" />
            </div>
            <div>
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input id="budget" name="budget" type="number" min={0} className="mt-1.5 h-12" />
            </div>
          </div>
          <div>
            <Label htmlFor="preferences">Preferences & special requests</Label>
            <Textarea
              id="preferences"
              name="preferences"
              rows={4}
              className="mt-1.5"
              placeholder="Hotel class, activities, dietary needs..."
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="submit" variant="accent" disabled={loading}>
              {loading ? "Submitting..." : "Get My Custom Quote"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
