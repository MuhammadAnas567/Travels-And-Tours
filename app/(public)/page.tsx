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
import { MapPin, Star, ArrowRight, Globe2, Mountain, Shield, FileCheck } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";

export default async function HomePage() {
  const [featuredTours, destinations, currency, rates] = await Promise.all([
    getFeaturedTours(6),
    getPopularDestinations(),
    getPreferredCurrency(),
    getFxRates(),
  ]);

  const testimonials = [
    {
      name: "Ahmed Khan",
      location: "Lahore, Pakistan",
      text: "Turkey visa aur tour dono UEB3 ne handle kiye — bilkul tension-free trip thi.",
      rating: 5,
    },
    {
      name: "Sarah Mitchell",
      location: "London, UK",
      text: "Hunza was breathtaking. Secure payment, professional guides, unforgettable scenery.",
      rating: 5,
    },
    {
      name: "Fatima Noor",
      location: "Karachi, Pakistan",
      text: "Umrah package excellent tha. JazzCash se deposit ki, baqi airport pe settle — very convenient.",
      rating: 5,
    },
  ];

  return (
    <>
      <section className="relative flex min-h-[90vh] items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920"
          alt="Hunza Valley, Pakistan"
          fill
          className="object-cover motion-safe:animate-[kenburns_20s_ease-in-out_infinite_alternate]"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 image-overlay" />
        <Container className="relative py-24">
          <p className="text-caption text-sand/80">Pakistan&apos;s trusted travel partner</p>
          <h1 className="mt-3 max-w-3xl font-display text-hero font-medium text-sand">
            Travel the world.
            <br />
            <span className="text-accent">Welcome the world.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-sand/85 leading-relaxed">
            Outbound tours, visa assistance, and inbound adventures across Hunza, Skardu &amp; beyond.
          </p>
          <div className="mt-10 max-w-4xl">
            <SearchBar />
          </div>
        </Container>
      </section>

      <Section background="surface">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/tours?audience=OUTBOUND"
              className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-line p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <Globe2 className="h-10 w-10 text-primary" strokeWidth={1.5} />
              <h2 className="mt-4 font-display text-2xl text-ink">Travel Abroad</h2>
              <p className="mt-2 text-muted">
                Dubai, Turkey, Umrah, Malaysia &amp; Europe — with visa help and local payment options.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Explore outbound <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/tours?audience=INBOUND"
              className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-line p-8 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <Mountain className="h-10 w-10 text-primary" strokeWidth={1.5} />
              <h2 className="mt-4 font-display text-2xl text-ink">Visit Pakistan</h2>
              <p className="mt-2 text-muted">
                Hunza, Skardu, Naran &amp; cultural heritage — crafted for international travellers.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Explore inbound <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Featured"
            title="Hand-picked departures"
            description="Curated experiences for outbound explorers and inbound adventurers."
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} currency={currency} rates={rates} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="accent" asChild>
              <Link href="/tours">View all tours</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Section background="sand">
        <Container>
          <SectionHeader title="Why travellers trust us" align="center" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Shield, title: "Licensed & registered", text: `DTS ${siteConfig.trust.dtsLicense}` },
              { icon: FileCheck, title: "Visa expertise", text: "End-to-end document guidance for Pakistani travellers" },
              { icon: Globe2, title: "Flexible payments", text: "Stripe, bank transfer, EasyPaisa & JazzCash" },
            ].map((item) => (
              <div key={item.title} className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 text-center shadow-sm">
                <item.icon className="mx-auto h-8 w-8 text-primary" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader title="Popular destinations" description="Where our travellers go next." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest) => (
              <Link
                key={`${dest.country}-${dest.location}`}
                href={`/tours?country=${encodeURIComponent(dest.country)}`}
                className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                </div>
                <div>
                  <h3 className="font-display font-medium text-ink group-hover:text-primary">{dest.location}</h3>
                  <p className="text-sm text-muted">{dest.country} · {dest._count.id} tours</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="surface">
        <Container>
          <SectionHeader title="What travellers say" align="center" />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <blockquote key={t.name} className="rounded-[var(--radius-lg)] border border-line bg-sand/50 p-6">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }, (_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" aria-hidden />
                  ))}
                </div>
                <p className="mt-3 text-muted leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <footer className="mt-4">
                  <cite className="not-italic">
                    <span className="font-medium text-ink">{t.name}</span>
                    <span className="block text-sm text-muted">{t.location}</span>
                  </cite>
                </footer>
              </blockquote>
            ))}
          </div>
        </Container>
      </Section>

      <Section background="ink">
        <Container className="text-center">
          <h2 className="font-display text-h2 text-sand">Get travel inspiration</h2>
          <p className="mx-auto mt-2 max-w-md text-sand/70">Deals, visa updates, and destination guides — straight to your inbox.</p>
          <NewsletterForm dark />
        </Container>
      </Section>
    </>
  );
}
