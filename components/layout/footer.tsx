import Link from "next/link";
import { Share2, Globe, Mail, Shield, CreditCard, Smartphone } from "lucide-react";
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
  explore: [
    { label: "Dubai", href: "/hotels?city=Dubai" },
    { label: "Paris", href: "/hotels?city=Paris" },
    { label: "Tokyo", href: "/hotels?city=Tokyo" },
    { label: "Maldives", href: "/hotels?city=Malé" },
    { label: "New York", href: "/hotels?city=New York" },
    { label: "Bali", href: "/hotels?city=Bali" },
  ],
  partners: [
    { label: "List Your Property", href: "/partners" },
    { label: "Affiliate Program", href: "/affiliates" },
    { label: "Advertise", href: "/advertise" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/privacy#cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500 font-bold">U</div>
              <span className="font-heading text-xl font-bold">UEB3 Travel</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/60 leading-relaxed">
              Book flights, hotels, and packages worldwide. Trusted by millions of travellers.
            </p>
            <div className="mt-5 flex gap-3">
              {[Share2, Globe, Mail, Share2].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-primary-500 hover:text-white transition-colors" aria-label="Social">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/50">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure booking</span>
              <span className="flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> All major cards</span>
              <span className="flex items-center gap-1"><Smartphone className="h-3.5 w-3.5" /> iOS & Android</span>
            </div>
          </div>

          {[
            { title: "Company", links: footerLinks.company },
            { title: "Support", links: footerLinks.support },
            { title: "Explore", links: footerLinks.explore },
            { title: "Partners", links: footerLinks.partners },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/65 hover:text-accent-500 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-wrap gap-4 text-xs text-white/40">
            {footerLinks.legal.map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-white/70">{l.label}</Link>
            ))}
          </div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} UEB3 Travel. All rights reserved.</p>
        </div>

        <div className="mt-8 max-w-md mx-auto">
          <NewsletterForm dark />
        </div>
      </div>
    </footer>
  );
}
