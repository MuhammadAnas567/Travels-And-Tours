"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TourDate } from "@prisma/client";

type BookingWidgetProps = {
  tourId: string;
  tourSlug: string;
  tourTitle?: string;
  unitPrice: number;
  maxGroupSize: number;
  availableDates: TourDate[];
};

function isFallbackTour(tourId: string) {
  return tourId.startsWith("fallback-");
}

export function BookingWidget({
  tourId,
  tourSlug,
  tourTitle,
  unitPrice,
  maxGroupSize,
  availableDates,
}: BookingWidgetProps) {
  const [tourDateId, setTourDateId] = useState(availableDates[0]?.id ?? "");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const childPrice = unitPrice * 0.7;
  const total = adults * unitPrice + children * childPrice;
  const selectedDate = availableDates.find((d) => d.id === tourDateId);
  const seatsLeft = selectedDate
    ? selectedDate.seatsTotal - selectedDate.seatsBooked
    : maxGroupSize;
  const canProceed = !!tourDateId && adults + children <= seatsLeft && adults >= 1;
  const fallback = isFallbackTour(tourId);

  const bookingUrl = `/booking/${tourId}?${new URLSearchParams({
    tourDateId,
    adults: String(adults),
    children: String(children),
  }).toString()}`;

  const inquireParams = new URLSearchParams({
    subject: `Request to book: ${tourTitle ?? tourSlug}`,
  });
  if (selectedDate) {
    inquireParams.set(
      "message",
      [
        `Tour: ${tourTitle ?? tourSlug}`,
        `Departure: ${new Date(selectedDate.startDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`,
        `Travellers: ${adults} adult(s)${children ? `, ${children} child(ren)` : ""}`,
        `Estimated total: ${formatPrice(total)}`,
      ].join("\n")
    );
  }
  const inquireUrl = `/contact?${inquireParams.toString()}`;

  return (
    <Card className="sticky top-24 rounded-md border border-line bg-paper shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tabular-nums text-pine-500">
          {formatPrice(unitPrice)}
          <span className="text-sm font-normal text-ink-500"> / person</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="tour-date">Select date</Label>
          <Select value={tourDateId} onValueChange={setTourDateId}>
            <SelectTrigger id="tour-date" className="mt-1">
              <SelectValue placeholder="Choose a departure date" />
            </SelectTrigger>
            <SelectContent>
              {availableDates.map((d) => {
                const left = d.seatsTotal - d.seatsBooked;
                return (
                  <SelectItem key={d.id} value={d.id} disabled={left <= 0}>
                    {new Date(d.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    ({left} seats left)
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="adults">Adults</Label>
            <Input
              id="adults"
              type="number"
              min={1}
              max={seatsLeft}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="children">Children</Label>
            <Input
              id="children"
              type="number"
              min={0}
              max={Math.max(0, seatsLeft - adults)}
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>

        <div className="rounded-md bg-pine-50 border border-pine-100 p-3 text-sm tabular-nums">
          <div className="flex justify-between text-ink-500">
            <span>Adults × {adults}</span>
            <span>{formatPrice(adults * unitPrice)}</span>
          </div>
          {children > 0 && (
            <div className="flex justify-between text-ink-500">
              <span>Children × {children}</span>
              <span>{formatPrice(children * childPrice)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-pine-200 pt-2 font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <Button className="w-full" size="lg" disabled={!canProceed} asChild={canProceed}>
          {canProceed ? (
            <Link href={fallback ? inquireUrl : bookingUrl}>
              {fallback ? "Request to book" : "Book Now"}
            </Link>
          ) : (
            <span>{fallback ? "Request to book" : "Book Now"}</span>
          )}
        </Button>
        {fallback ? (
          <p className="text-center text-xs text-ink-500">
            Demo catalogue — we confirm dates and payment with you directly.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
