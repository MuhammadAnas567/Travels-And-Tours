"use client";

import { Button } from "@/components/ui/button";

export default function FlightsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-md border border-line bg-paper p-8 shadow-sm">
        <p className="eyebrow">Flight search</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">
          We could not load these fares
        </h1>
        <p className="mt-3 max-w-2xl text-ink-500">
          {error.message || "Try the route again in a moment."}
        </p>
        <Button type="button" className="mt-6" onClick={reset}>
          Retry search
        </Button>
      </div>
    </div>
  );
}
