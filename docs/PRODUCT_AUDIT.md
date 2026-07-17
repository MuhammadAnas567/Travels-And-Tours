# UEB3 Travel — Full Product Audit

**Product:** UEB3 Travel (`Travels-And-Tours`)  
**Stack:** Next.js 16 · React 19 · Prisma + MongoDB Atlas · Mongoose catalogues · NextAuth · Stripe · Resend  
**Live:** https://travels-and-tours-psi.vercel.app  
**Audit date:** 17 Jul 2026  
**Priority order:** **Functionality first** → trust & conversion → UX/UI polish → growth

---

## 1. Executive verdict

UEB3 today is a **strong branded travel shell** with a **partial booking engine**. Public catalogues (hotels, flights, packages, tours) look real because of rich fallbacks, but many verticals still end in **Contact / WhatsApp / Request-to-book** instead of a complete commerce loop.

| Layer | Maturity | Notes |
|---|---|---|
| Brand / visual system | High | Pine/sand, Fraunces + Hanken, editorial landing |
| Catalogue browsing | Medium–High | DB + fallbacks; filters exist on several lists |
| Search → results | Medium | Search widget works; not always end-to-end bookable |
| Auth + dashboard | Medium | Works when Atlas is healthy; wishlist is localStorage only |
| Tour checkout (Stripe) | Medium | Real path for seeded Prisma tours only |
| Hotels / flights / cars commerce | Low | Mostly inquiry CTAs |
| Payments (local PK) | Low | Schema has JazzCash/EasyPaisa/bank; UX incomplete |
| Admin ops | Medium | Tours/bookings/quotes/visa/customers exist; shallow for ops |
| Coupons / deals | Low | Display only — not applied at checkout |
| Trust / compliance | Low–Medium | Legal pages exist; insurance/partners are static info |

**Bottom line:** To feel like a real travel product (not a template), invest first in **bookable paths**, **payment + booking state machine**, **synced wishlist/profile**, and **honest inventory** — then polish UI.

---

## 2. What already works (baseline)

Keep and harden these — do not rebuild.

### 2.1 Working or mostly working
- Public IA: Flights, Hotels, Packages, Tours, Deals, Destinations, Cars, Visa, Blog, Plan a trip, Contact, FAQ, legal pages
- Hybrid catalogue: Atlas/Mongoose when available, timed fallbacks when slow/empty (`lib/data/catalog.ts`, `lib/data/home.ts`)
- Tour booking with Stripe Payment Element for non-fallback tour IDs (`booking-flow`, `create-intent`, Stripe webhook)
- Fallback tours correctly degrade to **Request to book** → contact (`booking-widget.tsx`)
- NextAuth credentials + dashboard (bookings, profile, wishlist UI)
- Currency display: PKR / USD via cookie + `DisplayPrice` conversion
- Contact → QuoteRequest persistence (+ optional Resend email)
- Newsletter persistence (when DB up)
- Admin: tours CRUD, bookings, customers, quotes, visa inquiries, reviews
- Health check: `/api/health`
- Brand-consistent header/footer across public + dashboard

### 2.2 Known production dependencies
Without healthy `DATABASE_URL` / `MONGODB_URI` + Auth/Stripe env (see `docs/ATLAS_SEED.md`):
- Sign-in / signup fails
- Stripe checkout fails
- Contact/newsletter may fail to persist
- Site still “looks live” via fallbacks → **trust risk** if users try to book

### 2.3 Architecture snapshot (codebase inventory)
- **Dual DB:** Prisma (tours, bookings, auth, visa, quotes, coupons, blog, FX) + Mongoose (hotels, flights, destinations)
- **API surface is thin:** only auth, Stripe intent/webhook, contact, health — most logic is Server Actions
- **Packages ≈ tours alias** (`getCachedPackages` / tour fallbacks), not flight+hotel bundles
- **Flights:** no Amadeus client wired despite env docs — seed/fallback + contact CTA only
- **Local payments path exists:** `/booking/pending/[id]` + admin verify; EasyPaisa/JazzCash mostly flags
- **Unused / underused:** `next-intl`, UploadThing/Cloudinary deps, deposit fields on schema, coupon on `Booking` model
- **No route-level `loading.tsx`** — loading is ad-hoc Suspense/skeletons
- **Trust placeholders:** default licence strings like `DTS-XXXX` / `IATA-XXXX` in `lib/site-config.ts`

