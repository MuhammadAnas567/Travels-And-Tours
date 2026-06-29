import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { TourForm } from "@/components/shared/tour-form";
import { updateTour } from "@/actions/admin";

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tour = await prisma.tour.findUnique({ where: { id } });
  if (!tour) notFound();

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <AdminSidebar />
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-ocean-900">Edit Tour</h1>
        <div className="mt-6">
          <TourForm tour={tour} updateAction={updateTour} />
        </div>
      </div>
    </div>
  );
}
