import type { LucideIcon } from "lucide-react";
import {
  Plane,
  Hotel,
  Package,
  Map,
  MapPin,
  Tag,
  Car,
  FileText,
  BookOpen,
  Phone,
  Compass,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
  /** Show in compact desktop bar (lg+) */
  primary?: boolean;
};

/** Canonical public site navigation — shared by Header + Navbar */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/flights", label: "Flights", icon: Plane, primary: true },
  { href: "/hotels", label: "Hotels", icon: Hotel, primary: true },
  { href: "/packages", label: "Packages", icon: Package, primary: true },
  { href: "/tours", label: "Tours", icon: Map, primary: true },
  { href: "/deals", label: "Deals", icon: Tag, primary: true },
];

export const MORE_NAV: NavItem[] = [
  { href: "/things-to-do", label: "Destinations", icon: MapPin },
  { href: "/cars", label: "Car hire", icon: Car },
  { href: "/visa", label: "Visa", icon: FileText },
  { href: "/blog", label: "Guides", icon: BookOpen },
  { href: "/plan-trip", label: "Plan a trip", icon: Compass },
  { href: "/contact", label: "Contact", icon: Phone },
];

export const ALL_NAV: NavItem[] = [...PRIMARY_NAV, ...MORE_NAV];

export function isActivePath(pathname: string, href: string) {
  const path = href.split("?")[0] ?? href;
  return pathname === path || pathname.startsWith(`${path}/`);
}
