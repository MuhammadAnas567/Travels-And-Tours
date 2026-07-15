import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1280px] items-center px-4 py-16">
      <EmptyState
        icon="compass"
        title="This page isn't on the map"
        description="The link may be outdated, or the trip moved. Head home and search again."
        actionLabel="Back to home"
        actionHref="/"
        secondaryLabel="Search flights"
        secondaryHref="/flights"
        className="w-full"
      />
    </div>
  );
}
