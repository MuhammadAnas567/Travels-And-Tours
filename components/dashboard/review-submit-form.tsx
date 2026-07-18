"use client";

import { useState } from "react";
import { toast } from "sonner";
import { submitReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReviewSubmitForm({
  tourId,
  tourTitle,
}: {
  tourId: string;
  tourTitle: string;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (comment.trim().length < 10) {
      toast.error("Please write at least a short comment (10+ characters).");
      return;
    }
    setLoading(true);
    const result = await submitReview({ tourId, rating, comment: comment.trim() });
    setLoading(false);
    if (result && "error" in result && result.error) {
      toast.error(typeof result.error === "string" ? result.error : "Could not submit review");
      return;
    }
    toast.success("Review submitted for moderation");
    window.location.reload();
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-md border border-line bg-paper p-5 shadow-sm"
    >
      <h2 className="font-display text-lg font-semibold text-ink">{tourTitle}</h2>
      <div className="mt-4">
        <Label htmlFor={`rating-${tourId}`}>Rating</Label>
        <select
          id={`rating-${tourId}`}
          className="mt-1 flex h-11 w-full rounded-md border border-line bg-sand px-3 text-sm"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <Label htmlFor={`comment-${tourId}`}>Your review</Label>
        <Textarea
          id={`comment-${tourId}`}
          className="mt-1"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What stood out on this trip?"
        />
      </div>
      <Button type="submit" className="mt-4" disabled={loading}>
        {loading ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
