import Image from "next/image";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";

export type CatalogHeroVariant =
  | "flights"
  | "hotels"
  | "packages"
  | "cars"
  | "tours"
  | "deals"
  | "blog"
  | "visa"
  | "plan"
  | "default";

type CatalogHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  variant?: CatalogHeroVariant;
  /** Optional override image URL */
  imageSrc?: string;
  imageAlt?: string;
};

const HERO_IMAGES: Record<
  CatalogHeroVariant,
  { src: string; alt: string; position: string }
> = {
  flights: {
    src: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=85",
    alt: "Aircraft wing above clouds at sunrise",
    position: "object-[center_45%]",
  },
  hotels: {
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=85",
    alt: "Luxury resort pool overlooking the ocean",
    position: "object-[center_40%]",
  },
  packages: {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85",
    alt: "Alpine peaks and glacial valley for vacation packages",
    position: "object-[center_40%]",
  },
  cars: {
    src: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=85",
    alt: "Coastal road trip at golden hour",
    position: "object-[center_50%]",
  },
  tours: {
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=85",
    alt: "Kayak on a turquoise alpine lake",
    position: "object-[center_40%]",
  },
  deals: {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85",
    alt: "Tropical beach shoreline from above",
    position: "object-[center_45%]",
  },
  blog: {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=85",
    alt: "Misty mountain lake at dawn",
    position: "object-[center_40%]",
  },
  visa: {
    src: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1920&q=85",
    alt: "Grand Canal Venice at dusk",
    position: "object-[center_45%]",
  },
  plan: {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=85",
    alt: "Sunlit valley and forest landscape",
    position: "object-[center_40%]",
  },
  default: {
    src: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1920&q=85",
    alt: "Traveller with backpack on a scenic overlook",
    position: "object-[center_40%]",
  },
};

/** Shared cinematic hero for catalog / listing pages */
export function CatalogHero({
  eyebrow,
  title,
  description,
  variant = "default",
  imageSrc,
  imageAlt,
}: CatalogHeroProps) {
  const preset = HERO_IMAGES[variant] ?? HERO_IMAGES.default;
  const src = imageSrc ?? preset.src;
  const alt = imageAlt ?? preset.alt;

  return (
    <section className="relative w-full overflow-hidden text-paper">
      <div className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[380px] flex items-end">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className={`object-cover ${preset.position} scale-105`}
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
        />
        {/* Depth overlays — readable type, photo still visible */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-pine-900/90 via-pine-900/40 to-pine-900/15"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pine-900/55 via-transparent to-transparent"
          aria-hidden
        />

        <div className="relative z-10 w-full mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-24 pb-14 sm:pb-16 md:pb-20">
          {eyebrow ? (
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-pine-200 drop-shadow-sm">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-display text-[1.85rem] leading-[1.1] sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold tracking-tight max-w-full sm:max-w-[18ch] break-words text-paper drop-shadow-sm">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 sm:mt-4 max-w-xl text-sm sm:text-base text-paper/85 leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type EmptyCatalogProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function EmptyCatalog({ title, description, children }: EmptyCatalogProps) {
  return (
    <div className="rounded-md border border-line bg-paper p-6 sm:p-10 md:p-12 text-center sm:text-left shadow-sm">
      <p className="font-display text-lg sm:text-xl font-semibold text-ink-900">{title}</p>
      <p className="mt-2 text-sm text-ink-500 max-w-md leading-relaxed mx-auto sm:mx-0">
        {description}
      </p>
      {children ? (
        <div className="mt-6 flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
          {children}
        </div>
      ) : null}
    </div>
  );
}
