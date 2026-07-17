"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { calculatePrice } from "@/actions/booking";
import { StripePaymentElement } from "@/components/shared/stripe-payment-element";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayPrice } from "@/components/shared/display-price";

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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
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

  async function createPaymentIntent() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not start payment");
        setLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setBookingId(data.bookingId);
      if (typeof data.amount === "number") {
        setPricing((prev) =>
          prev ? { ...prev, total: data.amount } : { total: data.amount, unitPrice: data.amount }
        );
      }
      setStep(3);
    } catch {
      toast.error("Payment setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink-900">Book: {tour.title}</h1>

      <div className="mt-4 flex gap-2" aria-hidden>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${s <= step ? "bg-primary-500" : "bg-primary-100"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-ink-500">
        {step === 1 && "Trip details"}
        {step === 2 && "Traveler information"}
        {step === 3 && "Secure payment"}
      </p>

      {step === 1 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Adults: {adults}</p>
            <p>Children: {children}</p>
            {pricing && (
              <p className="text-lg font-semibold text-primary-700">
                Total: <DisplayPrice amount={pricing.total} />
              </p>
            )}
            <Button onClick={() => setStep(2)} className="w-full bg-primary-500 hover:bg-primary-700">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Traveler Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={traveler.name}
                onChange={(e) => setTraveler({ ...traveler, name: e.target.value })}
                className="mt-1"
              />
              {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
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
              {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={traveler.phone}
                onChange={(e) => setTraveler({ ...traveler, phone: e.target.value })}
                className="mt-1"
              />
              {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone}</p>}
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
            {pricing && (
              <p className="text-sm text-ink-500">
                Amount due: <strong className="text-ink-900"><DisplayPrice amount={pricing.total} /></strong>
              </p>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1 bg-primary-500 hover:bg-primary-700"
                disabled={loading}
                onClick={() => {
                  if (validateStep2()) void createPaymentIntent();
                }}
              >
                {loading ? "Preparing payment…" : "Continue to payment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && clientSecret && bookingId && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Secure payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-primary-100/60 p-4 text-sm space-y-1">
              <p>
                <strong>Traveler:</strong> {traveler.name}
              </p>
              <p>
                <strong>Email:</strong> {traveler.email}
              </p>
              {pricing && (
                <p className="pt-1 text-xl font-bold text-ink-900">
                  <DisplayPrice amount={pricing.total} />
                </p>
              )}
            </div>
            <StripePaymentElement
              clientSecret={clientSecret}
              bookingId={bookingId}
              onBack={() => {
                setStep(2);
                setClientSecret(null);
                setBookingId(null);
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
