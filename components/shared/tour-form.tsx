"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { Tour } from "@prisma/client";

const categories = [
  "ADVENTURE", "FAMILY", "HONEYMOON", "CULTURAL",
  "BEACH", "WILDLIFE", "LUXURY", "BUDGET",
] as const;

type TourFormProps = {
  action?: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
  tour?: Tour;
  updateAction?: (id: string, formData: FormData) => Promise<{ error?: string; success?: boolean }>;
};

export function TourForm({ action, tour, updateAction }: TourFormProps) {
  const itinerary = tour?.itinerary
    ? JSON.stringify(tour.itinerary, null, 2)
    : JSON.stringify([{ day: 1, title: "Day 1", details: "Tour activities" }], null, 2);

  async function handleSubmit(formData: FormData) {
    if (tour && updateAction) {
      await updateAction(tour.id, formData);
    } else if (action) {
      await action(formData);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={tour?.title} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={tour?.slug} required className="mt-1" />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={tour?.description} required rows={4} className="mt-1" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={tour?.location} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" defaultValue={tour?.country} required className="mt-1" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                defaultValue={tour?.category ?? "ADVENTURE"}
                className="mt-1 flex h-10 w-full rounded-lg border border-ocean-200 px-3 text-sm"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="durationDays">Duration (days)</Label>
              <Input id="durationDays" name="durationDays" type="number" defaultValue={tour?.durationDays ?? 7} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="maxGroupSize">Max group size</Label>
              <Input id="maxGroupSize" name="maxGroupSize" type="number" defaultValue={tour?.maxGroupSize ?? 12} required className="mt-1" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={Number(tour?.price ?? 0)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="discountPrice">Discount price (optional)</Label>
              <Input id="discountPrice" name="discountPrice" type="number" step="0.01" defaultValue={tour?.discountPrice ? Number(tour.discountPrice) : ""} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={tour?.status ?? "DRAFT"}
                className="mt-1 flex h-10 w-full rounded-lg border border-ocean-200 px-3 text-sm"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="images">Image URLs (one per line)</Label>
            <Textarea id="images" name="images" defaultValue={tour?.images.join("\n") ?? "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"} rows={3} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="itinerary">Itinerary (JSON)</Label>
            <Textarea id="itinerary" name="itinerary" defaultValue={itinerary} rows={6} className="mt-1 font-mono text-xs" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="included">Included (one per line)</Label>
              <Textarea id="included" name="included" defaultValue={tour?.included.join("\n") ?? "Accommodation\nBreakfast\nGuide"} rows={4} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="excluded">Excluded (one per line)</Label>
              <Textarea id="excluded" name="excluded" defaultValue={tour?.excluded.join("\n") ?? "Flights\nInsurance"} rows={4} className="mt-1" />
            </div>
          </div>
          <Button type="submit">{tour ? "Update Tour" : "Create Tour"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
