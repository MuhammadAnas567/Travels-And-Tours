import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";

export const metadata = {
  title: "Deals & Offers",
  description: "Seasonal deals and exclusive coupon offers on tour packages.",
};

export default async function DealsPage() {
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      validFrom: { lte: now },
      validTo: { gte: now },
    },
    orderBy: { validTo: "asc" },
  });

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Special Offers"
          title="Seasonal deals"
          description="Save on hand-picked departures. All discounts validated server-side at checkout."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-md"
            >
              <Badge variant="accent" className="font-mono text-sm">
                {coupon.code}
              </Badge>
              <p className="mt-4 font-display text-2xl text-ink">
                {coupon.type === "PERCENT"
                  ? `${coupon.value}% off`
                  : `${formatCurrency(coupon.value, "USD")} off`}
              </p>
              {coupon.minSpend && (
                <p className="mt-1 text-sm text-muted">
                  Min spend {formatCurrency(coupon.minSpend, "USD")}
                </p>
              )}
              <p className="mt-3 text-xs text-muted">
                Valid until {coupon.validTo.toLocaleDateString()}
              </p>
              <Link href="/tours" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                Browse tours →
              </Link>
            </div>
          ))}
        </div>
        {coupons.length === 0 && (
          <p className="text-center text-muted">No active deals right now — check back soon!</p>
        )}
      </Container>
    </Section>
  );
}
