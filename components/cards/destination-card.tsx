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
    <Link
      href={link}
      className="group relative shrink-0 w-64 overflow-hidden rounded-md border border-line shadow-sm card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={image || PLACEHOLDER_TOUR_IMAGE}
          alt={`${name}, ${country}`}
          fill
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className="img-cover img-editorial"
          sizes="256px"
        />
        <div className="absolute inset-0 image-scrim" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-lg font-semibold text-paper">{name}</h3>
          <p className="text-sm text-paper/75">{country}</p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-brass-400">
            From ${priceFrom}
          </p>
        </div>
      </div>
    </Link>
  );
}
