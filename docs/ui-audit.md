# UI Audit — Batch 0 (UEB3 Travel)

Generated from live repo greps. Paths use `app/` + `components/` (no `src/`).

## 1. Route inventory

| Route | State |
|-------|--------|
| `/` | Built — hero, search, destinations, hotels, deals |
| `/flights` | Built — list + search; not true row/filter craft yet |
| `/hotels`, `/hotels/[slug]` | Built |
| `/packages`, `/tours`, `/tours/[slug]` | Built |
| `/cars` | Built — hard-coded `sampleCars` |
| `/things-to-do` | Built — empty without seed |
| `/deals`, `/blog`, `/blog/[slug]`, `/visa`, `/visa/[country]` | Built |
| `/plan-trip`, `/about`, `/contact`, `/faq` | Built |
| `/privacy`, `/terms` | Built — heavy `text-gray-*` |
| `/careers`, `/press`, `/investors`, `/partners`, `/affiliates`, `/advertise`, `/insurance` | Built via InfoPage |
| `/login`, `/register`, `/forgot-password` | Built — default palette (`gray`/`red`) |
| `/dashboard`, `/dashboard/bookings`, `/dashboard/bookings/[id]/ticket`, `/dashboard/profile`, `/dashboard/wishlist` | Built |
| `/admin/*` | Built — mixed ocean/gray |
| `/booking/[tourId]`, `/booking/success`, `/booking/cancel`, `/booking/pending/[id]` | Built |
| `/styleguide` | **Missing** (Batch 1) |

## 2. Component inventory (summary)

49 files under `components/`. Dual chrome: `layout/header`+`footer` (public) vs `shared/navbar`+`footer` (auth/dashboard/booking).

| Area | hover | focus-visible | loading | error/empty |
|------|-------|---------------|---------|-------------|
| `ui/button` | Y | Y | Y | N |
| `ui/input` | partial | Y | N | partial |
| `ui/card` | partial | N | N | N |
| `ui/badge` | N | N | N | N |
| `ui/skeleton` | N/A | N/A | Y | N/A |
| `search/search-widget` | Y | Y | Y | N (no inline validation) |
| `cards/*` | Y | Y | N | N |
| `layout/header` | Y | Y | N | N |
| EmptyState / ErrorState / Modal / Toast primitives | **Missing** | | | |
| Styleguide coverage | **0 components** | | | |

## 3. Violation counts (raw)

### Hex (`#[0-9a-fA-F]{3,8}`) — 26 hits
- `app/globals.css` — token definitions (allowed)
- `components/shared/stripe-payment-element.tsx` — Stripe Elements appearance API (4 hex)
- `components/shared/whatsapp-button.tsx` — `bg-[#25D366]`

### Default Tailwind palette utilities — **50+ line hits across 16 files**
Including: `text-gray-*`, `text-red-*`, `text-amber-*`, `text-green-*`, `fill-gray-*`, `border-amber-*`, `bg-amber-*` in auth, admin, tours detail, rating, cancel, ticket, privacy/terms.

### `rounded-(xs\|md\|lg\|xl\|2xl\|3xl)|shadow-(md\|lg\|xl\|2xl)` — **60+ hits**
Widespread `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-lg`, `shadow-lg`, `shadow-xl`, `shadow-md`.

### Placeholder / sample residue
- `cars/page.tsx`: `sampleCars`
- `things-to-do`: copy mentions “sample destinations”
- Many `placeholder=` props (input UX — not Lorem; still flagged by grep)
- No `lorem` / `test@test` / `destination 1` found

### `href="#"` — **0 hits**

### Icons — **lucide-react only** (package + imports). No react-icons / heroicons / feather.

### Native dialogs
- `cancel-booking-button.tsx`: `confirm(...)`
- `booking-actions.tsx`: `confirm(...)`

### Kill switch
- **Not present** — `--color-*: initial` absent; default palette still compiles.

## 4. Distinct radius / shadow

**Radius in use (too many):**  
rounded-none, rounded-sm, rounded-md, rounded-lg, rounded-xl, rounded-2xl, rounded-3xl, rounded-full, plus arbitrary var(--radius-*) forms

**Shadows in use:**  
shadow-none, shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-card, shadow-float, plus arbitrary var(--shadow-*) forms

Target after batches: radius sm/md/lg/full only; shadow sm/md/lg only.

## 5. Icon libraries

1. `lucide-react` — sole UI icon set.

## 6. Fonts (computed)

Dev server was starting during audit. Source of truth in `app/layout.tsx`:
- `--font-display` ← `Plus_Jakarta_Sans` (600/700, `display: swap`)
- `--font-body` ← `Inter` (400/500/600, `display: swap`)
- `body` class: `font-sans` → `--font-body`

**Computed verification deferred to Batch 1/9** (browser must be up). Expected once hydrated:
- `body`: `"Inter", …`
- `h1.font-heading`: `"Plus Jakarta Sans", …`

## 7. Ten worst offenders

1. No kill switch — `bg-gray-100` / `rounded-xl` still work → tokens optional.
2. No `/styleguide` — states claimed, not rendered.
3. Flights results look like soft cards, not booking-site rows + sticky filters.
4. Search widget missing trip-type segment, airport autocomplete, travellers popover, sticky compact bar, gold CTA discipline.
5. Dual nav systems (`layout/header` vs `shared/navbar`) — inconsistent chrome.
6. Auth + admin + tour detail still on `gray`/`red`/`amber`/`green`.
7. Radius soup (`xl`/`2xl`/`3xl`) across home, hotels, cars, wishlist.
8. `confirm()` for cancel/refund — banned native dialogs.
9. Gold used as navy-ish CTAs (`bg-primary-500` buttons) instead of gold-only primary CTA budget.
10. Empty destinations on prod without seed — “run npm run seed” in UI feels unfinished.

## Audit items to close (Batches 1–10)

- [ ] Kill switch
- [ ] Styleguide with every primitive × state
- [ ] Zero default palette classes
- [ ] Radius/shadow collapse
- [ ] Search widget spec
- [ ] Results row craft
- [ ] Detail + booking form a11y
- [ ] Imagery ratios + scrim
- [ ] Signature motion + reduced-motion proof
- [ ] Nav/footer/404/error chrome
- [ ] Final gate greps = 0
