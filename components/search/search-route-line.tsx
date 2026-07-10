"use client";

import { useId } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type RouteLineProps = {
  from: string;
  to: string;
  className?: string;
};

/** Signature motion: draws a flight path between origin and destination pins. */
export function SearchRouteLine({ from, to, className }: RouteLineProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const ready = from.trim().length >= 2 && to.trim().length >= 2;

  if (!ready) return null;

  return (
    <div
      className={cn(
        "relative mx-1 mb-4 overflow-hidden rounded-[var(--radius-sm)] border border-primary-100 bg-primary-50/70 px-3 py-3",
        className
      )}
      aria-hidden
    >
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-ink-700">
        <span className="truncate max-w-[40%]">{from.trim()}</span>
        <span className="truncate max-w-[40%] text-right">{to.trim()}</span>
      </div>
      <svg viewBox="0 0 320 36" className="mt-1 h-9 w-full" fill="none">
        <defs>
          <linearGradient id={`route-grad-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-navy-500)" />
            <stop offset="100%" stopColor="var(--color-gold-500)" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="20" r="5" fill="var(--color-navy-500)" />
        <circle cx="302" cy="20" r="5" fill="var(--color-gold-500)" />
        <path
          key={`${from}-${to}`}
          d="M24 20 C 90 4, 230 36, 296 20"
          stroke={`url(#route-grad-${uid})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={reduceMotion ? 0 : 1}
          style={
            reduceMotion
              ? undefined
              : {
                  animation: "draw-route 900ms var(--ease-brand) forwards",
                }
          }
        />
        <path
          d="M148 12 L156 20 L148 28"
          stroke="var(--color-navy-500)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
      </svg>
    </div>
  );
}
