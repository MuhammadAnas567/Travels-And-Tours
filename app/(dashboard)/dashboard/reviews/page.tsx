import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReviewSubmitForm } from "@/components/dashboard/review-submit-form";

export default async function DashboardReviewsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");

  const completed = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
      type: { in: ["TOUR", "PACKAGE"] },
      status: { in: ["CONFIRMED", "COMPLETED"] },
      tourId: { not: null },
    },
    include: { tour: true },
    orderBy: { createdAt: "desc" },
  });

  const existing = await prisma.review.findMany({
    where: { userId: session.user.id },
    select: { tourId: true },
  });
  const reviewed = new Set(existing.map((r) => r.tourId));

  const eligible = completed.filter(
    (b) => b.tourId && b.tour && !reviewed.has(b.tourId)
  );

  // unique by tour
  const byTour = new Map<string, { tourId: string; title: string }>();
  for (const b of eligible) {
    if (b.tourId && b.tour && !byTour.has(b.tourId)) {
      byTour.set(b.tourId, { tourId: b.tourId, title: b.tour.title });
    }
  }
  const tours = [...byTour.values()];

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Reviews
      </h1>
      <p className="mt-1 text-ink-500">
        Share feedback on tours and packages you have booked.
      </p>

      <div className="mt-8">
        {tours.length === 0 ? (
          <p className="rounded-md border border-dashed border-line bg-sand/40 px-5 py-8 text-ink-500">
            No tours ready to review yet.{" "}
            <Link href="/tours" className="font-semibold text-pine-600 hover:underline">
              Browse tours
            </Link>
          </p>
        ) : (
          <div className="space-y-6">
            {tours.map((t) => (
              <ReviewSubmitForm key={t.tourId} tourId={t.tourId} tourTitle={t.title} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
