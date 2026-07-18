"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitQuoteRequest } from "@/actions/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState = {
  name: string;
  email: string;
  phone: string;
  destinations: string;
  startDate: string;
  endDate: string;
  adults: string;
  children: string;
  budget: string;
  preferences: string;
};

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  destinations: "",
  startDate: "",
  endDate: "",
  adults: "2",
  children: "0",
  budget: "",
  preferences: "",
};

export function PlanTripForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<FormState>(initial);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvanceFrom(stepNum: number) {
    if (stepNum === 1) return values.name.trim() && values.email.trim();
    if (stepNum === 2) return values.destinations.trim();
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.set(k, v));
    const result = await submitQuoteRequest(fd);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Quote request submitted! We'll respond within 24 hours.");
    setValues(initial);
    setStep(1);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2" aria-hidden>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${s <= step ? "bg-pine-500" : "bg-line"}`}
          />
        ))}
      </div>
      <p className="sr-only">
        Step {step} of 3
      </p>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                required
                className="mt-1.5 h-12"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1.5 h-12"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">WhatsApp / phone</Label>
            <Input
              id="phone"
              name="phone"
              className="mt-1.5 h-12"
              placeholder="+92 300 ..."
              value={values.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="accent"
            disabled={!canAdvanceFrom(1)}
            onClick={() => setStep(2)}
          >
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
              value={values.destinations}
              onChange={(e) => setField("destinations", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                className="mt-1.5 h-12"
                value={values.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                className="mt-1.5 h-12"
                value={values.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              type="button"
              variant="accent"
              disabled={!canAdvanceFrom(2)}
              onClick={() => setStep(3)}
            >
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
              <Input
                id="adults"
                name="adults"
                type="number"
                min={1}
                className="mt-1.5 h-12"
                value={values.adults}
                onChange={(e) => setField("adults", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="children">Children</Label>
              <Input
                id="children"
                name="children"
                type="number"
                min={0}
                className="mt-1.5 h-12"
                value={values.children}
                onChange={(e) => setField("children", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                min={0}
                className="mt-1.5 h-12"
                value={values.budget}
                onChange={(e) => setField("budget", e.target.value)}
              />
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
              value={values.preferences}
              onChange={(e) => setField("preferences", e.target.value)}
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