---

## 3. Functionality audit (main priority)

Scores: **0** missing · **1** stub/inquiry · **2** partial · **3** production-ready.

### 3.1 Booking verticals

| Vertical | Score | Current behavior | Gap to “real product” |
|---|---|---|---|
| **Tours** | 2 | Stripe for seeded tours; fallback → inquire | Inventory sync, deposits, cancellation, vouchers, multi-date calendar UX |
| **Hotels** | 1 | Browse + detail; CTA = Request stay / WhatsApp | Room types, dates/availability, rate plans, hold + pay, confirmation email |
| **Flights** | 1 | Search/filter results; CTA = Contact | PNR/GDS or aggregator API, passenger forms, fare rules, e-ticket |
| **Packages** | 1–2 | Catalogue filters; often links into tours/contact | Package = flight+hotel+transfer as one SKU with pricing engine |
| **Cars** | 1 | Static featured cars + quote CTA | Real fleet, pickup/drop, insurance add-ons, quote→booking |
| **Visa** | 1–2 | Country pages + inquiry pipeline in admin | Doc checklist upload, status tracking for user, fee payment |
| **Deals / coupons** | 1 | Codes listed on `/deals` | Apply at checkout, validation, usage limits, stacking rules |
| **Insurance** | 0–1 | Static info page | Attach policy to booking, quote premium by trip |
| **Plan a trip** | 1–2 | Quote form → admin quotes | Auto-assign agent, SLA, reply from admin, convert quote→booking |

### 3.2 Payments & money

| Capability | Score | Recommendation |
|---|---|---|
| Stripe card (international) | 2 | Harden webhooks, idempotency, failed-payment UX, receipts |
| PKR display | 2–3 | Done for display; ensure **charge currency** policy is explicit (charge USD vs PKR) |
| Bank transfer | 1 | Schema + flags exist; need upload proof, admin verify, auto-confirm |
| EasyPaisa / JazzCash | 0–1 | Enum only — integrate or remove from UI promises |
| Deposits / balance | 1 | `DEPOSIT_PAID` status exists; productize deposit % rules |
| Refunds / chargebacks | 0 | Admin refund flow + Stripe refund API |
| Invoices / PDF | 0–1 | Ticket page exists; add PDF invoice + branding |
| Tax / fee breakdown | 0 | Show base + taxes + service fee before pay |

**Pakistan-market note:** For local conversion, **JazzCash / EasyPaisa / bank transfer** often outperform pure Stripe cards. Treat local rails as P0 for PK audience; keep Stripe for international cards.

### 3.3 Account & retention

| Capability | Score | Gap |
|---|---|---|
| Register / login / forgot password | 2 | Email verification, stronger reset delivery, OAuth (Google) |
| Dashboard bookings | 2 | Filters, cancel/modify requests, upcoming reminders |
| E-ticket | 2 | Richer PDF, QR, share, calendar `.ics` |
| Wishlist | 1 | **localStorage only** — lost on device/browser; not synced to user |
| Profile / currency prefs | 1–2 | Cookie prefs ≠ saved `User.preferredCurrency` |
| Reviews | 1–2 | Admin reviews; post-trip review prompt missing |
| Notifications | 0 | Email/SMS/WhatsApp booking lifecycle |

### 3.4 Admin / operations (B2B side of product)

| Capability | Score | Gap |
|---|---|---|
| Tour CRUD | 2 | Media upload polish, date inventory UI, capacity alerts |
| Booking desk | 2 | Timeline, notes, assign agent, export CSV |
| Visa desk | 2 | Doc statuses already modeled — expose richer UI |
| Quotes desk | 2 | Quote builder with line items + send email |
| Customers | 1–2 | CRM notes, LTV, last contact |
| Content CMS | 0–1 | Blog/hotels often code/seed driven |
| Role permissions | 1 | USER/ADMIN only — need agent/editor roles |
| Audit log | 0 | Who changed booking/price |

