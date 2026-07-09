import Image from "next/image";
import Link from "next/link";
import { SearchWidget } from "@/components/search/search-widget";
import { DestinationCard } from "@/components/cards/destination-card";
import { HotelCard } from "@/components/cards/hotel-card";
import { getTrendingDestinations, getPopularHotels, getDealOfWeek } from "@/lib/data/home";
import {
  Shield, Headphones, BadgePercent, Lock, Star, ChevronRight,
  Palmtree, Building2, Mountain, Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const trustFeatures = [
  { icon: Shield, title: "Book with confidence", text: "Free cancellation on most hotels" },
  { icon: BadgePercent, title: "Best price guarantee", text: "Find a lower price? We'll match it" },
  { icon: Headphones, title: "24/7 support", text: "Real humans, anytime you need help" },
  { icon: Lock, title: "Secure payments", text: "Your data is encrypted and protected" },
];

const categories = [
  { label: "Beach", icon: Palmtree, href: "/hotels?tag=beach", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
  { label: "City", icon: Building2, href: "/hotels?city=Paris", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400" },
  { label: "Mountains", icon: Mountain, href: "/hotels?city=Interlaken", image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400" },
  { label: "Adventure", icon: Compass, href: "/packages?category=adventure", image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400" },
];

const testimonials = [
  { name: "Sarah M.", location: "London", text: "Booked flights and hotel in Tokyo in minutes. Seamless experience from start to finish.", rating: 5 },
  { name: "Ahmed K.", location: "Dubai", text: "The Maldives package was incredible value. UEB3 made our honeymoon unforgettable.", rating: 5 },
  { name: "Emily R.", location: "New York", text: "Best travel site I've used. Filters are spot-on and prices beat every competitor.", rating: 5 },
];

export default async function HomePage() {
  const [destinations, hotels, deal] = await Promise.all([
    getTrendingDestinations(8),
    getPopularHotels(6),
    getDealOfWeek(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative -mt-16 pt-16">
        <div className="relative min-h-[580px] md:min-h-[640px] flex items-end">
          <Image
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80"
            alt="Explore the world"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/40 via-primary-900/20 to-primary-900/70" />
          <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-32 md:pb-40 pt-32">
            <h1 className="text-hero text-white max-w-2xl">
              Explore the world with confidence
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/80">
              Flights, hotels, packages, and more — all in one place. Real prices, real availability.
            </p>
          </div>
        </div>

        {/* Floating search widget */}
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 -mt-24 md:-mt-28 z-10">
          <SearchWidget />
        </div>
      </section>

      {/* Trending destinations */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-h2 font-heading font-bold text-ink-900">Trending destinations</h2>
              <p className="mt-1 text-ink-500">Where travellers are booking right now</p>
            </div>
            <Link href="/hotels" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-500 hover:text-primary-700">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {destinations.length > 0 ? (
              destinations.map((d) => (
                <div key={String(d._id)} className="snap-start">
                  <DestinationCard
                    name={d.name}
                    country={d.country}
                    image={d.image}
                    priceFrom={d.priceFrom}
                  />
                </div>
              ))
            ) : (
              <p className="text-ink-500 py-8">Run <code className="bg-primary-100 px-2 py-0.5 rounded">npm run seed</code> to load destinations.</p>
            )}
          </div>
        </div>
      </section>

      {/* Deal of the week */}
      {deal && (
        <section className="bg-accent-100 border-y border-accent-500/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent-600">Deal of the week</p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-ink-900">{deal.name}</h2>
              <p className="text-ink-500">{deal.city}, {deal.country} — from <strong className="text-ink-900">${deal.pricePerNight}/night</strong></p>
            </div>
            <Button asChild className="bg-accent-600 hover:bg-accent-500 text-ink-900 font-bold rounded-xl h-12 px-8">
              <Link href={`/hotels/${deal.slug}`}>Book now</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Why book with us */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-heading font-bold text-ink-900 text-center">Why book with UEB3</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trustFeatures.map((f) => (
              <div key={f.title} className="rounded-2xl border border-line bg-surface-alt p-6 text-center card-hover">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-500">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-heading font-bold text-ink-900">{f.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular hotels */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-heading font-bold text-ink-900">Popular hotels</h2>
          <p className="mt-1 text-ink-500 mb-8">Top-rated stays loved by our travellers</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.length > 0 ? (
              hotels.map((h) => (
                <HotelCard
                  key={String(h._id)}
                  slug={h.slug}
                  name={h.name}
                  city={h.city}
                  country={h.country}
                  image={h.images[0]}
                  starRating={h.starRating}
                  avgRating={h.avgRating}
                  reviewCount={h.reviewCount}
                  pricePerNight={h.pricePerNight}
                  amenities={h.amenities}
                />
              ))
            ) : (
              <p className="col-span-3 text-ink-500">No hotels yet — run <code className="bg-primary-100 px-2 py-0.5 rounded">npm run seed</code></p>
            )}
          </div>
        </div>
      </section>

      {/* Explore by category */}
      <section className="py-16 md:py-20 bg-surface-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-heading font-bold text-ink-900">Explore by category</h2>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.label} href={cat.href} className="group relative overflow-hidden rounded-2xl aspect-square card-hover shadow-card">
                <Image src={cat.image} alt={cat.label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                <div className="absolute inset-0 bg-ink-900/40 group-hover:bg-ink-900/30 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <cat.icon className="h-8 w-8 mb-2" />
                  <span className="font-heading text-xl font-bold">{cat.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-heading font-bold text-ink-900 text-center">What travellers say</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }, (_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent-500 text-accent-500" />
                  ))}
                </div>
                <p className="mt-3 text-ink-700 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <footer className="mt-4 border-t border-line pt-4">
                  <cite className="not-italic font-semibold text-ink-900">{t.name}</cite>
                  <span className="block text-sm text-ink-500">{t.location}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* App CTA */}
      <section className="bg-primary-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">Take UEB3 Travel everywhere</h2>
          <p className="mt-2 text-white/60 max-w-md mx-auto">Get exclusive app-only deals and manage your trips on the go.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button className="bg-white text-primary-900 hover:bg-white/90 rounded-xl h-11 px-6 font-semibold">App Store</Button>
            <Button className="bg-white text-primary-900 hover:bg-white/90 rounded-xl h-11 px-6 font-semibold">Google Play</Button>
          </div>
        </div>
      </section>
    </>
  );
}
