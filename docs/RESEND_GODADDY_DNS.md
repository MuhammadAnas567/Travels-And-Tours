# GoDaddy DNS — copy/paste for Resend (`arreat.travel`)

Region: **Tokyo (ap-northeast-1)**  
Do **not** delete existing `A` / `www` / NS records.

Open Resend → Domains → `arreat.travel` → **Records** and keep that tab beside GoDaddy.

---

## Record 1 — MX (SPF mail)

| GoDaddy field | Paste this |
|---------------|------------|
| **Type** | `MX` |
| **Name** | `send` |
| **Value** | `feedback-smtp.ap-northeast-1.amazonses.com` |
| **Priority** | `10` (if GoDaddy asks) |
| **TTL** | `1/2 Hour` |

---

## Record 2 — TXT (SPF)

| GoDaddy field | Paste this |
|---------------|------------|
| **Type** | `TXT` |
| **Name** | `send` |
| **Value** | `v=spf1 include:amazonses.com ~all` |
| **TTL** | `1/2 Hour` |

---

## Record 3 — TXT (DKIM) — UNIQUE (must copy from Resend)

| GoDaddy field | Paste this |
|---------------|------------|
| **Type** | `TXT` |
| **Name** | `resend._domainkey` |
| **Value** | *(from Resend Records row “DKIM” — starts with `p=MIGf...` or similar. Copy the full value.)* |
| **TTL** | `1/2 Hour` |

Resend Records row looks like:
- Type: `TXT`
- Name/Host: `resend._domainkey`
- Value: long `p=...` string ← **copy that entire string into GoDaddy Value**

---

## Optional — Tracking CNAME (only if Resend shows it)

| GoDaddy field | Paste this |
|---------------|------------|
| **Type** | `CNAME` |
| **Name** | `links` *(or whatever Name Resend shows, without `.arreat.travel`)* |
| **Value** | *(exact target from Resend, e.g. `links1.resend-dns.com`)* |
| **TTL** | `1/2 Hour` |

Skip if Resend does not list a Tracking row.

---

## After Save

1. Wait 10–30 minutes  
2. Resend → **Restart verification**  
3. When status is **Verified**, keep:

```env
RESEND_FROM_EMAIL=noreply@arreat.travel
```

4. Restart `npm run dev` / redeploy Vercel  

Until verified, OTP still only works to **arreattravel@gmail.com**.
