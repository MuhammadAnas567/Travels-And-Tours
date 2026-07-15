import type { Metadata } from "next";
import Link from "next/link";

type InfoPageProps = {
  title: string;
  description: string;
  body: string[];
  ctaHref?: string;
  ctaLabel?: string;
};

export function InfoPage({
  title,
  description,
  body,
  ctaHref = "/contact",
  ctaLabel = "Contact us",
}: InfoPageProps) {
  return (
    <div>
      <div className="bg-ink text-paper">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight max-w-[18ch]">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-paper/65 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="space-y-4 text-ink-500 leading-relaxed max-w-[65ch]">
          {body.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
        <Link
          href={ctaHref}
          className="mt-10 inline-flex min-h-11 items-center text-sm font-semibold text-pine-500 hover:text-pine-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded-sm"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

export function infoMetadata(title: string, description: string): Metadata {
  return { title, description };
}
