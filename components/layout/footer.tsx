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
  Clock,
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
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=70"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[center_40%] opacity-30"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
          />
          <div className="absolute inset-0 bg-ink-900/95" aria-hidden />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 70% 45% at 0% 0%, rgba(47,68,56,0.55), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(180,138,80,0.12), transparent 50%)",
            }}
            aria-hidden
          />
        </div>

        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 md:pt-20">
          <div className="relative overflow-hidden rounded-lg border border-paper/12 bg-paper/[0.06] px-6 py-8 sm:px-10 sm:py-10 md:flex md:items-center md:justify-between md:gap-10">
            <div className="max-w-xl">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-brass-400">
                UEB3 Travel
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-paper leading-tight tracking-tight">
                Find your next horizon.
              </h2>
              <p className="mt-3 text-sm text-paper/65 leading-relaxed max-w-md">
                Flights, stays, packages, and visas — clear prices, real support from our Lahore
                desk, destinations booked worldwide.
              </p>
            </div>
            <div className="mt-6 flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row md:mt-0">
              <Link
                href="/flights"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brass-500 px-6 text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 sm:w-auto"
              >
                Search flights
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border border-paper/25 px-6 text-sm font-semibold text-paper transition-colors hover:bg-paper/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 sm:w-auto"
              >
                Talk to the desk
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <div className="flex items-end justify-between gap-4 mb-4">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-paper/50">
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
                className="group relative aspect-[4/3] overflow-hidden rounded-md border border-paper/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
              >
                <Image
                  src={d.src}
                  alt={d.label}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-105 img-editorial"
                  placeholder="blur"
                  blurDataURL={IMAGE_BLUR_DATA_URL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/25 to-transparent" />
                <span className="absolute bottom-3 left-3 font-display text-base sm:text-lg font-semibold text-paper">
                  {d.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brass-500 font-display text-lg font-bold text-ink-900 shadow-sm">
                  U
                </div>
                <span className="font-display text-xl font-semibold text-paper">UEB3 Travel</span>
              </div>
              <p className="mt-4 text-sm text-paper/60 leading-relaxed max-w-sm">
                An international travel desk for routes, stays, and custom itineraries — based in
                DHA {siteConfig.office.city}, booking worldwide.
              </p>
              <ul className="mt-6 space-y-3.5 text-sm text-paper/75">
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 text-brass-400 shrink-0" strokeWidth={1.5} />
                  <span>{siteConfig.office.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-brass-400 shrink-0" strokeWidth={1.5} />
                  <a
                    href={`tel:${siteConfig.office.phone.replace(/\s/g, "")}`}
                    className="hover:text-paper transition-colors tabular-nums"
                  >
                    {siteConfig.office.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-brass-400 shrink-0" strokeWidth={1.5} />
                  <a
                    href={`mailto:${siteConfig.office.email}`}
                    className="hover:text-paper transition-colors break-all"
                  >
                    {siteConfig.office.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-brass-400 shrink-0" strokeWidth={1.5} />
                  <span>{siteConfig.office.hours}</span>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-paper/55">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-brass-400" aria-hidden /> Secure booking
                </span>
                <span className="flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-brass-400" aria-hidden /> Major cards
                </span>
                <span className="flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-brass-400" aria-hidden /> Mobile ready
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
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-500/25 border border-pine-300/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-pine-100">
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
                  <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-paper/45">
                    {col.title}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {col.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link
                          href={l.href}
                          className="text-sm text-paper/65 hover:text-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded-sm"
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

          <div className="mt-14 sm:mt-16 grid gap-8 border-t border-paper/10 pt-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="max-w-md">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-paper/45">
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
              <p>
                © {new Date().getFullYear()} UEB3 Travel · {siteConfig.office.city}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
