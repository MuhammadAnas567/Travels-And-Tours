import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Mail, Shield, CreditCard } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";

const footerLinks = {
  outbound: [
    { href: "/tours?audience=OUTBOUND", label: "Travel Abroad" },
    { href: "/visa", label: "Visa Assistance" },
    { href: "/tours?country=Turkey", label: "Turkey" },
    { href: "/tours?country=UAE", label: "Dubai & UAE" },
    { href: "/tours?category=UMRAH", label: "Umrah" },
  ],
  inbound: [
    { href: "/tours?audience=INBOUND", label: "Visit Pakistan" },
    { href: "/tours?country=Pakistan", label: "Hunza & Skardu" },
    { href: "/tours?category=HERITAGE", label: "Heritage Tours" },
    { href: "/blog", label: "Travel Guides" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/plan-trip", label: "Custom Quote" },
    { href: "/deals", label: "Deals" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-sand">
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo imageClassName="brightness-0 invert" />
            <p className="mt-4 max-w-sm text-sm text-sand/70 leading-relaxed">
              {siteConfig.tagline}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {siteConfig.trust.dtsLicense && (
                <Badge variant="accent" className="gap-1 bg-accent/20 text-accent">
                  <Shield className="h-3 w-3" /> DTS {siteConfig.trust.dtsLicense}
                </Badge>
              )}
              {siteConfig.trust.ptdcLicense && (
                <Badge variant="secondary" className="bg-sand/10 text-sand">
                  PTDC {siteConfig.trust.ptdcLicense}
                </Badge>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-sand/60">
              <CreditCard className="h-4 w-4" />
              Stripe · Bank Transfer · EasyPaisa · JazzCash
            </div>
          </div>

          <div>
            <h3 className="text-caption text-sand/50">Travel Abroad</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.outbound.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-sand/70 hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-caption text-sand/50">Visit Pakistan</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.inbound.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-sand/70 hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-caption text-sand/50">Company</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-sand/70 hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-1 text-sm text-sand/60">
              <p>{siteConfig.office.address}</p>
              <a href={`mailto:${siteConfig.office.email}`} className="flex items-center gap-1 hover:text-accent">
                <Mail className="h-3.5 w-3.5" /> {siteConfig.office.email}
              </a>
              <p>{siteConfig.office.phone}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-sand/10 pt-8">
          <p className="text-center text-sm text-sand/50">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="mx-auto mt-4 max-w-md">
            <NewsletterForm dark />
          </div>
        </div>
      </Container>
    </footer>
  );
}
