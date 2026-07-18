"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="flex min-w-0 w-fit items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 sm:gap-2.5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine-500 font-display text-base font-bold text-white shadow-sm">
        U
      </div>
      <span
        className={`truncate font-display text-lg font-semibold tracking-tight sm:text-xl ${
          light ? "text-paper" : "text-ink-900"
        }`}
      >
        UEB3 Travel
      </span>
    </Link>
  );
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative min-h-[100dvh] bg-sand">
      <div className="grid min-h-[100dvh] lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden lg:block">
          <Image
            src={AUTH_IMAGE}
            alt="Open road through red rock desert at golden hour"
            fill
            priority
            className="object-cover object-[center_40%]"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pine-900/90 via-pine-900/40 to-pine-900/25" />
          <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
            <BrandMark light />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-md"
            >
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-pine-200">
                UEB3 Travel · Worldwide
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-paper xl:text-5xl">
                Find your next horizon.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-paper/80">
                Flights, stays, and packages with clear prices — and humans on support when plans
                shift.
              </p>
            </motion.div>
          </div>
        </aside>

        <div className="relative flex flex-col">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 100% 0%, rgba(11,123,123,0.14), transparent), linear-gradient(180deg, #f7f3eb 0%, #efe8db 100%)",
            }}
            aria-hidden
          />
          <header className="relative z-10 flex min-w-0 items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5 lg:px-12">
            <div className="min-w-0 lg:invisible">
              <BrandMark />
            </div>
            <Link
              href="/"
              className="shrink-0 rounded-sm text-sm font-medium text-ink-500 hover:text-pine-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
            >
              ← Back to site
            </Link>
          </header>

          <div className="relative z-10 flex min-w-0 flex-1 items-center justify-center px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="min-w-0 w-full max-w-[420px]"
            >
              <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 text-ink-500 leading-relaxed">{subtitle}</p>
              <div className="mt-8">{children}</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
