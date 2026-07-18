export type AppLocale = "en";

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "EN",
};

export const LOCALE_NAMES: Record<AppLocale, string> = {
  en: "English",
};

export const SUPPORTED_LOCALES: AppLocale[] = ["en"];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.flights": "Flights",
  "nav.hotels": "Hotels",
  "nav.packages": "Packages",
  "nav.tours": "Tours",
  "nav.deals": "Deals",
  "nav.more": "More",
  "nav.destinations": "Destinations",
  "nav.cars": "Car hire",
  "nav.visa": "Visa",
  "nav.guides": "Guides",
  "nav.plan": "Plan a trip",
  "nav.contact": "Contact",
  "nav.signIn": "Sign in",
  "nav.bookNow": "Book Now",
  "nav.dashboard": "Dashboard",
  "nav.admin": "Admin",
  "nav.signOut": "Sign out",
  "search.flights": "Flights",
  "search.hotels": "Hotels",
  "search.packages": "Packages",
  "search.cars": "Cars",
  "search.from": "From",
  "search.to": "To",
  "search.depart": "Depart",
  "search.return": "Return",
  "search.searchFlights": "Search flights",
  "search.searchHotels": "Search hotels",
  "search.searchPackages": "Search packages",
  "search.searchCars": "Search cars",
  "search.roundtrip": "Round trip",
  "search.oneway": "One way",
  "search.recent": "Recent",
  "search.adults": "adults",
  "search.adult": "adult",
  "hero.eyebrow": "UEB3 Travel · Worldwide",
  "hero.title": "Find your next horizon.",
  "hero.sub":
    "Flights, stays, and packages in one search — cinematic destinations, clear prices, humans on support.",
  "trust.price": "Best price clarity",
  "trust.secure": "Secure checkout",
  "trust.support": "24/7 support",
  "trust.rating": "4.8 traveller rating",
  "currency.toast": "Prices shown in {code}",
  "locale.toast": "Language set to {name}",
  "footer.currency": "Currency",
  "footer.language": "Language",
  "common.perNight": "per night",
  "common.from": "From",
  "common.selectFlight": "Select flight",
  "common.direct": "Direct",
  "common.results": "results",
  "common.filters": "Filters",
  "common.clearAll": "Clear all",
  "common.wishlistSave": "Saved to wishlist",
  "common.wishlistRemove": "Removed from wishlist",
  "dash.account": "Your account",
  "dash.overview": "Overview",
  "dash.bookings": "My Bookings",
  "dash.reviews": "Reviews",
  "dash.wishlist": "Wishlist",
  "dash.profile": "Profile",
  "dash.welcome": "Welcome, {name}",
  "dash.subtitle": "Manage your bookings, wishlist, and profile",
  "dash.totalBookings": "Total bookings",
  "dash.upcoming": "Upcoming trips",
  "dash.completed": "Completed",
  "dash.recent": "Recent bookings",
  "dash.viewAll": "View all",
  "dash.noBookings": "No bookings yet.",
  "dash.browseTours": "Browse tours",
  "prefs.currency": "Currency",
  "prefs.language": "Language",
};

export const DICTIONARIES: Record<AppLocale, Dict> = { en };

export function translate(
  locale: AppLocale,
  key: string,
  vars?: Record<string, string | number>
) {
  let text = DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export function navKeyForHref(href: string): string | null {
  const map: Record<string, string> = {
    "/flights": "nav.flights",
    "/hotels": "nav.hotels",
    "/packages": "nav.packages",
    "/tours": "nav.tours",
    "/deals": "nav.deals",
    "/things-to-do": "nav.destinations",
    "/cars": "nav.cars",
    "/visa": "nav.visa",
    "/blog": "nav.guides",
    "/plan-trip": "nav.plan",
    "/contact": "nav.contact",
  };
  return map[href] ?? null;
}
