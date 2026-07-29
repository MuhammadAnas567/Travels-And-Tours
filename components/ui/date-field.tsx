"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

/** Intl-style date field: whole control opens the native picker; no icon collision. */
export function DateField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  error,
  required,
  disabled,
  className,
}: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasError = Boolean(error);

  function openPicker() {
    const el = inputRef.current;
    if (!el || disabled) return;
    el.focus();
    try {
      // Chromium / Safari 16+ — makes calendar reliably open on click
      el.showPicker?.();
    } catch {
      /* older browsers still open via focus + click */
    }
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <Label
        htmlFor={id}
        className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700"
      >
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </Label>
      <div className="relative">
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={openPicker}
          className={cn(
            "absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-pine-600",
            disabled && "text-ink-300"
          )}
        >
          <Calendar className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onClick={openPicker}
          className={cn(
            "date-field flex h-12 w-full rounded-sm border bg-paper py-2 pl-10 pr-3 text-sm text-ink tabular-nums",
            "ring-offset-sand transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2",
            disabled && "cursor-not-allowed bg-sand text-ink-300",
            hasError
              ? "border-error focus-visible:ring-error"
              : "border-line hover:border-taupe-400"
          )}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Local calendar date as YYYY-MM-DD */
export function toDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO() {
  return toDateInputValue(new Date());
}

export function daysFromTodayISO(days: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return toDateInputValue(d);
}
