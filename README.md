# UEB3 Tours — Travel & Tours Booking Platform

A production-ready full-stack travel booking platform built with **Next.js 16 (App Router)**, **TypeScript**, **Prisma**, **MongoDB**, **NextAuth.js**, and **Stripe**.

## Features

### Customer-facing
- Home page with hero search, featured tours, destinations, testimonials, newsletter
- Tour listing with server-side pagination, filters (URL-synced), and sorting
- Tour detail pages with gallery, itinerary, reviews, and booking widget
- Multi-step booking flow with server-side price calculation
- Stripe Payment Element (PaymentIntent) + webhook confirmation with e-ticket emails
- User dashboard (bookings, profile, printable e-tickets, cancellation)
- Auth: email/password + Google OAuth
- Static pages: About, Contact, FAQ, Terms, Privacy
- SEO: metadata, Open Graph, sitemap, robots.txt, JSON-LD

### Admin dashboard
- Overview stats and recent bookings
- Tours CRUD
- Bookings management with status updates and refunds
- Customer list with booking history
- Review moderation

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions)
- **Database:** MongoDB + Prisma ORM
- **Auth:** NextAuth.js v5 (Auth.js)
- **Payments:** Stripe PaymentIntent + Payment Element + Webhooks
- **Email:** Resend
- **Styling:** Tailwind CSS v4 + custom UI components
- **Forms:** React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (Atlas or local)
- Stripe account (test mode)
- Resend account (optional, for emails)

### 1. Clone and install

```bash
cd "Travels and Tours"
npm install
```

### 2. Environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Generate an auth secret:

```bash
openssl rand -base64 32
```

### 3. Database setup

```bash
# Push schema to database
npm run db:push

# Seed sample data (10 tours + admin/user accounts)
npm run db:seed
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Stripe payments (test mode)

1. Get **test** keys from [Stripe Dashboard → API keys](https://dashboard.stripe.com/test/apikeys):
   - `STRIPE_SECRET_KEY` (`sk_test_...`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_...`)

2. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Copy the CLI signing secret (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in `.env.local`, then restart `npm run dev`.

4. Book a tour while signed in. On the **Payment** step the Stripe Payment Element mounts in-page (no redirect). Use test card `4242 4242 4242 4242`, any future expiry, any CVC.

5. The webhook (`payment_intent.succeeded`) is the **source of truth**: it confirms the booking, generates `bookingReference` (e.g. `UEB3-A1B2C3`), and sends the confirmation email. Success page reads the finalized booking from MongoDB.

6. Optional CLI trigger (PaymentIntent path):

```bash
stripe trigger payment_intent.succeeded
```

> If Stripe keys are missing, the app still runs — create-intent returns `503` with a clear message. Admin refunds also no-op safely when Stripe is unset.

## Default Login Credentials

| Role  | Email                   | Password  |
|-------|-------------------------|-----------|
| Admin | admin@traveltours.com   | admin123  |
| User  | user@example.com        | user123   |

## Project Structure

```
app/
  (public)/     # Home, tours, static pages
  (auth)/       # Login, register, forgot password
  (dashboard)/  # User dashboard
  (admin)/      # Admin panel
  api/          # Auth, Stripe webhook, contact form
  booking/      # Booking flow + success/cancel
actions/        # Server actions
components/
  ui/           # Reusable UI primitives
  shared/       # Feature components
lib/            # DB, auth, stripe, validations, utils
prisma/         # Schema + seed
types/          # Shared TypeScript types
```

## Deployment (Vercel)

1. Push to GitHub and import to Vercel
2. Add all environment variables from `.env.example`
3. Use MongoDB Atlas (recommended) or a hosted MongoDB instance
4. Set `NEXT_PUBLIC_APP_URL` to your production URL
5. Configure Stripe webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

## Key Design Decisions

- **Server-side pricing:** All booking totals are recalculated on the server from DB values — client prices are never trusted
- **Atomic seat booking:** Stripe webhook uses a DB transaction to prevent overbooking
- **Children pricing:** 70% of adult price (industry-standard assumption)
- **JWT sessions:** Used with credentials provider; Prisma adapter handles OAuth account linking
- **Cancellation policy:** Free cancellation up to 7 days before departure

## License

MIT
