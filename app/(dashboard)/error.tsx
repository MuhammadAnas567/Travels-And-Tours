"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <div className="rounded-md border border-line bg-sand/40 p-8 text-center sm:p-10">
      <h2 className="font-display text-xl font-semibold text-ink-900">
        This section couldn&apos;t load
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
        Something went wrong in your account area. Try again, or open another section.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="secondary">
          <Link href="/dashboard">Back to overview</Link>
        </Button>
      </div>
    </div>
  );
}
