import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold tracking-wide transition-all duration-[var(--duration-base)] ease-[var(--ease-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sand disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-brass-500 text-ink-900 hover:bg-brass-600 rounded-sm shadow-sm hover:shadow-md hover:-translate-y-px",
        default:
          "bg-brass-500 text-ink-900 hover:bg-brass-600 rounded-sm shadow-sm hover:shadow-md hover:-translate-y-px",
        accent:
          "bg-brass-500 text-ink-900 hover:bg-brass-600 rounded-sm shadow-sm hover:shadow-md",
        secondary:
          "border border-pine-500 bg-transparent text-pine-500 hover:bg-pine-500 hover:text-paper rounded-sm",
        outline:
          "border border-line bg-paper text-ink-900 hover:border-brass-400 hover:bg-brass-50 rounded-sm",
        ghost: "hover:bg-taupe-100 text-ink-700 rounded-sm",
        danger: "bg-error text-white hover:opacity-90 rounded-sm",
        destructive: "bg-error text-white hover:opacity-90 rounded-sm",
        link: "text-pine-500 underline-offset-4 hover:underline font-medium",
      },
      size: {
        sm: "h-9 min-h-9 px-3 text-xs",
        default: "h-11 min-h-11 px-5 py-2",
        md: "h-11 min-h-11 px-5 py-2",
        lg: "h-14 min-h-14 px-8 text-base",
        icon: "h-11 w-11 min-h-11 min-w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), loading && "relative")}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <span className="invisible inline-flex items-center gap-2" aria-hidden>
              {children}
            </span>
            <span className="absolute inset-0 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span className="sr-only">Loading</span>
            </span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
