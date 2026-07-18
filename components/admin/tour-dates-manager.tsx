"use client";

import { useState } from "react";
import { toast } from "sonner";
import { addTourDate, deleteTourDate } from "@/actions/tour-dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

type TourDateRow = {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  seatsTotal: number;
  seatsBooked: number;
};

export function TourDatesManager({
  tourId,
  dates,
}: {
  tourId: string;
  dates: TourDateRow[];
}) {
  const [loading, setLoading] = useState(false);

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await addTourDate(tourId, formData);
    setLoading(false);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Departure added");
    e.currentTarget.reset();
    window.location.reload();
  }

  async function onDelete(id: string) {
    setLoading(true);
    const result = await deleteTourDate(id, tourId);
    setLoading(false);
    if (result && "error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Departure removed");
    window.location.reload();
  }

  return (
    <div className="mt-10 rounded-md border border-line bg-paper p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink">Departures & seats</h2>
      <p className="mt-1 text-sm text-ink-500">
        Tours need at least one departure date with open seats to be bookable.
      </p>

      <ul className="mt-5 space-y-2">
        {dates.length === 0 ? (
          <li className="text-sm text-ink-500">No departures yet.</li>
        ) : (
          dates.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-sm"
            >
              <span className="tabular-nums text-ink-800">
                {formatDate(new Date(d.startDate))} — {formatDate(new Date(d.endDate))}
              </span>
              <span className="text-ink-500">
                {d.seatsBooked}/{d.seatsTotal} booked
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={loading || d.seatsBooked > 0}
                onClick={() => void onDelete(d.id)}
              >
                Remove
              </Button>
            </li>
          ))
        )}
      </ul>

      <form onSubmit={onAdd} className="mt-6 grid gap-3 sm:grid-cols-4 sm:items-end">
        <div>
          <Label htmlFor="startDate">Start</Label>
          <Input id="startDate" name="startDate" type="date" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="endDate">End</Label>
          <Input id="endDate" name="endDate" type="date" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="seatsTotal">Seats</Label>
          <Input
            id="seatsTotal"
            name="seatsTotal"
            type="number"
            min={1}
            defaultValue={20}
            required
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={loading}>
          Add departure
        </Button>
      </form>
    </div>
  );
}
