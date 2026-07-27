"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/site-config";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative min-h-[100dvh] bg-sand">
      <div className="grid min-h-[100dvh] lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden lg:block arreat-band">
          <Image
            src={AUTH_IMAGE}
            alt="Open road through red rock desert at golden hour"
            fill
            priority
            className="object-cover object-[center_40%] opacity-45"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pine-900/95 via-pine-900/55 to-pine-800/40" />
          <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
            <Logo href="/" variant="stack" onDark />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-md"
            >
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brass-400">
                {siteConfig.name} · Worldwide
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

        <div className="relative flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-16">
          <div className="mb-8 lg:hidden">
            <Logo href="/" variant="stack" />
          </div>
          <div className="mx-auto w-full max-w-md">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-ink-500">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <p className="mt-8 text-center text-sm text-ink-500">
              <Link href="/" className="font-medium text-pine-500 link-underline">
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
