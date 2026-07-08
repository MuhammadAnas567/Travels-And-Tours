import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Mail, Shield, CreditCard, Plane } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { Container } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";

const footerLinks = {
  destinations: [
    { href: "/tours?country=Switzerland", label: "Switzerland" },
    { href: "/tours?country=Maldives", label: "Maldives" },
    { href: "/tours?country=Japan", label: "Japan" },
    { href: "/tours?country=Kenya", label: "Kenya Safari" },
    { href: "/tours?country=France", label: "France" },
    { href: "/tours?country=Indonesia", label: "Bali & Indonesia" },
  ],
  experiences: [
    { href: "/tours?category=LUXURY", label: "Luxury Escapes" },
    { href: "/tours?category=ADVENTURE", label: "Adventure" },
    { href: "/tours?category=HONEYMOON", label: "Honeymoon" },
    { href: "/tours?category=WILDLIFE", label: "Wildlife Safari" },
    { href: "/visa", label: "Visa Assistance" },
    { href: "/deals", label: "Special Deals" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/plan-trip", label: "Custom Itinerary" },
    { href: "/blog", label: "Travel Guides" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-midnight text-cream">
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo imageClassName="brightness-0 invert" />
            <p className="mt-4 max-w-sm text-sm text-cream/60 leading-relaxed">
              {siteConfig.tagline}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {siteConfig.trust.iataNumber && (
                <Badge variant="accent" className="gap-1 bg-gold/15 text-gold border-gold/20">
                  <Plane className="h-3 w-3" /> {siteConfig.trust.iataNumber}
                </Badge>
              )}
              {siteConfig.trust.dtsLicense && (
                <Badge variant="secondary" className="gap-1 bg-cream/10 text-cream/80 border-cream/10">
                  <Shield className="h-3 w-3" /> DTS {siteConfig.trust.dtsLicense}
                </Badge>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-cream/50">
              <CreditCard className="h-4 w-4" />
              Visa · Mastercard · Bank Transfer · Stripe
            </div>
          </div>

          <div>
            <h3 className="text-caption text-gold/80">Destinations</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.destinations.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream/60 transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-caption text-gold/80">Experiences</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.experiences.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream/60 transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-caption text-gold/80">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.company.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream/60 transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-1.5 text-sm text-cream/50">
              <p>{siteConfig.office.address}</p>
              <a href={`mailto:${siteConfig.office.email}`} className="flex items-center gap-1.5 transition-colors hover:text-gold">
                <Mail className="h-3.5 w-3.5" /> {siteConfig.office.email}
              </a>
              <p>{siteConfig.office.phone}</p>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-cream/10 pt-8">
          <p className="text-center text-sm text-cream/40">
            © {new Date().getFullYear()} {siteConfig.name}. Crafting extraordinary journeys worldwide.
          </p>
          <div className="mx-auto mt-5 max-w-md">
            <NewsletterForm dark />
          </div>
        </div>
      </Container>
    </footer>
  );
}
