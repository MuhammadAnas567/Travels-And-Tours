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
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-ink-900">{title}</h1>
      <p className="mt-3 text-ink-500">{description}</p>
      <div className="mt-8 space-y-4 text-ink-600 leading-relaxed">
        {body.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
      <Link
        href={ctaHref}
        className="mt-8 inline-block text-sm font-semibold text-primary-500 hover:text-primary-700"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

export function infoMetadata(title: string, description: string): Metadata {
  return { title, description };
}
