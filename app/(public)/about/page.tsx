import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about UEB3 Tours and our mission to create unforgettable travel experiences.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink-900">About UEB3 Tours</h1>
      <div className="prose prose-ocean mt-6 max-w-none text-ink-700">
        <p>
          Founded in 2010, UEB3 Tours has been connecting travelers with
          extraordinary experiences across 50+ countries. We believe travel
          transforms lives, broadens perspectives, and creates lasting memories.
        </p>
        <p className="mt-4">
          Our team of travel experts carefully curates each tour package, partnering
          with local guides and sustainable operators to ensure authentic, responsible
          tourism. From adventure seekers to honeymooners, we have something for
          every type of traveler.
        </p>
        <h2 className="mt-8 text-xl font-semibold text-primary-700">Our Mission</h2>
        <p>
          To make world-class travel accessible, safe, and unforgettable for everyone.
        </p>
      </div>
    </div>
  );
}
