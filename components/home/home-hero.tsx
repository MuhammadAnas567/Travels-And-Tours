"use client";

import { useReducedMotion, motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { SearchWidget } from "@/components/search/search-widget";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";
import { Shield, BadgePercent, Headphones, Lock } from "lucide-react";
import { usePreferences } from "@/components/providers/preferences-provider";

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
      <div className="relative min-h-[min(85vh,720px)] sm:min-h-[min(92vh,820px)] flex items-end overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y, opacity }}>
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={reduceMotion ? undefined : { scale: [1.08, 1] }}
            transition={{ duration: 9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=85"
              alt="Open road through red rock desert at golden hour"
              fill
              className="object-cover object-[center_40%]"
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
            />
          </motion.div>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-pine-900/85 via-pine-900/35 to-pine-900/20 pointer-events-none" />
        <div className="absolute inset-0 image-overlay-hero pointer-events-none" aria-hidden />

        <div className="relative w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-40 sm:pb-48 md:pb-56">
          <motion.p
            className="eyebrow text-pine-400"
            initial={false}
            animate={reduceMotion ? undefined : { y: [10, 0], opacity: [0.5, 1] }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("hero.eyebrow")}
          </motion.p>
          <motion.h1
            className="mt-4 sm:mt-5 text-hero text-paper max-w-[16ch] drop-shadow-sm"
            initial={false}
            animate={reduceMotion ? undefined : { y: [18, 0] }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("hero.title")}
          </motion.h1>
          <motion.p
            className="mt-4 sm:mt-5 max-w-lg text-base sm:text-lg text-paper/85 leading-relaxed"
            initial={false}
            animate={reduceMotion ? undefined : { y: [14, 0] }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("hero.sub")}
          </motion.p>
        </div>
      </div>

      <motion.div
        className="relative mx-auto w-full max-w-5xl px-3 sm:px-6 -mt-28 sm:-mt-36 md:-mt-40 z-10"
        initial={false}
        animate={reduceMotion ? undefined : { y: [24, 0] }}
        transition={{ duration: 0.65, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="glass-panel rounded-lg shadow-float overflow-hidden">
          <SearchWidget className="!rounded-none !shadow-none !border-0 bg-transparent" />
        </div>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2 text-xs sm:text-sm text-ink-500">
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
