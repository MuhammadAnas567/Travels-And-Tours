import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { TourForm } from "@/components/shared/tour-form";
import { updateTour } from "@/actions/admin";
import { TourDatesManager } from "@/components/admin/tour-dates-manager";

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: { availableDates: { orderBy: { startDate: "asc" } } },
  });
  if (!tour) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Edit Tour
      </h1>
      <div className="mt-6">
        <TourForm tour={tour} updateAction={updateTour} />
      </div>
      <TourDatesManager tourId={tour.id} dates={tour.availableDates} />
    </div>
  );
}
