import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { listFlights } from "@/lib/data/catalog";
import { SearchWidget } from "@/components/search/search-widget";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";
import { Plane } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flights",
  description: "Search flights worldwide and compare fares by cabin class.",
};

type Props = {
  searchParams: Promise<{ from?: string; to?: string; date?: string }>;
};

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default async function FlightsPage({ searchParams }: Props) {
  const params = await searchParams;
  const flights = await listFlights({ from: params.from, to: params.to });

  return (
    <div className="bg-surface-alt min-h-[60vh]">
      <div className="bg-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold">Flights</h1>
          <p className="mt-2 text-white/70">
            {params.from || params.to
              ? `${params.from ?? "Any"} → ${params.to ?? "Any"}`
              : "Compare routes and cabin fares"}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 relative z-10 mb-10">
        <SearchWidget />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 space-y-4">
        {flights.length > 0 ? (
          flights.map((f) => (
            <article
              key={String(f._id)}
              className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card"
            >
              <div className="flex items-center gap-3 sm:w-48 shrink-0">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-primary-100">
                  {f.airlineLogo ? (
                    <Image
                      src={f.airlineLogo}
                      alt={`${f.airline} aircraft`}
                      fill
                      className="object-cover"
                      sizes="40px"
                      placeholder="blur"
                      blurDataURL={IMAGE_BLUR_DATA_URL}
                    />
                  ) : (
                    <Plane className="m-2 h-6 w-6 text-primary-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-ink-900">{f.airline}</p>
                  <p className="text-xs text-ink-500">{f.flightNumber}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-2 text-center sm:text-left">
                <div>
                  <p className="text-lg font-bold text-ink-900">{f.from}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(f.departTime).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xs text-ink-500">{formatDuration(f.durationMins)}</p>
                  <div className="my-1 h-px w-full max-w-[80px] bg-line" />
                  <p className="text-xs text-ink-500">
                    {f.stops === 0 ? "Nonstop" : `${f.stops} stop${f.stops > 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="text-right sm:text-left">
                  <p className="text-lg font-bold text-ink-900">{f.to}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(f.arriveTime).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="sm:text-right shrink-0 border-t sm:border-t-0 border-line pt-3 sm:pt-0 sm:pl-4">
                <p className="text-xs text-ink-500">Economy from</p>
                <p className="text-2xl font-bold text-ink-900">
                  ${f.priceByClass?.economy ?? "—"}
                </p>
                <Link
                  href={`/contact?subject=${encodeURIComponent(`Flight ${f.flightNumber} ${f.from}-${f.to}`)}`}
                  className="mt-2 inline-block text-sm font-semibold text-primary-500 hover:text-primary-700"
                >
                  Request quote
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-line bg-surface p-10 text-center">
            <p className="text-ink-700 font-medium">No flights match these dates or airports</p>
            <p className="mt-2 text-sm text-ink-500">
              Try widening your search — use airport codes like DXB, LHR, or JFK.
            </p>
            <Link href="/flights" className="mt-4 inline-block text-sm font-semibold text-primary-500">
              View all flights
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
