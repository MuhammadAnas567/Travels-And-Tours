"use client";

import Link from "next/link";
import {
  Package,
  Hotel,
  Plane,
  FileText,
  Car,
  Shield,
  Smartphone,
  Headphones,
  Sparkles,
  ArrowRight,
  Globe2,
  Star,
  type LucideIcon,
} from "lucide-react";
import { HOME_SERVICES, HOME_TRUST, HOME_PARTNERS, HOME_WHY } from "@/lib/data/home-content";
import { Reveal } from "@/components/shared/reveal";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const serviceIcons: Record<string, LucideIcon> = {
  package: Package,
  hotel: Hotel,
  plane: Plane,
  file: FileText,
  car: Car,
};

const whyIcons: Record<string, LucideIcon> = {
  shield: Shield,
  smartphone: Smartphone,
  headset: Headphones,
  sparkles: Sparkles,
};

function formatStat(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function AnimatedStat({
  value,
  suffix,
  sub,
  delay = 0,
}: {
  value: number;
  suffix: string;
  sub: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(reduceMotion ? formatStat(value) : "0");

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(formatStat(value));
      return;
    }
    const duration = 900;
    const start = performance.now() + delay;
    let raf = 0;
    const decimal = !Number.isInteger(value);

    const tick = (now: number) => {
      if (now < start) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = value * eased;
      setDisplay(decimal ? current.toFixed(1) : String(Math.round(current)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion, value, delay]);

  return (
    <div ref={ref} className="relative px-1 sm:px-2">
      <p className="font-display text-[1.75rem] sm:text-3xl md:text-4xl font-semibold text-ink-900 tabular-nums tracking-tight">
        {display}
        {suffix}
      </p>
      <p className="mt-1.5 text-sm text-ink-500 leading-snug">{sub}</p>
    </div>
  );
}

export function TrustBar() {
  return (
    <section className="relative border-y border-line bg-sand overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass-500/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 sm:py-14 md:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <Reveal>
            <div className="max-w-sm">
              <p className="eyebrow text-brass-600">Social proof</p>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
                Booked worldwide. Supported from Lahore.
              </h2>
              <p className="mt-3 text-sm text-ink-500 leading-relaxed max-w-[36ch]">
                Clear fares, verified partners, and a desk that answers when plans change.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-4 md:gap-6 lg:flex-1 lg:max-w-3xl">
            {HOME_TRUST.map((item, i) => (
              <AnimatedStat
                key={item.sub}
                value={item.value}
                suffix={item.suffix}
                sub={item.sub}
                delay={i * 80}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 sm:mt-14 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center border-t border-line pt-8">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-ink-400 shrink-0">
            Trusted with
          </span>
          <ul className="flex gap-2 sm:gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {HOME_PARTNERS.map((name) => (
              <li key={name} className="shrink-0">
                <span className="inline-flex min-h-11 items-center rounded-md border border-line bg-paper px-4 py-2 text-[0.7rem] sm:text-xs font-semibold uppercase tracking-[0.14em] text-ink-400 transition-colors duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:border-pine-300 hover:text-ink-900 hover:shadow-sm">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-500">
          <li className="inline-flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-pine-500" strokeWidth={1.5} aria-hidden />
            120+ countries on the desk
          </li>
          <li className="inline-flex items-center gap-2">
            <Star className="h-4 w-4 text-brass-500" strokeWidth={1.5} aria-hidden />
            4.8 average traveller rating
          </li>
          <li className="inline-flex items-center gap-2">
            <Headphones className="h-4 w-4 text-pine-500" strokeWidth={1.5} aria-hidden />
            Human support around the clock
          </li>
        </ul>
      </div>
    </section>
  );
}

export function ServicesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {HOME_SERVICES.map((s, i) => {
        const Icon = serviceIcons[s.icon] ?? Package;
        return (
          <Reveal key={s.href} delay={i * 0.06}>
            <Link
              href={s.href}
              className="group flex h-full flex-col rounded-md border border-line bg-paper p-5 shadow-sm transition-all duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:-translate-y-0.5 hover:shadow-md hover:border-pine-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-pine-50 text-pine-500 transition-colors group-hover:bg-pine-500 group-hover:text-paper">
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed flex-1">{s.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-pine-500">
                Explore
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-brand)] group-hover:translate-x-1"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

export function WhyChooseUs() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {HOME_WHY.map((item, i) => {
        const Icon = whyIcons[item.icon] ?? Shield;
        return (
          <Reveal key={item.title} delay={i * 0.06}>
            <div className="rounded-md bg-paper p-6 border border-line h-full transition-shadow duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pine-50 text-pine-600">
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">{item.description}</p>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
