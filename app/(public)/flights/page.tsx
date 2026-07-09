import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flights",
  description: "Search and book flights worldwide.",
};

export default function FlightsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h1 className="text-h2 font-heading font-bold text-ink-900">Flights</h1>
      <p className="mt-2 text-ink-500">Results page coming in Phase 5.</p>
    </div>
  );
}
