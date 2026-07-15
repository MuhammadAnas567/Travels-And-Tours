# STATUS — Luxury editorial redesign

## Done
- Design tokens (ink/sand/paper/brass/pine) + Fraunces/Hanken + kill switch
- Public Header/Footer + CatalogHero/EmptyCatalog
- Home, SearchWidget, HotelCard, TourCard, DestinationCard, Testimonials (no emoji)
- Catalog pages: flights, hotels, packages, cars, deals, things-to-do, tours, blog, plan-trip, faq
- Detail: hotels/[slug], tours/[slug], blog/[slug]
- Legal: terms, privacy; InfoPage shell; gallery; booking-widget; search-bar (no glass)
- Dual footer merged: `shared/footer` re-exports `layout/footer` (+ siteConfig trust)
- Admin layout + sidebar; Dashboard layout + sidebar
- Admin pages (overview, tours, bookings, customers, reviews, quotes, visa)
- Dashboard pages (overview, bookings, wishlist, profile, ticket)
- Auth ocean-* → pine/ink; print-button; filter-sidebar; label

## Remaining (light / optional)
- Booking success/pending pages minor copy polish
- Auth pages full editorial band (functional, tokens OK)
- Screenshot matrix at 375/768/1024/1440

## Untouched intentionally
- Routing, Prisma queries, Stripe payment intent logic
