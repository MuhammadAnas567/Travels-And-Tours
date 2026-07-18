# What you need to provide (UEB3)

Code from the product audit is partially shipped.  
**These need your accounts / decisions — I cannot finish them alone:**

## Must set (production)

1. **Atlas** — `DATABASE_URL` + `MONGODB_URI` (no quotes), Network Access `0.0.0.0/0`
2. **Auth** — `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`
3. **Stripe** — secret + publishable + webhook secret
4. **Email** — `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_EMAIL`
5. **WhatsApp** — `NEXT_PUBLIC_WHATSAPP_NUMBER`
6. **Real licences** (optional but recommended) — `TRUST_DTS_LICENSE`, `TRUST_IATA_NUMBER`  
   (Fake `DTS-XXXX` badges are now hidden until you set real values)

## Optional local payments

- **Bank transfer:** `BANK_TRANSFER_ENABLED=true` + bank name/title/account/IBAN  
- **EasyPaisa / JazzCash:** need real merchant APIs first — do **not** enable flags until then

## Run after pull

```bash
npx prisma db push
npx prisma generate
npm run seed:atlas   # if DB empty
```

## Advanced integrations (now in code — need your keys)

See **`docs/INTEGRATIONS.md`** for full setup.

| Feature | Env to set | Works without keys? |
|---|---|---|
| Stripe cards | `STRIPE_*` | No |
| JazzCash / EasyPaisa sandbox | `JAZZCASH_ENABLED=true` / `EASYPAISA_ENABLED=true` | Yes (local sandbox) |
| Mapbox maps | `NEXT_PUBLIC_MAPBOX_TOKEN` | Placeholder only |
| Amadeus live flights | `AMADEUS_CLIENT_ID` + `SECRET` | Catalogue fallback |
| Hotelbeds availability | `HOTELBEDS_API_KEY` + `API_SECRET` | Sandbox room rates |
| CRM agents | Promote user in `/admin/agents` | Yes (in-app) |

```bash
npx prisma db push
npx prisma generate
```

Full Atlas checklist: `docs/ATLAS_SEED.md`.
