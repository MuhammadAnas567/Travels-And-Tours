"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitHotelInquiry } from "@/actions/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InventoryBadge } from "@/components/shared/inventory-badge";
import { DisplayPrice } from "@/components/shared/display-price";
import { siteConfig } from "@/lib/site-config";

type Props = {
  hotelName: string;
  city: string;
  country: string;
  pricePerNight: number;
  whatsappUrl?: string | null;
};

export function HotelInquiryForm({
  hotelName,
  city,
  country,
  pricePerNight,
  whatsappUrl,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    guests: "2",
    notes: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await submitHotelInquiry({
      hotelName,
      city,
      country,
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      checkIn: form.checkIn || undefined,
      checkOut: form.checkOut || undefined,
      guests: Number(form.guests) || 2,
      notes: form.notes || undefined,
      priceHint: pricePerNight,
    });
    setLoading(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    if ("id" in result && result.id) {
      setTicketId(result.id);
      toast.success("Request received — we'll reply within 2 business hours.");
    }
  }

  if (ticketId) {
    return (
      <div className="rounded-md border border-pine-200 bg-pine-50 p-6 text-center">
        <InventoryBadge mode="inquire" className="mb-3" />
        <p className="font-display text-lg font-semibold text-ink-900">Request received</p>
        <p className="mt-2 text-sm text-ink-600">
          Reference: <span className="font-mono font-semibold">{ticketId.slice(-8).toUpperCase()}</span>
        </p>
        <p className="mt-2 text-sm text-ink-500">{siteConfig.supportSla}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <InventoryBadge mode="inquire" />
      <p className="text-[0.6875rem] font-semibold uppercase tracking-widest text-ink-500">From</p>
      <p className="text-3xl font-semibold tabular-nums text-ink">
        <DisplayPrice amount={pricePerNight} />
        <span className="text-base font-normal text-ink-500"> / night</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="checkIn">Check-in</Label>
          <Input
            id="checkIn"
            type="date"
            required
            value={form.checkIn}
            onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="checkOut">Check-out</Label>
          <Input
            id="checkOut"
            type="date"
            required
            value={form.checkOut}
            onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="guests">Guests</Label>
        <Input
          id="guests"
          type="number"
          min={1}
          max={20}
          value={form.guests}
          onChange={(e) => setForm({ ...form, guests: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="hname">Your name</Label>
        <Input
          id="hname"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="hemail">Email</Label>
        <Input
          id="hemail"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="hphone">Phone</Label>
        <Input
          id="hphone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="hnotes">Notes (optional)</Label>
        <Textarea
          id="hnotes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="mt-1"
          placeholder="Room type, special requests…"
        />
      </div>

      <Button type="submit" className="w-full h-12" disabled={loading}>
        {loading ? "Sending…" : "Request quote"}
      </Button>
      {whatsappUrl ? (
        <Button asChild variant="secondary" className="w-full h-12">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </Button>
      ) : null}
      <p className="text-xs text-ink-500 text-center">{siteConfig.supportSla}</p>
    </form>
  );
}
