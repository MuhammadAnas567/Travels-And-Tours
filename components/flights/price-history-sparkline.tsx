"use client";

import { cn } from "@/lib/utils";

type PriceHistorySparklineProps = {
  points: { timestamp: number; price: number }[];
  className?: string;
};

export function PriceHistorySparkline({
  points,
  className,
}: PriceHistorySparklineProps) {
  if (points.length < 2) return null;

  const width = 240;
  const height = 56;
  const padding = 6;
  const prices = points.map((point) => point.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const spread = Math.max(1, max - min);

  const path = points
    .map((point, index) => {
      const x = padding + (index / (points.length - 1)) * (width - padding * 2);
      const y =
        height - padding - ((point.price - min) / spread) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-14 w-full overflow-visible", className)}
      role="img"
      aria-label="Price history trend"
    >
      <path
        d={path}
        fill="none"
        stroke="var(--color-brass-500)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
