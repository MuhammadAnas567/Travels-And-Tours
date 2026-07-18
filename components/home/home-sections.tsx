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
  type LucideIcon,
} from "lucide-react";
import { HOME_SERVICES, HOME_TRUST, HOME_PARTNERS, HOME_WHY } from "@/lib/data/home-content";
import { Reveal } from "@/components/shared/reveal";

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

export function TrustBar() {
  return (
    <section className="border-y border-line bg-paper">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {HOME_TRUST.map((item) => (
            <div key={item.label} className="text-center md:text-left">
              <p className="font-display text-2xl md:text-3xl font-semibold text-ink-900 tabular-nums">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-ink-500">{item.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-line pt-6">
          <span className="text-caption text-ink-300">Trusted with</span>
          {HOME_PARTNERS.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold tracking-wide text-ink-300 uppercase"
            >
              {name}
            </span>
          ))}
        </div>
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
              className="group flex h-full flex-col rounded-md border border-line bg-paper p-5 shadow-sm transition-all duration-[var(--duration-base)] ease-[var(--ease-brand)] hover:-translate-y-1 hover:shadow-md hover:border-pine-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
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
            <div className="rounded-md bg-paper p-6 border border-line h-full">
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
