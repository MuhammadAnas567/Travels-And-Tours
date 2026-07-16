"use client";

import dynamic from "next/dynamic";
import type { HotelCatalogueItem } from "@/components/hotels/hotels-catalogue";

const HotelsCatalogue = dynamic(
  () => import("@/components/hotels/hotels-catalogue").then((m) => m.HotelsCatalogue),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 w-full rounded-md bg-paper border border-line animate-pulse" aria-hidden />
    ),
  }
);

export function HotelsCatalogueLazy({ hotels }: { hotels: HotelCatalogueItem[] }) {
  return <HotelsCatalogue hotels={hotels} />;
}
