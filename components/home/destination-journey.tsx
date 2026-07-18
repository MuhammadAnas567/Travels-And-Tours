"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { IMAGE_BLUR_DATA_URL, PLACEHOLDER_TOUR_IMAGE, unsplashSrc } from "@/lib/images";
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
    <div className="grid min-w-0 gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-stretch">
      <div className="order-1 flex min-w-0 flex-col justify-center">
        <div
          role="listbox"
          aria-label="Destination journey"
          className="-mx-4 flex max-w-[calc(100vw)] snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:max-w-full sm:px-0"
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
            className="mt-7 min-w-0 sm:mt-10"
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
              className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-pine-500 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-pine-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2 sm:mt-8 sm:w-auto sm:px-6"
            >
              Browse stays in {current.name}
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="group relative order-2 aspect-[3/2] max-h-[22rem] w-full self-center overflow-hidden rounded-lg bg-sand-200 shadow-float sm:max-h-[26rem] lg:aspect-[4/3] lg:max-h-[30rem]">
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
              src={unsplashSrc(current.image, 1400, 80) || PLACEHOLDER_TOUR_IMAGE}
              alt={`${current.name}, ${current.country}`}
              fill
              className="object-cover img-editorial img-cover transition-transform duration-[600ms] ease-[var(--ease-brand)] group-hover:scale-[1.03]"
              sizes="(max-width:1024px) 100vw, 48vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              unoptimized
            />
            <div className="absolute inset-0 image-scrim" />

            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink-900/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-paper backdrop-blur-none sm:left-5 sm:top-5">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
              {current.country}
            </span>

            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 sm:bottom-5 sm:left-5 sm:right-5">
              <div className="rounded-md bg-paper/95 px-4 py-3 shadow-sm">
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-500">
                  Stays from
                </p>
                <p className="mt-0.5 font-display text-xl font-semibold text-ink tabular-nums" data-price>
                  <DisplayPrice amount={current.priceFrom} />
                  <span className="ml-1 font-sans text-xs font-medium tracking-normal text-ink-500">
                    / night
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
