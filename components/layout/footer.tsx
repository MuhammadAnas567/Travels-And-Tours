import Link from "next/link";
import { Mail, Globe, Shield, CreditCard, Smartphone } from "lucide-react";
import { NewsletterForm } from "@/components/shared/newsletter-form";

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
    { label: "Maldives", href: "/hotels?city=Malé" },
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
    <footer className="bg-primary-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 font-bold">
                U
              </div>
              <span className="font-heading text-xl font-bold">UEB3 Travel</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/60 leading-relaxed">
              Flights, hotels, and packages worldwide — with prices you can trust and humans on support.
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                href="/contact"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-primary-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                aria-label="Email us"
              >
                <Mail className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-primary-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                aria-label="About UEB3"
              >
                <Globe className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" aria-hidden /> Secure booking
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" aria-hidden /> Major cards
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5" aria-hidden /> Mobile ready
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2" aria-label="Accepted payment methods">
              {paymentLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white/55"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {[
            { title: "Company", links: footerLinks.company },
            { title: "Support", links: footerLinks.support },
            { title: "Destinations", links: footerLinks.destinations },
            { title: "Legal", links: footerLinks.legal },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/65 hover:text-accent-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/45">
            <span>Currency: USD</span>
            <span aria-hidden>·</span>
            <span>Language: English</span>
            <span aria-hidden>·</span>
            <Link href="/cars" className="hover:text-white/70">
              Car hire
            </Link>
          </div>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} UEB3 Travel. All rights reserved.
          </p>
        </div>

        <div className="mt-10 max-w-md">
          <p className="text-sm font-semibold text-white/80">Weekly deal alerts</p>
          <NewsletterForm dark />
        </div>
      </div>
    </footer>
  );
}
