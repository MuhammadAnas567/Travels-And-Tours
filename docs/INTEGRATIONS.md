# UEB3 Integrations Guide

Advanced providers wired in the codebase. **Keys unlock live behaviour**; without keys, safe sandboxes/fallbacks run.

---

## 1. Stripe (card payments)

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

**Setup**
1. https://dashboard.stripe.com/test/apikeys  
2. Local webhook: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`  
3. Tour checkout → Payment Element → webhook confirms booking  

---

## 2. JazzCash / EasyPaisa (Pakistan wallets)

### JazzCash
| Variable | Notes |
|---|---|
| `JAZZCASH_ENABLED=true` | |
| `JAZZCASH_MERCHANT_ID` | From merchant portal |
| `JAZZCASH_PASSWORD` | |
| `JAZZCASH_INTEGRITY_SALT` | |
| `JAZZCASH_SANDBOX=true` | Uses local sandbox callback |

### EasyPaisa
| Variable | Notes |
|---|---|
| `EASYPAISA_ENABLED=true` | |
| `EASYPAISA_STORE_ID` | |
| `EASYPAISA_HASH_KEY` | |
| `EASYPAISA_SANDBOX=true` | Local sandbox |

**Flow:** Booking → wallet initiate API → sandbox/merchant redirect → confirm → `/booking/success`.

Bank transfer still uses proof upload when `BANK_TRANSFER_ENABLED=true` + account fields.

---

## 3. Mapbox maps

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | https://account.mapbox.com/ → Access tokens |

Shows on hotel detail + destinations. Without token → graceful placeholder.

---

## 4. CRM Phase 1 (in-app)

No external SaaS required.

- Roles: `USER` · `AGENT` · `ADMIN`
- `/admin/crm` or `/admin/quotes` — Kanban board  
- `/admin/agents` — promote users to AGENT (admin only)  
- Assign quote, status, notes  

Seed an agent: set a user’s `role` to `AGENT` in DB or via Admin → Agents.

---

## 5. Hotel live availability (BedBank-ready)

| Variable | Notes |
|---|---|
| `HOTELBEDS_API_KEY` | Hotelbeds / similar |
| `HOTELBEDS_API_SECRET` | |
| `HOTELBEDS_ENV=test` | test vs live |

Without keys → **sandbox availability** (realistic rooms/prices for city+dates).  
API: `GET /api/hotels/availability?city=Dubai&checkIn=&checkOut=&adults=2`

---

## 6. Amadeus flights

| Variable | Notes |
|---|---|
| `AMADEUS_CLIENT_ID` | https://developers.amadeus.com/ |
| `AMADEUS_CLIENT_SECRET` | |
| `AMADEUS_ENV=test` | use `production` only after approval |

**Flow:** Search → Amadeus Flight Offers (test) → merge with catalogue → “Live” badge.  
Booking still **Request quote** until Flight Create Orders is enabled (needs agency/IATA for production).

API: `GET /api/flights/search?from=KHI&to=DXB&date=2026-08-01&adults=1`

---

## Recommended enable order

1. Stripe test keys (revenue path)  
2. Mapbox token (UX)  
3. CRM agents (ops)  
4. Amadeus test keys (flights)  
5. Hotelbeds test keys (hotels)  
6. JazzCash/EasyPaisa merchant sandbox (local pay)

---

## After adding env vars

```bash
npx prisma db push
npx prisma generate
# restart next dev
```

Redeploy on Vercel after setting Production env vars.
