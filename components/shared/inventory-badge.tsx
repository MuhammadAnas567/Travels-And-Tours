import { cn } from "@/lib/utils";
import { INVENTORY_BADGE, type InventoryMode } from "@/lib/inventory";

export function InventoryBadge({
  mode,
  className,
}: {
  mode: InventoryMode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em]",
        mode === "bookable" && "bg-pine-500 text-paper",
        mode === "inquire" && "bg-sand-200 text-ink-700",
        mode === "coming_soon" && "bg-ink-200 text-ink-600",
        className
      )}
    >
      {INVENTORY_BADGE[mode]}
    </span>
  );
}
