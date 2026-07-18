"use client";

import { useEffect, useRef, useState } from "react";
import { Plane, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/empty-state";

export function ErrorStateDemo() {
  return <ErrorState onRetry={() => window.location.reload()} />;
}

export function StyleguideClient() {
  const idleRef = useRef<HTMLButtonElement>(null);
  const loadingRef = useRef<HTMLButtonElement>(null);
  const [widths, setWidths] = useState<{ idle?: number; loading?: number }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWidths({
      idle: idleRef.current?.getBoundingClientRect().width,
      loading: loadingRef.current?.getBoundingClientRect().width,
    });
  }, [loading]);

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap gap-3 items-center">
        <Button ref={idleRef} onClick={() => setLoading(true)}>
          <Plane className="h-5 w-5" strokeWidth={1.5} />
          Search flights
        </Button>
        <Button ref={loadingRef} loading={loading || true}>
          <Plane className="h-5 w-5" strokeWidth={1.5} />
          Search flights
        </Button>
        <Button variant="secondary">Secondary outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button size="icon" aria-label="Next">
          <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
        </Button>
        <Button disabled>Disabled</Button>
        <Button className="w-full max-w-xs">Full width</Button>
      </div>
      <p className="text-sm tabular-nums text-ink-500">
        Loading width lock — idle: {widths.idle?.toFixed(1) ?? "—"}px · loading:{" "}
        {widths.loading?.toFixed(1) ?? "—"}px
        {widths.idle && widths.loading
          ? Math.abs(widths.idle - widths.loading) < 1
            ? " · PASS"
            : " · FAIL (widths differ)"
          : ""}
      </p>
    </div>
  );
}
