import Image from "next/image";
import Link from "next/link";
import { Star, Clock } from "lucide-react";
import { HOME_PACKAGES, HOME_BLOG } from "@/lib/data/home-content";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";
import { Badge } from "@/components/ui/badge";
import { DisplayPrice } from "@/components/shared/display-price";

export function FeaturedPackages() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {HOME_PACKAGES.map((pkg) => (
        <Link
          key={pkg.slug}
          href={`/packages?destination=${encodeURIComponent(pkg.destination)}`}
          className="group overflow-hidden rounded-md border border-line bg-paper shadow-sm card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={pkg.image}
              alt={pkg.title}
              fill
              className="object-cover img-cover"
              sizes="(max-width:768px) 100vw, 33vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-pine-900/70 to-transparent" />
            <Badge variant="promo" className="absolute top-3 left-3 bg-paper/95 text-ink-900 border-0">
              {pkg.destination}
            </Badge>
          </div>
          <div className="p-5">
            <h3 className="font-display text-lg font-semibold text-ink-900 group-hover:text-pine-500 transition-colors">
              {pkg.title}
            </h3>
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 text-ink-500">
                <Clock className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {pkg.duration}
              </span>
              <span className="inline-flex items-center gap-1 text-ink-700">
                <Star className="h-4 w-4 fill-pine-500 text-pine-500" strokeWidth={1.5} aria-hidden />
                <span className="tabular-nums font-semibold">{pkg.rating}</span>
              </span>
            </div>
            <p className="mt-4 text-ink-900">
              <span className="text-sm text-ink-500">from </span>
              <span className="text-xl font-bold tabular-nums" data-price>
                <DisplayPrice amount={pkg.priceFrom} />
              </span>
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function BlogPreview() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {HOME_BLOG.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="group flex flex-col overflow-hidden rounded-md border border-line bg-paper shadow-sm card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-500"
        >
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover img-cover"
              sizes="(max-width:768px) 100vw, 33vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
            />
          </div>
          <div className="flex flex-1 flex-col p-5">
            <p className="text-caption text-pine-500">
              {post.category} · {post.readMins} min read
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-ink-900 group-hover:text-pine-500 transition-colors">
              {post.title}
            </h3>
            <p className="mt-2 text-sm text-ink-500 leading-relaxed flex-1">{post.excerpt}</p>
            <span className="mt-4 text-sm font-semibold text-pine-500">Read article →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