### 3.5 Search & discovery (functionality)

| Capability | Score | Gap |
|---|---|---|
| Unified search widget | 2 | Persist recent searches server-side; deeplink fidelity |
| Flight filters | 2 | Sort by price/duration; calendar fare graph |
| Hotel filters | 2 | Map view, amenity filters, guest rating sort |
| Autocomplete airports/cities | 1 | Hardcoded/simple — need IATA/city index |
| SEO landing pages | 1–2 | Programmatic city/route pages for acquisition |
| Personalization | 0 | “Continue browsing”, abandoned search emails |

### 3.6 Critical functional defects / trust risks (fix first)

1. **Fallback IDs look bookable but aren’t** — users may hit “Request to book” after emotional commitment. Fix: badge “Inquire only” early; never show Stripe affordances on fallbacks.
2. **Coupons not redeemable** — advertising codes without checkout field destroys trust.
3. **Wishlist not account-bound** — logged-in users expect sync.
4. **Hotels/flights “Select” ≠ booking** — rename CTAs to “Request quote” until real booking exists *or* implement booking.
5. **Dual data systems (Prisma tours vs Mongoose hotels/flights)** — inventory inconsistency and harder ops. Long-term: one catalogue service.
6. **Currency cookie vs charge currency** — display PKR while Stripe charges USD without clear copy → support tickets.
7. **Static marketing pages** (insurance, partners, careers, investors, press, affiliates, advertise) — either wire lead forms or noindex until real.

---

## 4. Advanced functionality roadmap (research-backed)

Industry patterns from Booking.com / Expedia / Kayak / local OTAs (Sastaticket, Bookme) applied to UEB3’s size.

### Phase A — Make money paths real (4–6 weeks)

**A1. Single “Bookable inventory” contract**
- Every card/detail page declares: `bookable | inquire | coming_soon`
- CTA copy + analytics event forced by that flag
- Kill silent fallback→Stripe confusion

**A2. Hotel request → structured quote (MVP before full PMS)**
- Date range, guests, room preference, budget
- Creates QuoteRequest with type=HOTEL
- Admin can mark quoted/converted
- Better than fake availability calendars

**A3. Coupon engine at checkout**
- Input on booking step 2/3
- Server validate: dates, min spend, usage count, user limits
- Store discount on Booking model

**A4. Local payment rails (pick one first)**
- Bank transfer: instructions + reference code + proof upload + admin confirm
- Or EasyPaisa hosted checkout if partner available
- Keep Stripe for cards

**A5. Wishlist sync**
- On login: merge localStorage → `User` wishlist (Prisma or existing Mongoose field)
- Cross-device

**A6. Booking lifecycle emails**
- Confirmed / pending verification / cancelled / reminder T-3 days
- WhatsApp optional via template messages

### Phase B — Deepen verticals (6–10 weeks)

**B1. Tours productization**
- Capacity left on dates
- Child/infant pricing rules
- Optional extras (insurance, transfers)
- Deposit % + pay later

**B2. Flight path decision**
- Option 1 (agency): deepen inquiry with passenger count + preferred times + auto CRM
- Option 2 (tech): Amadeus/Duffel/Travelport sandbox → real offers (expensive, compliance heavy)
- Recommend Option 1 until GDS budget exists

**B3. Visa desk self-serve**
- User uploads docs to UploadThing
- Status visible in dashboard (`NEW → DOCS_NEEDED → …`)
- Fee payment attached

**B4. Packages as composed SKUs**
- Package = TourDate + optional hotel nights + transfer flag
- One price, one booking ID

### Phase C — Platform (ongoing)

- Agent roles + assignment
- Price rules / FX markup admin
- Review collection after COMPLETED
- Abandoned cart / abandoned search
- Affiliate tracking (you already have `/affiliates` shell)
- Multi-supplier inventory ingestion

---

## 5. UI / UX audit

