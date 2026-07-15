"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-11 rounded-sm bg-pine-500 px-5 py-2 text-sm font-semibold text-paper hover:bg-pine-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2"
    >
      Print / Save PDF
    </button>
  );
}
