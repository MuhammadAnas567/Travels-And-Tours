"use client";

import { useReducedMotion, motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchWidget } from "@/components/search/search-widget";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";
import { Shield, BadgePercent, Headphones, Lock, ArrowRight } from "lucide-react";
import { usePreferences } from "@/components/providers/preferences-provider";

/** Cinque Terre coast — home hero only (not reused elsewhere). */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=2560&q=90";

export function HomeHero() {
  const reduceMotion = useReducedMotion();
  const { t } = usePreferences();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduceMotion ? "0%" : "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, reduceMotion ? 1 : 0.35]);

  const trustItems = [
    { icon: Shield, label: t("trust.price") },
    { icon: Lock, label: t("trust.secure") },
    { icon: Headphones, label: t("trust.support") },
    { icon: BadgePercent, label: t("trust.rating") },
  ];

  return (
    <section
      ref={ref}
      className="relative -mt-14 min-[480px]:-mt-16 pt-14 min-[480px]:pt-16 w-full overflow-x-clip"
    >
      <div className="relative min-h-[min(78vh,640px)] sm:min-h-[min(88vh,780px)] flex items-end overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y, opacity }}>
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={reduceMotion ? undefined : { scale: [1.1, 1] }}
            transition={{ duration: 10, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={HERO_IMAGE}
              alt="Colourful cliffside villages along the Cinque Terre coast at golden hour"
              fill
              className="object-cover object-[center_40%] img-editorial"
              priority
              sizes="100vw"
              quality={90}
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
            />
          </motion.div>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/40 to-ink-900/15 pointer-events-none" />
        <div className="absolute inset-0 image-overlay-hero pointer-events-none" aria-hidden />

        <div className="relative w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-36 sm:pb-44 md:pb-52">
          <motion.p
            className="eyebrow text-brass-400"
            initial={false}
            animate={reduceMotion ? undefined : { y: [10, 0], opacity: [0.5, 1] }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("hero.eyebrow")}
          </motion.p>
          <motion.h1
            className="mt-4 sm:mt-5 text-hero text-paper max-w-[15ch] drop-shadow-sm"
            initial={false}
            animate={reduceMotion ? undefined : { y: [18, 0] }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("hero.title")}
          </motion.h1>
          <motion.p
            className="mt-4 sm:mt-5 max-w-md text-base sm:text-lg text-paper/85 leading-relaxed"
            initial={false}
            animate={reduceMotion ? undefined : { y: [14, 0] }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("hero.sub")}
          </motion.p>
          <motion.div
            className="mt-6 flex flex-wrap gap-3"
            initial={false}
            animate={reduceMotion ? undefined : { y: [12, 0], opacity: [0.4, 1] }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/flights"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brass-500 px-5 text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
            >
              Search flights
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Link>
            <Link
              href="/plan-trip"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-paper/35 bg-paper/10 px-5 text-sm font-semibold text-paper transition-colors hover:bg-paper/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
            >
              Plan a custom trip
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="relative mx-auto w-full max-w-5xl px-3 sm:px-6 -mt-24 sm:-mt-32 md:-mt-36 z-10"
        initial={false}
        animate={reduceMotion ? undefined : { y: [24, 0] }}
        transition={{ duration: 0.65, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="rounded-lg border border-line bg-paper shadow-float overflow-hidden">
          <SearchWidget className="!rounded-none !shadow-none !border-0 bg-transparent" />
        </div>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-8 gap-y-2 text-xs sm:text-sm text-ink-500">
          {trustItems.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pine-50 text-pine-500">
                <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
