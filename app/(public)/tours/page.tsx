import type { Metadata } from "next";
import { Container } from "@/components/ui/section";
import { CatalogHero } from "@/components/layout/catalog-hero";
import { ToursCatalogue } from "@/components/tours/tours-catalogue";
import { getCachedDefaultTours, getCachedTourCountries } from "@/lib/tours-cache";

/** Force CDN cache — client filters must not mark this route dynamic */
export const dynamic = "force-static";
export const revalidate = 120;

export const metadata: Metadata = {
  title: "International Tour Packages",
  description:
    "Browse curated international tour packages — luxury, adventure, safari, beach and cultural experiences worldwide.",
};

export default async function ToursPage() {
  const [{ tours, total }, countries] = await Promise.all([
    getCachedDefaultTours(),
    getCachedTourCountries(),
  ]);

  return (
    <>
      <CatalogHero
        variant="tours"
        eyebrow="Worldwide Collection"
        title="International Tour Packages"
        description={`${total} curated experiences across the globe`}
      />

      <Container className="py-10 sm:py-12 md:py-16">
        <ToursCatalogue tours={tours} countries={countries} />
      </Container>
    </>
  );
}
