import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | boolean;
  success?: boolean;
  prefixIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, success, prefixIcon, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    const describedBy = error
      ? `${inputId}-error`
      : helperText
        ? `${inputId}-helper`
        : undefined;
    const hasError = Boolean(error);

    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <Label htmlFor={inputId} className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700">
            {label}
          </Label>
        ) : null}
        <div className="relative">
          {prefixIcon ? (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 [&_svg]:h-5 [&_svg]:w-5">
              {prefixIcon}
            </span>
          ) : null}
          <input
            type={type}
            id={inputId}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={cn(
              "flex h-11 w-full rounded-sm border bg-paper px-3 py-2 text-sm text-ink tabular-nums ring-offset-sand file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink-300 transition-[border-color,box-shadow] duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-surface-sunken",
              prefixIcon && "pl-10",
              hasError
                ? "border-error focus-visible:ring-error"
                : success
                  ? "border-success focus-visible:ring-success"
                  : "border-line hover:border-taupe-400",
              className
            )}
            ref={ref}
            {...props}
          />
          {hasError ? (
            <AlertCircle className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-error" aria-hidden />
          ) : success ? (
            <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-success" aria-hidden />
          ) : null}
        </div>
        {typeof error === "string" && error ? (
          <p id={`${inputId}-error`} className="text-sm text-error" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-sm text-ink-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
