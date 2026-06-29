import Link from "next/link";
import { Compass, Share2, Globe, Mail } from "lucide-react";

const footerLinks = {
  explore: [
    { href: "/tours", label: "All Tours" },
    { href: "/tours?category=ADVENTURE", label: "Adventure" },
    { href: "/tours?category=BEACH", label: "Beach" },
    { href: "/tours?category=CULTURAL", label: "Cultural" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-ocean-100 bg-ocean-950 text-ocean-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-white">
              <Compass className="h-6 w-6 text-coral-400" aria-hidden />
              Wanderlust Tours
            </Link>
            <p className="mt-4 text-sm text-ocean-300">
              Curated travel experiences to the world&apos;s most breathtaking destinations.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Social media" className="text-ocean-400 hover:text-white">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Website" className="text-ocean-400 hover:text-white">
                <Globe className="h-5 w-5" />
              </a>
              <a href="mailto:hello@wanderlust.com" aria-label="Email" className="text-ocean-400 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white">Explore</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ocean-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ocean-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-ocean-300">
              <li>123 Travel Street</li>
              <li>New York, NY 10001</li>
              <li>
                <a href="mailto:hello@wanderlust.com" className="hover:text-white">
                  hello@wanderlust.com
                </a>
              </li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-ocean-800 pt-6 text-center text-sm text-ocean-400">
          © {new Date().getFullYear()} Wanderlust Tours. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
