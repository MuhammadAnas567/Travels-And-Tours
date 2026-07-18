"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { IMAGE_BLUR_DATA_URL, PLACEHOLDER_TOUR_IMAGE } from "@/lib/images";
import { ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { DisplayPrice } from "@/components/shared/display-price";

export type JourneyStop = {
  id: string;
  name: string;
  country: string;
  image: string;
  priceFrom: number;
};

type Props = {
  destinations: JourneyStop[];
};

export function DestinationJourney({ destinations }: Props) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const current = destinations[active] ?? destinations[0];

  if (!destinations.length || !current) {
    return (
      <p className="text-ink-500 py-8">
        Destinations will appear here once the catalog is ready.
      </p>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-stretch">
      <div className="flex flex-col justify-center order-2 lg:order-1">
        <div
          role="listbox"
          aria-label="Destination journey"
          className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
        >
          {destinations.map((d, i) => {
            const selected = i === active;
            return (
              <button
                key={d.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => setActive(i)}
                className={cn(
                  "relative snap-start shrink-0 flex flex-col items-start gap-1 rounded-sm border px-3 py-3 min-w-[7.5rem] text-left transition-all duration-[var(--duration-base)] ease-[var(--ease-brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2",
                  selected
                    ? "border-pine-500 bg-pine-50 shadow-sm"
                    : "border-line bg-paper hover:border-taupe-400"
                )}
              >
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-ink line-clamp-1">{d.name}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <p className="eyebrow">
              Stop {active + 1} of {destinations.length}
            </p>
            <h3 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-ink tracking-tight">
              {current.name}
            </h3>
            <p className="mt-2 flex items-center gap-1.5 text-ink-500">
              <MapPin className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {current.country}
            </p>
            <p className="mt-5 text-ink-700 max-w-md leading-relaxed">
              Stays from{" "}
              <span className="font-semibold tabular-nums text-ink" data-price>
                <DisplayPrice amount={current.priceFrom} />
              </span>{" "}
              a night. Open hotels in {current.name}, or keep moving along the route.
            </p>
            <Link
              href={`/hotels?city=${encodeURIComponent(current.name)}`}
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-pine-500 px-6 py-3 text-sm font-semibold text-white hover:bg-pine-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2"
            >
              Browse stays in {current.name}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] overflow-hidden rounded-md shadow-float order-1 lg:order-2 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.image}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={current.image || PLACEHOLDER_TOUR_IMAGE}
              alt={`${current.name}, ${current.country}`}
              fill
              className="object-cover img-editorial img-cover"
              sizes="(max-width:1024px) 100vw, 48vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
            />
            <div className="absolute inset-0 image-scrim" />
            <p className="absolute bottom-6 left-6 right-6 font-display text-2xl font-semibold text-paper">
              From <DisplayPrice amount={current.priceFrom} />
              <span className="block mt-1 text-sm font-sans font-medium tracking-normal text-paper/70">
                per night · {current.country}
              </span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
