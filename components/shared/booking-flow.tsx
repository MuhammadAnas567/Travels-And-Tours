"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { calculatePrice, createBookingWithLocalPayment } from "@/actions/booking";
import { validateCouponCode } from "@/actions/coupons";
import { StripePaymentElement } from "@/components/shared/stripe-payment-element";
import { ChargeCurrencyNotice } from "@/components/shared/charge-currency-notice";
import { PaymentMethodPicker } from "@/components/booking/payment-method-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayPrice } from "@/components/shared/display-price";
import { siteConfig } from "@/lib/site-config";

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
  const [pricing, setPricing] = useState<{
    total: number;
    unitPrice: number;
    subtotal: number;
    discount: number;
  } | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
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
        setPricing({
          total: result.total,
          unitPrice: result.unitPrice!,
          subtotal: result.total,
          discount: 0,
        });
        setAppliedCoupon(null);
      } else if ("error" in result) {
        toast.error(result.error);
        router.push("/tours");
      }
    });
  }, [tour.id, tourDateId, adults, children, router]);

  async function applyCoupon() {
    if (!pricing) return;
    setCouponBusy(true);
    const result = await validateCouponCode({
      code: couponInput,
      tourId: tour.id,
      subtotal: pricing.subtotal,
    });
    setCouponBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setAppliedCoupon(result.coupon.code);
    setPricing({
      ...pricing,
      total: result.coupon.finalTotal,
      discount: result.coupon.discountAmount,
    });
    toast.success(`Coupon ${result.coupon.code} applied`);
  }

  function clearCoupon() {
    if (!pricing) return;
    setAppliedCoupon(null);
    setCouponInput("");
    setPricing({ ...pricing, total: pricing.subtotal, discount: 0 });
  }

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
          couponCode: appliedCoupon ?? undefined,
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
      if (typeof data.amount === "number" && pricing) {
        setPricing({ ...pricing, total: data.amount });
      }
    } catch {
      toast.error("Payment setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function ensureLocalBooking(
    paymentMethod: "BANK_TRANSFER" | "EASYPAISA" | "JAZZCASH"
  ) {
    if (bookingId) return bookingId;
    const result = await createBookingWithLocalPayment({
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
      paymentMethod,
    });
    if ("error" in result && result.error) {
      toast.error(result.error);
      return null;
    }
    if ("bookingId" in result && result.bookingId) {
      setBookingId(result.bookingId);
      return result.bookingId;
    }
    return null;
  }

  async function handleBankPayment() {
    setLoading(true);
    try {
      const result = await createBookingWithLocalPayment({
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
        paymentMethod: "BANK_TRANSFER",
      });
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      if ("redirectUrl" in result && result.redirectUrl) {
        router.push(result.redirectUrl);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleWallet(provider: "jazzcash" | "easypaisa") {
    setLoading(true);
    try {
      const method = provider === "jazzcash" ? "JAZZCASH" : "EASYPAISA";
      const id = await ensureLocalBooking(method);
      if (!id) return;
      const res = await fetch("/api/payments/wallets/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, provider }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not start wallet payment");
        return;
      }
      window.location.href = data.redirectUrl as string;
    } catch {
      toast.error("Wallet payment failed. Please try again.");
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
          <CardContent className="space-y-4">
            <p>Adults: {adults}</p>
            <p>Children: {children}</p>
            {pricing && (
              <div className="space-y-1 text-sm">
                {pricing.discount > 0 ? (
                  <>
                    <p className="text-ink-500">
                      Subtotal: <DisplayPrice amount={pricing.subtotal} />
                    </p>
                    <p className="text-pine-600">
                      Discount ({appliedCoupon}): −<DisplayPrice amount={pricing.discount} />
                    </p>
                  </>
                ) : null}
                <p className="text-lg font-semibold text-primary-700">
                  Total: <DisplayPrice amount={pricing.total} />
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="coupon">Coupon code</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER10"
                  disabled={!!appliedCoupon}
                  className="uppercase"
                />
                {appliedCoupon ? (
                  <Button type="button" variant="outline" onClick={clearCoupon}>
                    Remove
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" disabled={couponBusy || !couponInput} onClick={() => void applyCoupon()}>
                    Apply
                  </Button>
                )}
              </div>
              <p className="text-xs text-ink-500">
                Find codes on the{" "}
                <a href="/deals" className="font-semibold text-pine-600 underline-offset-2 hover:underline">
                  Deals
                </a>{" "}
                page.
              </p>
            </div>
            <ChargeCurrencyNotice />
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
                Amount due:{" "}
                <strong className="text-ink-900">
                  <DisplayPrice amount={pricing.total} />
                </strong>
                {appliedCoupon ? ` · ${appliedCoupon}` : ""}
              </p>
            )}
            <ChargeCurrencyNotice />
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1 bg-primary-500 hover:bg-primary-700"
                disabled={loading}
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
              >
                Continue to payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
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
            <ChargeCurrencyNotice />

            {clientSecret && bookingId ? (
              <StripePaymentElement
                clientSecret={clientSecret}
                bookingId={bookingId}
                onBack={() => {
                  setClientSecret(null);
                }}
              />
            ) : (
              <>
                <PaymentMethodPicker
                  bookingId={bookingId}
                  enabled={{
                    stripe: true,
                    bank: siteConfig.bankTransfer.enabled,
                    jazzcash: siteConfig.jazzcash.enabled,
                    easypaisa: siteConfig.easypaisa.enabled,
                  }}
                  onSelectStripe={() => void createPaymentIntent()}
                  onSelectBank={() => void handleBankPayment()}
                  onSelectJazzcash={() => void handleWallet("jazzcash")}
                  onSelectEasypaisa={() => void handleWallet("easypaisa")}
                />
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
