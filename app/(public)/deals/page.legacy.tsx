import Link from "next/link";
import { prisma, withDbTimeout } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { CatalogHero, EmptyCatalog } from "@/components/layout/catalog-hero";
import { CopyCouponButton } from "@/components/deals/copy-coupon-button";

export const dynamic = "force-static";
export const revalidate = 120;

export const metadata = {
  title: "Deals & Offers",
  description: "Seasonal deals and exclusive coupon offers on tour packages.",
};

export default async function DealsPage() {
  const now = new Date();
  const coupons = await withDbTimeout(
    prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validTo: { gte: now },
      },
      orderBy: { validTo: "asc" },
    }),
    [],
    800
  );

  return (
    <div className="bg-sand min-h-[60vh]">
      <CatalogHero
        variant="deals"
        eyebrow="Special offers"
        title="Seasonal deals"
        description="Save on hand-picked departures. All discounts validated server-side at checkout."
      />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 pb-20">
        {coupons.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="rounded-md border border-line bg-paper p-6 shadow-sm transition-[box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-brand)] hover:shadow-md hover:-translate-y-0.5"
              >
                <Badge variant="accent" className="font-mono text-sm tabular-nums">
                  {coupon.code}
                </Badge>
                <p className="mt-4 font-display text-2xl font-semibold tabular-nums text-ink">
                  {coupon.type === "PERCENT"
                    ? `${coupon.value}% off`
                    : `${formatCurrency(coupon.value, "USD")} off`}
                </p>
                {coupon.minSpend && (
                  <p className="mt-1 text-sm tabular-nums text-ink-500">
                    Min spend {formatCurrency(coupon.minSpend, "USD")}
                  </p>
                )}
                <p className="mt-3 text-xs text-ink-500">
                  Valid until {coupon.validTo.toLocaleDateString()}
                </p>
                <p className="mt-2 text-xs text-ink-600">
                  Use at <strong>tour checkout</strong> (step 1 → Coupon code).
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <CopyCouponButton code={coupon.code} />
                  <Link
                    href="/tours"
                    className="text-sm font-semibold text-pine-500 link-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
                  >
                    Browse tours
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyCatalog
            title="No active deals right now"
            description="Check back soon for seasonal offers on hand-picked departures."
          >
            <Link
              href="/tours"
              className="text-sm font-semibold text-pine-500 link-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
            >
              Browse tours
            </Link>
          </EmptyCatalog>
        )}
      </div>
    </div>
  );
}
