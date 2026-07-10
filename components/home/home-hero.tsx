"use client";

import { useReducedMotion } from "framer-motion";
import { motion } from "framer-motion";
import Image from "next/image";
import { SearchWidget } from "@/components/search/search-widget";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";
import { Shield, BadgePercent, Headphones, Lock } from "lucide-react";

const trustItems = [
  { icon: Shield, label: "Best price guarantee" },
  { icon: Lock, label: "Secure payment" },
  { icon: Headphones, label: "24/7 support" },
  { icon: BadgePercent, label: "4.8 traveller rating" },
];

export function HomeHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative -mt-16 pt-16">
      <div className="relative min-h-[min(88vh,680px)] flex items-center">
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80"
          alt="Travellers overlooking a mountain road at sunset"
          fill
          className="object-cover object-[center_40%]"
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/55 via-primary-900/30 to-primary-900/85" />

        <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-40 md:pb-48">
          {/* initial={false}: never hide brand/hero copy behind opacity:0 (SSR + screenshots) */}
          <motion.p
            className="font-heading text-sm font-semibold tracking-[0.2em] uppercase text-accent-500"
            initial={false}
            animate={reduceMotion ? undefined : { y: [8, 0] }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            UEB3 Travel
          </motion.p>
          <motion.h1
            className="mt-3 text-hero text-white max-w-2xl drop-shadow-sm"
            initial={false}
            animate={reduceMotion ? undefined : { y: [12, 0] }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            Book the trip. Keep the price honest.
          </motion.h1>
          <motion.p
            className="mt-4 max-w-lg text-lg text-white/90"
            initial={false}
            animate={reduceMotion ? undefined : { y: [10, 0] }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Compare flights, hotels, and packages in one search — watch the route draw when you set origin and destination.
          </motion.p>
        </div>
      </div>

      <motion.div
        className="relative mx-auto max-w-5xl px-4 sm:px-6 -mt-28 md:-mt-32 z-10"
        initial={false}
        animate={reduceMotion ? undefined : { y: [16, 0] }}
        transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <SearchWidget />
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
          {trustItems.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-primary-500" aria-hidden />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
