"use client";

import dynamic from "next/dynamic";
import type { FallbackTour } from "@/lib/data/tour-fallback";

const ToursCatalogue = dynamic(
  () => import("@/components/tours/tours-catalogue").then((m) => m.ToursCatalogue),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full rounded-md bg-paper border border-line animate-pulse" aria-hidden />
    ),
  }
);

export function ToursCatalogueLazy({
  tours,
  countries,
}: {
  tours: FallbackTour[];
  countries: string[];
}) {
  return <ToursCatalogue tours={tours} countries={countries} />;
}
