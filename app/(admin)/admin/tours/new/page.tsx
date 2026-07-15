import { TourForm } from "@/components/shared/tour-form";
import { createTour } from "@/actions/admin";

export default function NewTourPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink-900">
        Create Tour
      </h1>
      <div className="mt-6">
        <TourForm action={createTour} />
      </div>
    </div>
  );
}
