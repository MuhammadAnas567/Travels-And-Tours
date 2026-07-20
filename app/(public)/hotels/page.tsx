import type { Metadata } from "next";
import { listHotels } from "@/lib/data/catalog";
import { FALLBACK_HOTELS } from "@/lib/data/home-fallback";
import { SearchWidgetLazy } from "@/components/search/search-widget-lazy";
import { CatalogHero } from "@/components/layout/catalog-hero";
import { HotelsCatalogueLazy } from "@/components/hotels/hotels-catalogue-lazy";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hotels",
  description: "Search and book hotels worldwide with free cancellation on most stays.",
};

type Props = {
  searchParams: Promise<{
    city?: string;
    q?: string;
    tag?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

export default async function HotelsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const city = sp.city?.trim();
  const q = sp.q?.trim();
  const tag = sp.tag?.trim();

  let hotels;
  try {
    const rows = await listHotels({
      city: city || undefined,
      q: q || undefined,
      tag: tag || undefined,
      limit: 48,
    });
    hotels = rows.map((h) => ({
      _id: String(h._id),
      name: h.name,
      slug: h.slug,
      city: h.city,
      country: h.country,
      starRating: h.starRating,
      images: h.images,
      avgRating: h.avgRating,
      reviewCount: h.reviewCount,
      pricePerNight: h.pricePerNight,
      amenities: h.amenities ?? [],
      tags: "tags" in h && Array.isArray(h.tags) ? h.tags : [],
    }));
  } catch {
    hotels = FALLBACK_HOTELS.map((h) => ({ ...h, tags: h.tags ?? [] }));
  }

  if (hotels.length === 0) {
    hotels = FALLBACK_HOTELS.map((h) => ({ ...h, tags: h.tags ?? [] }));
  }

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="hotels"
        eyebrow="Stays"
        title="Hotels worldwide"
        description={
          city
            ? `Stays matching ${city}`
            : hotels.length > 0
              ? `${hotels.length} stays ready to book`
              : "Browse destinations and find your next stay"
        }
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <SearchWidgetLazy />
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-20">
        <HotelsCatalogueLazy hotels={hotels} />
      </div>
    </div>
  );
}
