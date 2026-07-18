"use client";

import dynamic from "next/dynamic";
import type { FallbackTour } from "@/lib/data/tour-fallback";

const PackagesCatalogue = dynamic(
  () => import("@/components/packages/packages-catalogue").then((m) => m.PackagesCatalogue),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full rounded-md bg-paper border border-line animate-pulse" aria-hidden />
    ),
  }
);

export function PackagesCatalogueLazy({ tours }: { tours: FallbackTour[] }) {
  return <PackagesCatalogue tours={tours} />;
}
