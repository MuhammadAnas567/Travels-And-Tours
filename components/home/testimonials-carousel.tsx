"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Sarah M.",
    location: "London, UK",
    flag: "🇬🇧",
    text: "Booked Tokyo flights and a Shinjuku hotel in one sitting. Prices matched what I’d been hunting for all week.",
    rating: 5,
  },
  {
    name: "Ahmed K.",
    location: "Dubai, UAE",
    flag: "🇦🇪",
    text: "Our Maldives package was clear on what’s included — no surprise resort fees. UEB3 made the honeymoon planning calm.",
    rating: 5,
  },
  {
    name: "Emily R.",
    location: "New York, USA",
    flag: "🇺🇸",
    text: "Filters actually work. I narrowed Paris stays by free cancellation and still found a boutique under budget.",
    rating: 5,
  },
];

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const t = testimonials[index];

  function prev() {
    setIndex((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  }
  function next() {
    setIndex((i) => (i === testimonials.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <figure className="rounded-3xl border border-line bg-surface px-6 py-10 sm:px-10 shadow-card text-center">
        <div className="flex justify-center gap-1">
          <span className="sr-only">{t.rating} out of 5 stars</span>
          {Array.from({ length: t.rating }, (_, i) => (
            <Star key={i} className="h-5 w-5 fill-accent-500 text-accent-500" aria-hidden />
          ))}
        </div>
        <blockquote className="mt-6">
          <p className="font-heading text-xl sm:text-2xl text-ink-900 leading-snug">
            &ldquo;{t.text}&rdquo;
          </p>
        </blockquote>
        <figcaption className="mt-6 flex flex-col items-center gap-1">
          <span className="text-2xl" aria-hidden>
            {t.flag}
          </span>
          <cite className="not-italic font-semibold text-ink-900">{t.name}</cite>
          <span className="text-sm text-ink-500">{t.location}</span>
        </figcaption>
      </figure>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={prev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-700 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2" role="tablist" aria-label="Testimonials">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "flex h-11 min-w-11 items-center justify-center rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                i === index ? "text-primary-500" : "text-ink-500 hover:text-primary-500"
              )}
            >
              <span
                className={cn(
                  "block h-2.5 w-2.5 rounded-full",
                  i === index ? "bg-primary-500" : "bg-line"
                )}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-700 hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
