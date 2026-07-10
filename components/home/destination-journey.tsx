"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { IMAGE_BLUR_DATA_URL, PLACEHOLDER_TOUR_IMAGE } from "@/lib/images";
import { ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

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
        No destinations loaded yet — run <code className="bg-primary-100 px-2 py-0.5 rounded">npm run seed</code>.
      </p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <div className="relative">
          <div
            className="absolute left-5 right-5 top-[1.35rem] h-px bg-gradient-to-r from-primary-500/20 via-primary-500 to-accent-500/60 hidden sm:block"
            aria-hidden
          />
          <div
            role="listbox"
            aria-label="Destination journey"
            className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
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
                    "relative z-[1] snap-start shrink-0 flex flex-col items-center gap-2 rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                    selected ? "opacity-100" : "opacity-70 hover:opacity-100"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-surface text-xs font-bold transition-colors",
                      selected
                        ? "border-accent-500 text-primary-700 shadow-card"
                        : "border-primary-500 text-primary-700"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="max-w-[5.5rem] text-center text-xs font-semibold text-ink-900 line-clamp-2">
                    {d.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={reduceMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-500">
              Stop {active + 1} of {destinations.length}
            </p>
            <h3 className="mt-2 font-heading text-3xl font-bold text-ink-900">
              {current.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-ink-500">
              <MapPin className="h-4 w-4" aria-hidden />
              {current.country}
            </p>
            <p className="mt-4 text-ink-600 max-w-md">
              Stays from <span className="font-semibold text-ink-900">${current.priceFrom}</span> a night.
              Open hotels in {current.name} or keep scrolling the route.
            </p>
            <Link
              href={`/hotels?city=${encodeURIComponent(current.name)}`}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Browse stays in {current.name}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] overflow-hidden rounded-3xl shadow-float">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.image}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={current.image || PLACEHOLDER_TOUR_IMAGE}
              alt={`${current.name}, ${current.country}`}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 45vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-heading text-xl font-bold text-white">
              From ${current.priceFrom}
              <span className="block text-sm font-medium text-white/75">per night</span>
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
