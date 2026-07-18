# Atlas / production seed checklist

Public catalogue pages work from rich fallbacks when Mongo is slow or empty. **Auth, Stripe checkout, admin, and newsletter persistence** need a healthy Atlas database.

## Vercel environment (required for live Auth + bookings)

Without these, [the live site](https://travels-and-tours-psi.vercel.app/) shows catalogues from fallbacks but **sign-in / signup / Stripe / contact save will fail**.

Set on the Vercel project → Settings → Environment Variables (Production + Preview):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MongoDB Atlas URI (Prisma). Same cluster you seed. |
| `MONGODB_URI` | Same Atlas URI for Mongoose (hotels / flights). |
| `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `AUTH_URL` | `https://travels-and-tours-psi.vercel.app` (your live URL) |
| `NEXT_PUBLIC_APP_URL` | Same live URL |
| `STRIPE_SECRET_KEY` | Stripe **test** key |
| `STRIPE_WEBHOOK_SECRET` | Dashboard webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Matching publishable key |
| `RESEND_API_KEY` | Optional — contact email |
| `CONTACT_EMAIL` | Inbox for contact form |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional WhatsApp CTA |

**Atlas Network Access:** allow `0.0.0.0/0` so Vercel can connect.

**Demo login after seed:** `user@example.com` / `user123` · Admin: `admin@traveltours.com` / `admin123`

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
