"use client";

import { useEffect, useId, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NormalizedFlightResult } from "@/lib/flights/serpapi";
import { discountPercentOff } from "@/lib/currency";
import { cn } from "@/lib/utils";

type FlightBookModalProps = {
  open: boolean;
  onClose: () => void;
  flight: NormalizedFlightResult;
  currency: string;
  travellers: number;
  routeLabel: string;
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FlightBookModal({
  open,
  onClose,
  flight,
  currency,
  travellers,
  routeLabel,
}: FlightBookModalProps) {
  const titleId = useId();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const firstLeg = flight.legs[0];
  const lastLeg = flight.legs[flight.legs.length - 1];
  const percentOff = discountPercentOff(flight.compareAtPrice, flight.price);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setFormError(null);
      setSubmitting(false);
      setBooked(false);
      setBookingReference(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const passport = String(data.get("passport") ?? "").trim();
    const notes = String(data.get("notes") ?? "").trim();

    if (name.length < 2) {
      setFormError("Enter the passenger’s full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 7) {
      setFormError("Enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/flights/book-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          passport: passport || undefined,
          notes: notes || undefined,
          routeLabel,
          airline: firstLeg.airline,
          flightNumbers: flight.legs.map((leg) => leg.flightNumber).join(" · "),
          departLabel: `${firstLeg.departureAirport.time} (${firstLeg.departureAirport.id})`,
          arriveLabel: `${lastLeg.arrivalAirport.time} (${lastLeg.arrivalAirport.id})`,
          fareLabel: formatMoney(flight.price, currency),
          travellers,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        reference?: string;
      };
      if (!res.ok) {
        setFormError(
          typeof payload.error === "string"
            ? payload.error
            : "Booking request did not send. Check your connection and try again."
        );
        setSubmitting(false);
        return;
      }
      setBookingReference(
        typeof payload.reference === "string" ? payload.reference : null
      );
      setBooked(true);
    } catch {
      setFormError("Something went wrong. Try again in a moment.");
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="absolute inset-0 bg-ink/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-lg border border-line bg-paper p-5 shadow-lg sm:rounded-md sm:p-6",
          "pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">{booked ? "Confirmed" : "Book flight"}</p>
            <h2 id={titleId} className="mt-1 font-display text-2xl font-semibold text-ink-900">
              {booked ? "Ticket booked" : "Passenger details"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-700 hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-4 rounded-md border border-line bg-sand p-4 text-sm text-ink-700">
          <p className="font-semibold text-ink-900">
            {firstLeg.airline} · {flight.legs.map((leg) => leg.flightNumber).join(" · ")}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2">
            <span>
              {routeLabel} · {travellers} traveller{travellers === 1 ? "" : "s"}
            </span>
            <span className="text-ink-400">·</span>
            {flight.compareAtPrice > flight.price ? (
              <>
                <span className="text-base font-medium tabular-nums text-ink-500 line-through decoration-ink-400">
                  {formatMoney(flight.compareAtPrice, currency)}
                </span>
                {percentOff > 0 ? (
                  <span className="rounded-sm border border-brass-200 bg-brass-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-brass-700">
                    {percentOff}% off
                  </span>
                ) : null}
              </>
            ) : null}
            <span className="text-lg font-semibold tabular-nums text-ink-900">
              {formatMoney(flight.price, currency)}
            </span>
          </p>
        </div>

        {booked ? (
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pine-50 text-pine-600">
              <CheckCircle2 className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <p className="mt-4 font-display text-xl font-semibold text-ink-900">
              Ticket booked
            </p>
            {bookingReference ? (
              <p className="mt-2 text-sm tabular-nums text-ink-700">
                Reference {bookingReference}
              </p>
            ) : null}
            <p className="mt-2 text-sm text-ink-500">
              A confirmation email is on its way. Our Lahore desk will confirm seats and send ticket details next.
            </p>
            <Button type="button" className="mt-6 min-h-12 w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <div>
              <Label htmlFor="book-name">Full name</Label>
              <Input
                id="book-name"
                name="name"
                required
                className="mt-1.5 h-12"
                placeholder="As on passport"
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="book-email">Email</Label>
              <Input
                id="book-email"
                name="email"
                type="email"
                required
                className="mt-1.5 h-12"
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="book-phone">Phone</Label>
              <Input
                id="book-phone"
                name="phone"
                type="tel"
                required
                className="mt-1.5 h-12"
                placeholder="+92 300 1234567"
                autoComplete="tel"
              />
            </div>
            <div>
              <Label htmlFor="book-passport">Passport / CNIC (optional)</Label>
              <Input
                id="book-passport"
                name="passport"
                className="mt-1.5 h-12"
                placeholder="Document number"
              />
            </div>
            <div>
              <Label htmlFor="book-notes">Notes (optional)</Label>
              <Textarea
                id="book-notes"
                name="notes"
                rows={3}
                className="mt-1.5"
                placeholder="Seat preference, baggage, or return details"
              />
            </div>
            {formError ? (
              <p className="text-sm text-error" role="alert">
                {formError}
              </p>
            ) : null}
            <Button type="submit" loading={submitting} className="min-h-12 w-full">
              Confirm booking
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
