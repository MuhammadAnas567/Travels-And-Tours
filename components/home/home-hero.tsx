"use client";

import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import Image from "next/image";
import { SearchWidget } from "@/components/search/search-widget";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";
import { Shield, BadgePercent, Headphones, Lock } from "lucide-react";

const trustItems = [
  { icon: Shield, label: "Honest published fares" },
  { icon: Lock, label: "Encrypted checkout" },
  { icon: Headphones, label: "Humans on support" },
  { icon: BadgePercent, label: "4.8 traveller rating" },
];

export function HomeHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative -mt-14 min-[480px]:-mt-[4.5rem] pt-14 min-[480px]:pt-[4.5rem] w-full overflow-x-clip">
      <div className="relative min-h-[min(78vh,640px)] sm:min-h-[min(88vh,720px)] md:min-h-[min(92vh,760px)] flex items-end overflow-hidden film-grain">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85"
          alt="Alpine ridge at blue hour above a still lake"
          fill
          className={`object-cover object-[center_35%] img-editorial ${reduceMotion ? "" : "ken-burns"}`}
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
        />
        <div className="absolute inset-0 image-overlay-hero pointer-events-none" aria-hidden />

        <div className="relative w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-36 sm:pb-44 md:pb-52">
          <motion.p
            className="eyebrow text-[#C49A5C]"
            initial={false}
            animate={reduceMotion ? undefined : { y: [10, 0], opacity: [0.6, 1] }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Private journeys · Worldwide
          </motion.p>
          <motion.h1
            className="mt-4 sm:mt-5 text-hero text-[#F6F3EC] w-full max-w-[18ch] sm:max-w-[14ch]"
            initial={false}
            animate={reduceMotion ? undefined : { y: [16, 0] }}
            transition={{ duration: 0.65, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            Arrive somewhere worth remembering.
          </motion.h1>
          <motion.p
            className="mt-4 sm:mt-5 max-w-md text-base sm:text-lg text-[#F6F3EC]/80 leading-relaxed"
            initial={false}
            animate={reduceMotion ? undefined : { y: [12, 0] }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            Search flights, stays, and composed packages — then watch the route draw as you set origin and destination.
          </motion.p>
        </div>
      </div>

      <motion.div
        className="relative mx-auto w-full max-w-5xl px-3 sm:px-6 -mt-24 sm:-mt-32 md:-mt-36 z-10"
        initial={false}
        animate={reduceMotion ? undefined : { y: [20, 0] }}
        transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        <SearchWidget />
        <ul className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-8 gap-y-2 text-xs sm:text-sm text-ink-500 px-1">
          {trustItems.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1.5 sm:gap-2">
              <Icon className="h-4 w-4 shrink-0 text-brass-500" strokeWidth={1.5} aria-hidden />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
