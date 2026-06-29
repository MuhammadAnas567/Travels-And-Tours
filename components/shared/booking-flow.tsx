"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBookingAndCheckout, calculatePrice } from "@/actions/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useEffect } from "react";

export function BookingFlow({
  tour,
  tourDateId,
  adults,
  children,
}: {
  tour: { id: string; title: string };
  tourDateId: string;
  adults: number;
  children: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState<{ total: number; unitPrice: number } | null>(null);
  const [traveler, setTraveler] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    calculatePrice(tour.id, tourDateId, adults, children).then((result) => {
      if ("total" in result && result.total) {
        setPricing({ total: result.total, unitPrice: result.unitPrice! });
      } else if ("error" in result) {
        toast.error(result.error);
        router.push("/tours");
      }
    });
  }, [tour.id, tourDateId, adults, children, router]);

  function validateStep2() {
    const newErrors: Record<string, string> = {};
    if (!traveler.name || traveler.name.length < 2) newErrors.name = "Name is required";
    if (!traveler.email || !traveler.email.includes("@")) newErrors.email = "Valid email required";
    if (!traveler.phone || traveler.phone.length < 7) newErrors.phone = "Valid phone required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleConfirm() {
    setLoading(true);
    const result = await createBookingAndCheckout({
      tourId: tour.id,
      tourDateId,
      adults,
      children,
      travelerInfo: {
        name: traveler.name,
        email: traveler.email,
        phone: traveler.phone,
      },
      specialRequests: traveler.specialRequests || undefined,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ocean-900">Book: {tour.title}</h1>

      <div className="mt-4 flex gap-2" aria-hidden>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${s <= step ? "bg-ocean-600" : "bg-ocean-100"}`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Trip Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p>Adults: {adults}</p>
            <p>Children: {children}</p>
            {pricing && (
              <p className="text-lg font-semibold text-ocean-700">
                Total: {formatPrice(pricing.total)}
              </p>
            )}
            <Button onClick={() => setStep(2)} className="w-full">Continue</Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Traveler Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={traveler.name}
                onChange={(e) => setTraveler({ ...traveler, name: e.target.value })}
                className="mt-1"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={traveler.email}
                onChange={(e) => setTraveler({ ...traveler, email: e.target.value })}
                className="mt-1"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={traveler.phone}
                onChange={(e) => setTraveler({ ...traveler, phone: e.target.value })}
                className="mt-1"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="specialRequests">Special requests (optional)</Label>
              <Textarea
                id="specialRequests"
                value={traveler.specialRequests}
                onChange={(e) => setTraveler({ ...traveler, specialRequests: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                className="flex-1"
                onClick={() => validateStep2() && setStep(3)}
              >
                Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Review & Pay</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-ocean-50 p-4 text-sm space-y-1">
              <p><strong>Traveler:</strong> {traveler.name}</p>
              <p><strong>Email:</strong> {traveler.email}</p>
              <p><strong>Phone:</strong> {traveler.phone}</p>
            </div>
            {pricing && (
              <p className="text-2xl font-bold text-ocean-700">{formatPrice(pricing.total)}</p>
            )}
            <p className="text-sm text-gray-500">
              You will be redirected to Stripe for secure payment.
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button className="flex-1" onClick={handleConfirm} disabled={loading}>
                {loading ? "Processing..." : "Confirm & Pay"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
