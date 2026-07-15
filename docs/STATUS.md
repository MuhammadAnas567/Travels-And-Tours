# STATUS — Responsive + nav pass (2026-07-15)

## Done
- Unified public nav config (`components/layout/nav-config.ts`)
- Header: Tours/Deals primary; Destinations, Cars, Visa, Guides, Plan trip, Contact in More + full mobile list
- Navbar (auth/dashboard): aligned to same link set; `lg` hamburger; body scroll lock
- Destination cards → responsive grid; things-to-do grid
- Tours filters collapse on mobile; results first on small screens
- Flight mobile filter bar safe-area; search travellers popover width
- Footer support links: Tours, Visa, Guides; tighter mobile padding
- WhatsApp FAB clears flight filter bar on mobile

## Half-done / not this pass
- Currency/lang toggles in Header still UI-only (no i18n persistence)
- Multi-city search tab still no distinct behavior
- Admin tables: horizontal scroll only (acceptable)
- Hotel/tour detail sticky mobile booking CTA

## Untouched (N/A or lower priority)
- Styleguide grid density
- Dual Navbar vs Header visual chrome (dark vs paper) — intentional by route group
