"use client";

import dynamic from "next/dynamic";

const SearchWidget = dynamic(
  () => import("@/components/search/search-widget").then((m) => m.SearchWidget),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-md bg-paper shadow-lg border border-line w-full max-w-full h-[220px] animate-pulse"
        aria-hidden
      />
    ),
  }
);

export function SearchWidgetLazy({ className }: { className?: string }) {
  return <SearchWidget className={className} />;
}
