import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hotels",
  description: "Search and book hotels worldwide.",
};

export default function HotelsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h1 className="text-h2 font-heading font-bold text-ink-900">Hotels</h1>
      <p className="mt-2 text-ink-500">Results page coming in Phase 5. Use the home search widget to get started.</p>
    </div>
  );
}