### 5.1 Strengths
- Distinct brand (not generic purple SaaS)
- Strong first viewport on home (hero + search)
- Consistent header across authenticated areas
- Tabular price formatting + currency switch (PKR/USD)
- Mobile sticky filters on flights
- Honest contact copy when email/DB fails (good trust pattern)

### 5.2 UX issues that hurt conversion

| Issue | Why it hurts | Fix |
|---|---|---|
| Mixed CTA language (“Book Now” vs “Request stay” vs “Select flight”) | Users don’t know if payment will happen | Global CTA taxonomy by inventory state |
| Inquiry flows leave the funnel | Drop-off after contact | In-page quote modal + “we’ll reply in Xs” SLA |
| No progress on multi-step beyond tours | Hotels/flights feel dead-end | Always show next step + confirmation number for inquiries |
| Empty / error / loading inconsistency | Feels unfinished | Shared skeletons + empty illustrations + retry |
| Deals page without “Apply” | Feels fake | Either apply code or “Copy code” + where to use |
| Footer link farm (investors, press…) | Dilutes trust if thin | Hide or enrich |
| Dashboard vs marketing visual gap (improving) | Split personality | Keep unifying tokens/components |
| Price shown without “from” rules | Anchoring confusion | Always “from”, fees disclaimer |
| No map on hotels/destinations | Expected in travel UX | Map pin list (Mapbox/Google) |
| Search doesn’t show “X results for KHI→DXB” history | Low confidence | Result header + modify search bar sticky |

### 5.3 UI design system improvements

1. **Component completeness** — standardize Card/Price/CTA/Badge for `bookable|inquire`
2. **Density modes** — list vs comfort for flights (Kayak-style)
3. **Focus & a11y** — dropdown menus, skip links already exist; audit contrast on pine-900 menus
4. **Motion budget** — keep 2–3 intentional motions; reduce competing animations on home
5. **Image quality pipeline** — consistent aspect ratios, CDN, blur placeholders everywhere
6. **Typography hierarchy** — ensure product pages don’t overpower brand (per brand rules)
7. **Form UX** — inline validation, phone country codes, passenger forms reusable
8. **Toast strategy** — currency/language toasts OK; don’t toast on every nav

### 5.4 Mobile-specific
- Thumb-zone primary CTAs on hotel/tour detail
- Collapse secondary nav earlier
- Bottom sheet for filters (flights started this — extend to hotels)
- WhatsApp sticky only on inquire inventory (not on Stripe checkout)

### 5.5 Content / UX writing
- Replace vague “humans on support” with SLA (“reply within 2 business hours”)
- Fare rules & cancellation summary before pay
- PKR/USD: “Prices in PKR are estimates; card charges may be in USD” (until true PKR acquiring)

---

## 6. Technical & architecture improvements

| Area | Current | Improvement |
|---|---|---|
| Data | Prisma + Mongoose dual | Unified catalogue service or clear bounded contexts |
| Caching | Short timeouts → fallback | Stale-while-revalidate + tag revalidation for hotels/flights |
| Search | Client filters + basic query | Meilisearch/Typesense for typo-tolerant city/hotel search |
| Observability | `/api/health` | Structured logs, booking funnel metrics, Sentry |
| Testing | Sparse | E2E: search→book→webhook; contract tests for payments |
| Security | Auth + webhooks | Rate-limit contact/auth, CAPTCHA, CSRF on server actions |
| Perf | Fallback-heavy | Image CDN, route-level splitting, reduce client islands |
| i18n | English-only (current product choice) | Keep simple; don’t re-add locales until copy ops exists |
| FX | Fallback rates | Admin markup + daily FX job; show “as of” timestamp |
| Feature flags | Env booleans (bank transfer) | Flag bookable verticals per environment |

---

## 7. Trust, legal, and support (often ignored — converts)

1. Clear **cancellation & refund** policy tied to booking status  
2. **Company identity** on About (address, registration) matching footer  
3. Verified reviews (no anonymous seed spam without label)  
4. Secure checkout badges only when Stripe session is live  
5. Support channels: email + WhatsApp with response-time promise  
6. GDPR/data deletion request path if you store EU users  
7. PCI: never touch raw cards (Stripe Elements already helps)

---

## 8. Analytics & product research loops

