import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary-500 text-white hover:bg-primary-700 rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-px",
        accent:
          "bg-accent-500 text-ink-900 hover:bg-accent-600 rounded-[var(--radius-full)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
        secondary:
          "bg-surface-alt text-ink-900 border border-line hover:bg-primary-100 rounded-[var(--radius-sm)]",
        outline:
          "border border-line bg-surface text-ink-900 hover:bg-surface-alt hover:border-primary-300 rounded-[var(--radius-sm)]",
        ghost: "hover:bg-primary-100 text-ink-700 rounded-[var(--radius-sm)]",
        destructive:
          "bg-error text-white hover:opacity-90 rounded-[var(--radius-sm)]",
        link: "text-primary-500 underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-12 px-5 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
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
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span className="opacity-80">{children}</span>
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
