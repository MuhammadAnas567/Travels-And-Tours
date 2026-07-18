import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Shield,
  CreditCard,
  Smartphone,
  Plane,
  ArrowUpRight,
} from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { FooterPrefs } from "@/components/layout/footer-prefs";
import { siteConfig } from "@/lib/site-config";
import { IMAGE_BLUR_DATA_URL } from "@/lib/images";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Investor Relations", href: "/investors" },
  ],
  support: [
    { label: "Help Center", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
    { label: "Tours", href: "/tours" },
    { label: "Visa support", href: "/visa" },
    { label: "Travel Guides", href: "/blog" },
    { label: "Cancellation Policy", href: "/terms" },
    { label: "Travel Insurance", href: "/insurance" },
  ],
  destinations: [
    { label: "Dubai", href: "/hotels?city=Dubai" },
    { label: "Paris", href: "/hotels?city=Paris" },
    { label: "Tokyo", href: "/hotels?city=Tokyo" },
    { label: "Maldives", href: "/hotels?city=Male" },
    { label: "New York", href: "/hotels?city=New York" },
    { label: "Bali", href: "/hotels?city=Bali" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/privacy#cookies" },
    { label: "Partners", href: "/partners" },
    { label: "Affiliates", href: "/affiliates" },
    { label: "Advertise", href: "/advertise" },
  ],
};

const spotlight = [
  {
    label: "Dubai",
    href: "/hotels?city=Dubai",
    src: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&q=80",
  },
  {
    label: "Paris",
    href: "/hotels?city=Paris",
    src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
  },
  {
    label: "Maldives",
    href: "/hotels?city=Male",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  },
  {
    label: "Tokyo",
    href: "/hotels?city=Tokyo",
    src: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
  },
];

const paymentLabels = ["Visa", "Mastercard", "Amex", "PayPal"];

export function Footer() {
  return (
    <footer className="relative overflow-x-clip text-paper">
      {/* Atmospheric band */}
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=70"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[center_60%] opacity-40"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
          />
          <div className="absolute inset-0 bg-pine-900/92" aria-hidden />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 10% 0%, rgba(43,150,150,0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(11,123,123,0.25), transparent 50%)",
            }}
            aria-hidden
          />
        </div>

        {/* CTA strip */}
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 md:pt-20">
          <div className="relative overflow-hidden rounded-2xl border border-paper/10 bg-paper/5 backdrop-blur-md px-6 py-8 sm:px-10 sm:py-10 md:flex md:items-center md:justify-between md:gap-10">
            <div className="max-w-xl">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-pine-200">
                UEB3 Travel
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-paper leading-tight">
                Find your next horizon.
              </h2>
              <p className="mt-3 text-sm text-paper/65 leading-relaxed max-w-md">
                Flights, stays, packages, and visas — clear prices, real support, destinations that
                feel cinematic.
              </p>
            </div>
            <div className="mt-6 flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row md:mt-0">
              <Link
                href="/flights"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-paper px-6 text-sm font-semibold text-pine-700 transition-colors hover:bg-pine-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-300 sm:w-auto"
              >
                Search flights
              </Link>
              <Link
                href="/plan-trip"
                className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border border-paper/25 px-6 text-sm font-semibold text-paper transition-colors hover:bg-paper/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-300 sm:w-auto"
              >
                Plan a trip
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        {/* Destination spotlight */}
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <div className="flex items-end justify-between gap-4 mb-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-pine-200">
              Popular destinations
            </p>
            <Link
              href="/hotels"
              className="text-sm text-paper/60 hover:text-paper transition-colors"
            >
              Browse stays
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-4 sm:gap-4">
            {spotlight.map((d) => (
              <Link
                key={d.label}
                href={d.href}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-paper/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-300"
              >
                <Image
                  src={d.src}
                  alt={d.label}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR_DATA_URL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pine-900/85 via-pine-900/20 to-transparent" />
                <span className="absolute bottom-3 left-3 font-display text-base sm:text-lg font-semibold text-paper">
                  {d.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pine-500 font-display text-lg font-bold text-white shadow-sm">
                  U
                </div>
                <span className="font-display text-xl font-semibold text-paper">UEB3 Travel</span>
              </div>
              <p className="mt-4 text-sm text-paper/60 leading-relaxed max-w-sm">
                An international travel desk for routes, stays, and custom itineraries — based in
                Islamabad, booking worldwide.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-paper/70">
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 text-pine-300 shrink-0" strokeWidth={1.5} />
                  <span>{siteConfig.office.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-pine-300 shrink-0" strokeWidth={1.5} />
                  <a
                    href={`mailto:${siteConfig.office.email}`}
                    className="hover:text-paper transition-colors"
                  >
                    {siteConfig.office.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-pine-300 shrink-0" strokeWidth={1.5} />
                  <a
                    href={`tel:${siteConfig.office.phone.replace(/\s/g, "")}`}
                    className="hover:text-paper transition-colors"
                  >
                    {siteConfig.office.phone}
                  </a>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-paper/55">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-pine-300" aria-hidden /> Secure booking
                </span>
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-pine-300" aria-hidden /> Major cards
                </span>
                <span className="flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-pine-300" aria-hidden /> Mobile ready
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2" aria-label="Accepted payment methods">
                {paymentLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-paper/15 bg-paper/5 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-paper/55"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {siteConfig.trust.iataNumber ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-500/30 border border-pine-300/25 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-pine-100">
                    <Plane className="h-3 w-3" strokeWidth={1.5} /> {siteConfig.trust.iataNumber}
                  </span>
                ) : null}
                {siteConfig.trust.dtsLicense ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/10 border border-paper/15 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-paper/70">
                    <Shield className="h-3 w-3" strokeWidth={1.5} /> DTS{" "}
                    {siteConfig.trust.dtsLicense}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 min-[380px]:grid-cols-2 sm:grid-cols-4 sm:gap-6 lg:col-span-8">
              {(
                [
                  { title: "Company", links: footerLinks.company },
                  { title: "Support", links: footerLinks.support },
                  { title: "Destinations", links: footerLinks.destinations },
                  { title: "Legal", links: footerLinks.legal },
                ] as const
              ).map((col) => (
                <div key={col.title}>
                  <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-pine-200">
                    {col.title}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {col.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link
                          href={l.href}
                          className="text-sm text-paper/65 hover:text-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine-300 rounded-sm"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter + meta */}
          <div className="mt-14 sm:mt-16 grid gap-8 border-t border-paper/10 pt-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="max-w-md">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-pine-200">
                Fare alerts
              </p>
              <p className="mt-2 text-sm text-paper/55 leading-relaxed">
                One note a week — route drops and new stays, never filler.
              </p>
              <div className="mt-4">
                <NewsletterForm dark />
              </div>
            </div>
            <div className="flex flex-col gap-3 text-xs text-paper/45 lg:items-end lg:text-right">
              <FooterPrefs />
              <p>© {new Date().getFullYear()} UEB3 Travel. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
