# Atlas / production seed checklist

Public catalogue pages work from rich fallbacks when Mongo is slow or empty. **Auth, Stripe checkout, admin, and newsletter persistence** need a healthy Atlas database.

## Vercel environment

Set these on the Vercel project (Production + Preview):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MongoDB Atlas URI (Prisma). Prefer `mongodb+srv://…` with a database name. |
| `MONGODB_URI` | Same Atlas URI for Mongoose (hotels / flights / destinations). |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` / `AUTH_URL` | Canonical site URL, e.g. `https://your-app.vercel.app` |
| `STRIPE_SECRET_KEY` | Stripe **test** key for demos |
| `STRIPE_WEBHOOK_SECRET` | From Stripe CLI or Dashboard webhook |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Matching publishable key |
| `RESEND_API_KEY` | Optional — contact email delivery |
| `CONTACT_EMAIL` | Inbox for contact form |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional WhatsApp CTA |

Without Resend, contact still **stores** inquiries as `QuoteRequest` rows when Atlas is reachable. Without Atlas **and** Resend, the form returns an honest error.

## Seed Atlas

From a machine that can reach Atlas:

```bash
# In .env.local — Atlas URI (not localhost)
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER/travels-tours?retryWrites=true&w=majority
DATABASE_URL=$MONGODB_URI

npm run db:push
npm run seed:atlas
```

`seed:atlas` runs `scripts/seed.ts` against Atlas and creates:

- Admin / demo users (`admin@traveltours.com` / `admin123`, `user@example.com` / `user123`)
- Prisma **tours with `TourDate` rows** (bookable Stripe path)
- Mongoose hotels + flights inventory
- Visa countries + coupons (via `prisma/seed-extensions`)

## Verify after seed

1. Sign in with the demo user — dashboard loads.
2. Open a seeded tour (not `fallback-*` id) → **Book Now** → Stripe test checkout.
3. `/flights?from=KHI&to=DXB` shows rows (DB or fallback).
4. `/visa` lists countries.
5. Contact form succeeds (email or stored quote).

## Local vs live

- Local: `npm run dev` starts embedded Mongo on port **27018** and can seed via `db:seed-if-empty`.
- Live: always set Atlas URIs; fallbacks keep the public demo fast if Atlas times out.
