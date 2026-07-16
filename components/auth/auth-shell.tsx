"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative min-h-[100dvh] bg-sand">
      <div className="grid min-h-[100dvh] lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden lg:block">
          <Image
            src={AUTH_IMAGE}
            alt="Traveller looking over a coastal horizon"
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pine-900/90 via-pine-800/45 to-pine-700/20" />
          <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
            <Link
              href="/"
              className="font-display text-2xl font-semibold tracking-tight text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/60 rounded-sm w-fit"
            >
              UEB3 Travel
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-md"
            >
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-pine-100">
                Worldwide desk
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-paper xl:text-5xl">
                Find your next horizon.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-paper/80">
                Flights, stays, and packages with clear prices — and humans on support when plans shift.
              </p>
            </motion.div>
          </div>
        </aside>

        <div className="relative flex flex-col">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 100% 0%, rgba(11,123,123,0.12), transparent), linear-gradient(180deg, #f7f3eb 0%, #efe8db 100%)",
            }}
            aria-hidden
          />
          <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
            <Link
              href="/"
              className="font-display text-xl font-semibold text-pine-700 lg:invisible"
            >
              UEB3 Travel
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-ink-500 hover:text-pine-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 rounded-sm"
            >
              ← Back to site
            </Link>
          </header>

          <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="w-full max-w-[420px]"
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
