import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CatalogHero } from "@/components/layout/catalog-hero";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "UEB3 Travel plans private journeys and curated escapes — clear fares, local partners, and humans on support.",
};

export default function AboutPage() {
  return (
    <div className="bg-sand">
      <CatalogHero
        variant="plan"
        eyebrow="Since 2010"
        title="We compose journeys, not packages."
        description="Clear pricing with itineraries shaped by people who still know the hotels, the guides, and the quiet hours of each city."
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 section-pad">
        <div className="grid gap-16 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="eyebrow">Story</p>
            <h2 className="mt-3 text-h2 text-ink">Built for travellers who notice the details</h2>
            <div className="mt-6 space-y-5 text-ink-700 leading-relaxed max-w-[65ch]">
              <p>
                Founded in 2010, UEB3 has helped travellers cross 50+ countries — from Amalfi dawn walks to safari camps on the Maasai Mara. We favour partners who keep places intact and travellers well looked after.
              </p>
              <p>
                Every route is checked for timing, transfer quality, and cancellation honesty. Adventure, honeymoon, or a quiet week by the sea — the brief stays specific.
              </p>
            </div>
          </div>
          <aside className="rounded-md border border-line bg-paper p-8 h-fit">
            <p className="eyebrow">Mission</p>
            <p className="mt-4 font-display text-2xl font-semibold text-ink leading-snug">
              Make world-class travel clear, safe, and worth remembering.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/plan-trip">Plan a custom trip</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Talk to us</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
