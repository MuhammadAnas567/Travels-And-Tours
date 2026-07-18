import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton", className)} {...props} />;
}

function HotelCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

function FlightRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-md border border-line bg-surface p-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-sm" />
      <div className="flex flex-1 gap-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-10 w-28" />
    </div>
  );
}

export { Skeleton, HotelCardSkeleton, FlightRowSkeleton };
