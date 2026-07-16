"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (!images.length) return null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-line">
        <Image
          src={images[active]}
          alt={`${title} - image ${active + 1}`}
          fill
          className="object-cover img-editorial"
          priority
          sizes="(max-width: 1200px) 100vw, 70vw"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              type="button"
              key={img}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500 focus-visible:ring-offset-2",
                active === i
                  ? "border-pine-500"
                  : "border-line opacity-70 hover:opacity-100 hover:border-pine-300"
              )}
              aria-label={`View image ${i + 1}`}
              aria-current={active === i}
            >
              <Image src={img} alt="" fill className="object-cover img-editorial" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
