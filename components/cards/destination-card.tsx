import Image from "next/image";
import Link from "next/link";
import { IMAGE_BLUR_DATA_URL, PLACEHOLDER_TOUR_IMAGE } from "@/lib/images";

type DestinationCardProps = {
  name: string;
  country: string;
  image: string;
  priceFrom: number;
  href?: string;
};

export function DestinationCard({ name, country, image, priceFrom, href }: DestinationCardProps) {
  const link = href ?? `/hotels?city=${encodeURIComponent(name)}`;

  return (
    <Link href={link} className="group relative shrink-0 w-64 overflow-hidden rounded-2xl card-hover shadow-card">
      <div className="relative aspect-[3/4]">
        <Image
          src={image || PLACEHOLDER_TOUR_IMAGE}
          alt={`${name}, ${country}`}
          fill
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="256px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-heading text-lg font-bold text-white">{name}</h3>
          <p className="text-sm text-white/70">{country}</p>
          <p className="mt-1 text-sm font-semibold text-accent-500">From ${priceFrom}</p>
        </div>
      </div>
    </Link>
  );
}
