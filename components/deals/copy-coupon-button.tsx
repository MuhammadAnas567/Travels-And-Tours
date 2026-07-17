"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export function CopyCouponButton({ code }: { code: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-4 gap-1.5"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          toast.success(`Copied ${code} — use it at tour checkout`);
        } catch {
          toast.error("Could not copy — select the code manually");
        }
      }}
    >
      <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
      Copy code
    </Button>
  );
}
