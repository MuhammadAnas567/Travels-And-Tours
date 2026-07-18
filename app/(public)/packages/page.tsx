import type { Metadata } from "next";
import { getCachedPackages } from "@/lib/tours-cache";
import { SearchWidgetLazy } from "@/components/search/search-widget-lazy";
import { CatalogHero } from "@/components/layout/catalog-hero";
import { PackagesCatalogueLazy } from "@/components/packages/packages-catalogue-lazy";

export const dynamic = "force-static";
export const revalidate = 120;

export const metadata: Metadata = {
  title: "Vacation Packages",
  description: "Curated flight + hotel packages and guided tours worldwide.",
};

export default async function PackagesPage() {
  const { tours } = await getCachedPackages();

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="packages"
        eyebrow="Packages"
        title="Vacation packages"
        description="Bundled trips with stays, activities, and expert planning built in."
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <SearchWidgetLazy />
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pb-20">
        <PackagesCatalogueLazy tours={tours} />
      </div>
    </div>
  );
}
