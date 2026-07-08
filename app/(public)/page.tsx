import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/shared/search-bar";
import { TourCard } from "@/components/shared/tour-card";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { getFeaturedTours, getPopularDestinations } from "@/lib/tours";
import { getPreferredCurrency } from "@/lib/locale";
import { getFxRates } from "@/lib/currency";
import { siteConfig } from "@/lib/site-config";
import { MapPin, Star, ArrowRight, Globe2, Shield, Sparkles, Compass } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";

const DEST_IMAGES: Record<string, string> = {
  Switzerland: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600",
  Maldives: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600",
  Japan: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600",
  Kenya: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600",
  France: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600",
  Indonesia: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600",
};

export default async function HomePage() {
  const [featuredTours, destinations, currency, rates] = await Promise.all([
    getFeaturedTours(6),
    getPopularDestinations(),
    getPreferredCurrency(),
    getFxRates(),
  ]);

  const testimonials = [
    {
      name: "James Richardson",
      location: "London, UK",
      text: "The Swiss Alps tour exceeded every expectation. Flawless logistics, breathtaking scenery, and guides who truly cared.",
      rating: 5,
    },
    {
      name: "Aisha Malik",
      location: "Dubai, UAE",
      text: "Maldives luxury escape was pure magic. UEB3 handled every detail — from seaplane transfers to private dining.",
      rating: 5,
    },
    {
      name: "David Chen",
      location: "Singapore",
      text: "Kenya safari was the trip of a lifetime. We saw the Big Five on day one. Absolutely world-class organisation.",
      rating: 5,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-midnight">
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80"
          alt="International travel destinations"
          fill
          className="object-cover opacity-50 motion-safe:animate-[kenburns_25s_ease-in-out_infinite_alternate]"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 image-overlay-hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-midnight/40" />

        <Container className="relative py-28 md:py-36">
          <div className="max-w-4xl animate-fade-up">
            <p className="text-caption text-gold">World-Class International Travel</p>
            <h1 className="mt-4 font-display text-hero text-pearl">
              Discover the world&apos;s
              <br />
              <span className="gold-gradient-text">finest destinations</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-cream/75 leading-relaxed">
              Hand-crafted journeys across 50+ countries — luxury resorts, wild safaris,
              cultural immersions, and adventures that redefine travel.
            </p>
            <div className="mt-10 max-w-2xl">
              <SearchBar dark />
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-cream/50">
              <span className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-gold" /> 50+ Countries
              </span>
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gold" /> Licensed & Insured
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" /> Premium Experiences
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Category strip */}
      <Section background="surface" className="!py-10 border-b border-line">
        <Container>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { href: "/tours?category=LUXURY", label: "Luxury", icon: Sparkles, img: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400" },
              { href: "/tours?category=ADVENTURE", label: "Adventure", icon: Compass, img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" },
              { href: "/tours?category=WILDLIFE", label: "Safari", icon: Globe2, img: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=400" },
              { href: "/tours?category=BEACH", label: "Beach", icon: MapPin, img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400" },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group relative overflow-hidden rounded-[var(--radius-lg)] aspect-[4/3]"
              >
                <Image src={cat.img} alt={cat.label} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="25vw" />
                <div className="absolute inset-0 bg-midnight/40 group-hover:bg-midnight/30 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-pearl">
                  <cat.icon className="h-6 w-6 mb-2 text-gold" strokeWidth={1.5} />
                  <span className="font-display text-xl">{cat.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Featured tours */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Curated Collection"
            title="Signature departures"
            description="Expertly designed itineraries to the world's most extraordinary places."
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} currency={currency} rates={rates} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="accent" size="lg" asChild>
              <Link href="/tours">
                Explore all destinations <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Why us */}
      <Section background="midnight" className="!bg-midnight text-cream">
        <Container>
          <SectionHeader
            eyebrow="Why UEB3"
            title="Travel without compromise"
            align="center"
            className="[&_h2]:text-cream [&_p]:text-cream/60"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Shield, title: "Fully licensed", text: `IATA ${siteConfig.trust.iataNumber} · DTS ${siteConfig.trust.dtsLicense}` },
              { icon: Globe2, title: "Global expertise", text: "Local guides, international standards, 24/7 support on every journey" },
              { icon: Sparkles, title: "Tailored experiences", text: "From private villas in Maldives to exclusive safari camps in Kenya" },
            ].map((item) => (
              <div key={item.title} className="rounded-[var(--radius-lg)] border border-cream/10 bg-cream/5 p-8 text-center backdrop-blur-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
                  <item.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-display text-xl text-cream">{item.title}</h3>
                <p className="mt-2 text-sm text-cream/55 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Destinations grid */}
      <Section background="sand">
        <Container>
          <SectionHeader
            eyebrow="Explore"
            title="Popular destinations"
            description="Where our travellers are heading next."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest) => (
              <Link
                key={`${dest.country}-${dest.location}`}
                href={`/tours?country=${encodeURIComponent(dest.country)}`}
                className="group relative overflow-hidden rounded-[var(--radius-lg)] aspect-[16/10]"
              >
                <Image
                  src={DEST_IMAGES[dest.country] ?? "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600"}
                  alt={dest.location}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="33vw"
                />
                <div className="absolute inset-0 image-overlay" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-display text-2xl text-pearl">{dest.location}</h3>
                  <p className="text-sm text-cream/70">{dest.country} · {dest._count.id} packages</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Testimonials */}
      <Section background="surface">
        <Container>
          <SectionHeader title="Traveller stories" align="center" />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="card-luxury p-7">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }, (_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" aria-hidden />
                  ))}
                </div>
                <p className="mt-4 text-muted leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <footer className="mt-5 border-t border-line pt-4">
                  <cite className="not-italic">
                    <span className="font-semibold text-ink">{t.name}</span>
                    <span className="block text-sm text-muted">{t.location}</span>
                  </cite>
                </footer>
              </blockquote>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section background="midnight" className="!bg-midnight">
        <Container className="text-center">
          <p className="text-caption text-gold">Stay inspired</p>
          <h2 className="mt-2 font-display text-h2 text-cream">Your next adventure awaits</h2>
          <p className="mx-auto mt-3 max-w-md text-cream/55">
            Exclusive deals, destination guides, and travel inspiration — delivered to your inbox.
          </p>
          <NewsletterForm dark />
        </Container>
      </Section>
    </>
  );
}
