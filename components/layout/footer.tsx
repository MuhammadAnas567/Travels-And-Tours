import Link from "next/link";
import { Mail, Globe, Shield, CreditCard, Smartphone, Plane } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { siteConfig } from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";

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

const paymentLabels = ["Visa", "Mastercard", "Amex", "PayPal"];

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-14 flex flex-col gap-4 border-b border-brass-500/25 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-brass-400">UEB3 Travel</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-paper max-w-lg leading-tight">
              Journeys composed with care.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-paper/55 leading-relaxed">
            Flights, stays, and tailor-made itineraries — priced clearly, planned by people who
            still answer the phone.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-brass-500/40 font-display text-lg font-semibold text-brass-500">
                U
              </div>
              <span className="font-display text-xl font-semibold">UEB3 Travel</span>
            </div>
            <div className="mt-6 flex gap-3">
              <Link
                href="/contact"
                className="flex h-11 w-11 items-center justify-center rounded-sm border border-paper/15 text-paper/60 hover:border-brass-500 hover:text-brass-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
                aria-label="Email us"
              >
                <Mail className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link
                href="/about"
                className="flex h-11 w-11 items-center justify-center rounded-sm border border-paper/15 text-paper/60 hover:border-brass-500 hover:text-brass-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
                aria-label="About UEB3"
              >
                <Globe className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-paper/45">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-brass-500" aria-hidden /> Secure booking
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-brass-500" aria-hidden /> Major cards
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-brass-500" aria-hidden /> Mobile ready
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2" aria-label="Accepted payment methods">
              {paymentLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-sm border border-paper/12 bg-paper/5 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-paper/50"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {siteConfig.trust.iataNumber ? (
                <Badge
                  variant="accent"
                  className="gap-1 bg-brass-500/15 text-brass-300 border-brass-500/25"
                >
                  <Plane className="h-3 w-3" strokeWidth={1.5} /> {siteConfig.trust.iataNumber}
                </Badge>
              ) : null}
              {siteConfig.trust.dtsLicense ? (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-paper/10 text-paper/70 border-paper/15"
                >
                  <Shield className="h-3 w-3" strokeWidth={1.5} /> DTS {siteConfig.trust.dtsLicense}
                </Badge>
              ) : null}
            </div>
            <p className="mt-4 text-xs text-paper/40">{siteConfig.office.address}</p>
          </div>

          {(
            [
              { title: "Company", links: footerLinks.company },
              { title: "Support", links: footerLinks.support },
              { title: "Destinations", links: footerLinks.destinations },
              { title: "Legal", links: footerLinks.legal },
            ] as const
          ).map((col) => (
            <div key={col.title}>
              <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-brass-500/80">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="link-underline text-sm text-paper/60 hover:text-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500 rounded-sm"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-10 border-t border-paper/10 pt-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-brass-500">
              Dispatch
            </p>
            <p className="mt-2 text-sm text-paper/55">
              One note a week — fare drops and new routes, never filler.
            </p>
            <div className="mt-4">
              <NewsletterForm dark />
            </div>
          </div>
          <div className="flex flex-col gap-3 text-xs text-paper/40 lg:items-end">
            <div className="flex flex-wrap items-center gap-4">
              <span>Currency: USD</span>
              <span aria-hidden>·</span>
              <span>Language: English</span>
              <span aria-hidden>·</span>
              <Link href="/cars" className="hover:text-brass-400 transition-colors">
                Car hire
              </Link>
            </div>
            <p>© {new Date().getFullYear()} UEB3 Travel. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
