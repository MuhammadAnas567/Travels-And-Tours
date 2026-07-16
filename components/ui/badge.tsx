import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-pine-500 text-paper",
        secondary: "border-transparent bg-taupe-100 text-ink-700",
        outline: "border-line text-ink-500",
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/15 text-warning",
        error: "border-transparent bg-error/15 text-error",
        info: "border-transparent bg-info/15 text-info",
        promo: "border-transparent bg-pine-100 text-pine-700",
        destructive: "border-transparent bg-error/15 text-error",
        accent: "border-transparent bg-pine-100 text-pine-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
