import { AdminSidebar } from "@/components/shared/admin-sidebar";
import { TourForm } from "@/components/shared/tour-form";
import { createTour } from "@/actions/admin";

export default function NewTourPage() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <AdminSidebar />
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-ocean-900">Create Tour</h1>
        <div className="mt-6">
          <TourForm action={createTour} />
        </div>
      </div>
    </div>
  );
}
