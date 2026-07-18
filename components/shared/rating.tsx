import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  max = 5,
  size = "md",
  showValue = false,
}: {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}) {
  const sizeClass = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" }[size];

  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i < Math.round(value)
              ? "fill-gold-400 text-gold-400"
              : "fill-line text-line"
          )}
          aria-hidden
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-ink-500">{value.toFixed(1)}</span>
      )}
    </div>
  );
}