Instrument before big UI redesigns:

| Funnel event | Purpose |
|---|---|
| `search_submit` (vertical, from, to, dates) | Demand |
| `result_impression` / `result_click` | Ranking quality |
| `cta_click` (`book` vs `inquire`) | Honesty of inventory |
| `checkout_started` / `payment_succeeded` | Revenue |
| `quote_submitted` | Agency pipeline |
| `wishlist_add` | Intent |
| `currency_change` | PK vs US audience |

Qualitative: 5 user tests (Karachi/Lahore travellers) on “book Dubai trip in 10 minutes”.

---

## 9. Prioritized backlog (do this order)

### P0 — Functionality (ship or stop promising)
1. Inventory state machine on all CTAs (`bookable|inquire`)  
2. Coupon apply at tour checkout (model field exists — wire validation)  
3. Wishlist sync to logged-in user  
4. Finish bank-transfer proof UX **or** hide EasyPaisa/JazzCash until integrated  
5. Booking emails (confirm + pending)  
6. Explicit charge-currency copy (USD Stripe vs PKR display)  
7. Seed + `/api/health` monitoring so live never shows bookable UI without DB  
8. Replace fake licence badges (`DTS-XXXX` / `IATA-XXXX`) with real numbers or remove  
9. Admin CRUD for coupons (and optionally hotels/blog) — today deals are seed-only

### P1 — Conversion UX
1. In-page inquiry modal with ticket ID  
2. Sticky modify-search on results  
3. Hotel detail: dates/guests before CTA  
4. Deals: copy-code + “Use at checkout”  
5. Empty/error skeletons sitewide  
6. Map on destinations/hotels  
7. Dashboard: cancel/modify request

### P2 — UI polish & growth
1. Flight list density + sort  
2. Review-after-trip  
3. Programmatic SEO city pages  
4. Agent roles in admin  
5. Optional real flight API later  
6. Insurance attach-on add-on  

---

## 10. Suggested success metrics (90 days)

| Metric | Target direction |
|---|---|
| % searches that get a structured response (book or ticketed inquire) | → 100% |
| Tour checkout completion rate | ↑ |
| Inquire → quoted within 24h | ↑ |
| Logged-in wishlist retention | ↑ |
| Support tickets “price wrong currency” | → 0 |
| Payment success (Stripe + local) | ↑ |
| Bounce on thin footer pages | ↓ (or remove pages) |

---

## 11. Page-by-page notes (quick)

| Route | Functional note |
|---|---|
| `/` | Strong; ensure deal/hotel CTAs respect inventory state |
| `/flights` | Results OK; booking missing |
| `/hotels`, `/hotels/[slug]` | Browse OK; request-only |
| `/packages` | Catalogue; deepen into bookable packages |
| `/tours`, `/tours/[slug]` | Best commerce path — invest here first |
| `/cars` | Static — quote only |
| `/visa`, `/visa/[country]` | Inquiry OK; user tracking weak |
| `/deals` | Display coupons; no redemption |
| `/plan-trip` | Quote intake — connect SLA |
| `/contact` | Solid when DB/email configured |
| `/dashboard/*` | Useful; wishlist local-only |
| `/admin/*` | Ops MVP — needs workflow depth |
| `/booking/*` | Core revenue — harden |
| `/insurance`, `/partners`, … | Content shells — don’t overclaim |

---

## 12. Conclusion

UEB3’s brand and browsing experience are ahead of its **transactional depth**. Competitors win on **reliable inventory + payment + post-booking trust**, not on hero gradients.

**Strategic focus:**
1. Make **one vertical fully great** (Tours + payments + coupons + emails).  
2. Make every other vertical **honest and operational** (structured inquire + admin SLA).  
3. Then expand hotels/flights booking when suppliers/APIs justify it.  
4. UI polish should follow functional truth — beautiful dead-ends hurt more than plain working checkouts.

---

*This audit is based on the current codebase structure (`app/`, `actions/`, `prisma/schema.prisma`, catalogue fallbacks, Stripe/booking paths, and `docs/ATLAS_SEED.md`). Re-audit after Phase A.*
