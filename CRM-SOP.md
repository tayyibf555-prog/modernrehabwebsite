# Clinic CRM — Standard Operating Procedure

Recipe for spinning up the admin / backend for any clinic-style client (chronic pain, physio, sports therapy, chiropractic, dental, vet, etc.). The pattern is identical across clients — only the brand, services, and integrations change.

This SOP describes the **canonical stack** and the **standard surfaces**, plus the exact steps to go from a public marketing site to a working admin/CRM. If a client doesn't need a feature here, skip it; if they need something not here, add it and **update this SOP**.

---

## Decision tree (5 minutes, before any code)

Before starting, answer these:

| Question | Default answer | When to deviate |
|---|---|---|
| Who logs in? | One owner | Multi-staff → swap shared password for Clerk / Stack Auth |
| Is booking real? | Mock + manual entry | Real client traffic → wire public booking form to server action |
| Where does data live? | JSON store locally → Neon Postgres in production | High volume / payments → Neon Postgres from day 1 |
| Where do payments happen? | On the day, manual | Stripe → install Stripe Marketplace integration |
| What gets emailed? | Confirmation only | Reminders, follow-ups → Resend + cron |
| Hosting? | Vercel | Always Vercel for this stack |

Write the answers in the project's `PRODUCT.md`. They drive every subsequent decision.

---

## Canonical stack

| Layer | Tool | Why |
|---|---|---|
| Framework | Next.js 16 App Router | Stack default; SSR + RSC for admin pages |
| DB (production) | **Neon Postgres** via Vercel Marketplace | Serverless Postgres, auto-provisioned env vars, free tier |
| DB (local dev) | JSON file at `data/store.json` | Zero install for clients; swap to Postgres URL by changing one adapter |
| ORM | **Drizzle ORM** | Type-safe, lightweight, schema-in-code, plays well with Neon serverless |
| Auth | Single env-var password + HMAC-signed cookie | One owner = no need for a service. Upgrade to Clerk only when staff > 1 |
| Email | **Resend** via Vercel Marketplace | Booking confirmations, reminders |
| Payments | **Stripe** via Vercel Marketplace | When required; not required for "pay on the day" clinics |
| Hosting | **Vercel** | One deploy, env vars auto-provisioned by Marketplace integrations |

Don't deviate without a written reason in the client's `PRODUCT.md`.

---

## Standard schema

Every clinic gets these four tables. Field names are stable across projects so we can reuse queries.

### `services`
| field | type | notes |
|---|---|---|
| `id` | text PK | slug e.g. `pain-strategy` |
| `name` | text | display name |
| `price` | int (pence) | new-client price |
| `returning_price` | int nullable | null = new clients only |
| `duration_min` | int | minutes |
| `tag` | text | "First visit", "Most popular", etc. |
| `description` | text | shown on public site + admin |
| `position` | int | sort order |

### `clients`
| field | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `full_name` | text | |
| `email` | text indexed | normalised lowercase |
| `phone` | text indexed | E.164 ideally, normalised for matching |
| `first_seen_at` | timestamptz | created_at |
| `last_seen_at` | timestamptz | last booking date |
| `is_returning` | bool | derived from booking count, cached for speed |
| `notes` | text | private clinical notes |
| `tags` | text[] | "ironman", "post-surgery", "insurance" |

### `bookings`
| field | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `client_id` | uuid FK → clients | |
| `service_id` | text FK → services | |
| `scheduled_at` | timestamptz | exact slot start |
| `slot` | text | "08:00", "14:30" — cached for display |
| `status` | enum | `booked` \| `attended` \| `cancelled` \| `no-show` |
| `price_paid` | int (pence) | effective price (returning discount applied) |
| `notes` | text | per-session notes |
| `presenting_complaint` | text | optional, from booking form |
| `created_at` | timestamptz | |
| `cancelled_at` | timestamptz nullable | |

### `sessions` (optional v2 — visit notes log)
| field | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `booking_id` | uuid FK → bookings | |
| `attended_at` | timestamptz | |
| `clinical_notes` | text | SOAP-style notes |
| `homework` | text | what client should do between sessions |

Only ship `sessions` for clients who'll actually use it. Many practitioners keep paper notes in v1.

---

## Standard surfaces

Every clinic admin gets these pages. Pattern is identical; only the styling matches the brand.

```
/admin/login         password gate
/admin               overview — today, this week, recent
/admin/bookings      list + filter (upcoming / past / all / by status)
/admin/clients       list + search
/admin/clients/[id]  detail — booking history, notes, contact
/admin/services      service catalog (price changes, new services)
```

What each page must contain:

- **Overview** — today's bookings (sortable by time), this week's revenue, recent activity feed (last 10 events). One CTA: "View all bookings".
- **Bookings list** — table with: date, time, client name, service, status, price. Filters: upcoming / past / all, status. Row click → expand to show notes + mark attended/cancelled/no-show.
- **Clients list** — searchable by name/email/phone. Columns: name, email, last visit, total visits, returning? Click → detail.
- **Client detail** — header with contact, then booking history table, notes panel (free text), tag chips. Quick action: "Book a session for this client".
- **Services** — read+edit price/duration/description. Position drag-and-drop optional.

Keep the surfaces dense — practitioners scan, they don't read. Bias to tables over cards. **Restrained** color strategy: brand orange used only for the active CTA, the status pill, and the "returning client" badge.

---

## File layout

Place admin under `/app/admin/**` in the same Next.js app as the public site. Sharing the codebase means one deploy, one set of env vars, one design system.

```
impeccable/
├── data/
│   └── store.json              ← local dev store (gitignored in prod)
├── lib/
│   ├── store.ts                ← storage adapter (swap JSON ↔ Postgres here)
│   ├── auth.ts                 ← password check + cookie helpers
│   └── seed.ts                 ← seed data + helpers
├── middleware.ts               ← /admin/** auth gate
├── app/
│   ├── admin/
│   │   ├── layout.tsx          ← sidebar shell
│   │   ├── page.tsx            ← overview
│   │   ├── admin.css           ← admin-only styles (dense, table-first)
│   │   ├── login/page.tsx      ← password form
│   │   ├── actions.ts          ← server actions (mutations)
│   │   ├── bookings/page.tsx
│   │   ├── clients/page.tsx
│   │   └── clients/[id]/page.tsx
```

The public marketing site stays in `app/page.tsx`, `app/layout.tsx` etc. Nothing in `/admin` should leak into the public render path.

---

## Step-by-step recipe for a new client

### 1. Brand the public site (separate task)
Follow the impeccable workflow. Skip if already done.

### 2. Add the storage adapter (15 min)
Copy `lib/store.ts` from the reference implementation. Edit the seed file with the client's services (from their `PRODUCT.md`). For local dev, the JSON store is enough.

### 3. Add auth (5 min)
Add to `.env.local`:
```
ADMIN_PASSWORD=<set by owner — 12+ chars>
ADMIN_COOKIE_SECRET=<32+ random hex bytes>
```

Copy `lib/auth.ts` and `middleware.ts` from the reference implementation. Confirm `/admin` 302s to `/admin/login` when no cookie.

### 4. Add the admin surfaces (60–90 min)
Copy the `app/admin/**` directory. Wire each page to the storage adapter. Swap colors and brand to match the client.

### 5. Seed mock data for the owner walkthrough (10 min)
Seed 12–20 mock clients and 30–50 bookings spanning past 4 weeks + next 4 weeks. Realistic names, realistic intervals. The owner needs to see "what this looks like in 3 months" before they go live.

### 6. Provision the production database (15 min)
Once approved by the owner:

```bash
# In the project root
vercel link
vercel integration add neon
vercel env pull .env.local
```

The Neon integration auto-provisions `DATABASE_URL` and adds it to all environments. Pull locally for dev parity.

### 7. Swap the storage adapter (30 min)
Replace `lib/store.ts` JSON implementation with Drizzle + Neon. Schema definitions live in `lib/schema.ts`. Run `drizzle-kit push` to create tables.

### 8. Wire the public booking form to the database (30 min)
Public site's "Confirm booking" button calls a server action that inserts into `bookings`. Returning-client login looks up `clients` by email/phone. Use rate-limiting at the edge for the booking endpoint (basic IP throttling is enough for this scale).

### 9. Add `ADMIN_PASSWORD` and `ADMIN_COOKIE_SECRET` to Vercel envs
```bash
vercel env add ADMIN_PASSWORD production
vercel env add ADMIN_COOKIE_SECRET production
```

Use a password manager — never the owner's main password.

### 10. Deploy
```bash
git push origin main
```

Verify on the preview URL before promoting to production.

---

## Auth choices, summarised

| Owner staff size | Auth approach | Time to implement |
|---|---|---|
| 1 (just the owner) | Shared `ADMIN_PASSWORD` + signed cookie | 5 min |
| 2–5 (small team) | Clerk via Vercel Marketplace, organisations off | 20 min |
| 6+ or multi-clinic | Clerk + role-based middleware | 1 hour |

Don't over-build. A single-practitioner clinic does not need OAuth, MFA, or per-staff permissions. If the owner runs alone, give them one password.

---

## Things that will bite you on every project

These come up across clients. Build them into the SOP.

- **Timezone.** Owners enter "10:30" mentally as their local time. Store as UTC, render in `Europe/London` (or the clinic's TZ). Misalign once and every booking is wrong for an hour.
- **Phone normalisation.** People type `07700 900 000`, `+447700900000`, `(0)7700 900000`. Strip everything except digits + leading `+` before comparing. The reference `lib/auth.ts` includes a normaliser.
- **Cancellation policy.** Owners always want a "no-show vs cancelled" distinction for revenue accounting. Wire both states.
- **Returning-client pricing.** Cache `is_returning` on the client row; recompute on booking insert. Computing it from booking count on every page load gets slow with history.
- **Notes are private.** They contain clinical info. NEVER expose notes in any public-facing API response. The booking confirmation email only shows scheduled time + address, never notes.
- **Owner sees revenue, no one else.** If you add staff accounts in v2, gate the revenue figures behind owner-role.
- **Soft delete.** Cancelled bookings stay in the table with `status='cancelled'`. Never hard-delete — owners want history.

---

## What this SOP intentionally excludes

- **No chat.** Practitioners don't have time. Email + WhatsApp covers it.
- **No analytics dashboard beyond simple counts.** Owners want "how many sessions this week" not Google-Analytics-style charts. Resist scope creep.
- **No automated marketing.** Owners don't want to email past clients without thought. Keep manual.
- **No public booking confirmations rendered in admin.** Confirmation emails go through Resend; the admin shows the booking state, not the email log.

Add a feature only when a client asks for it twice. Then update this SOP.

---

## Reference implementation

The current `impeccable/` project IS the reference implementation. When starting a new client, copy:

- `CRM-SOP.md` (this file)
- `lib/store.ts`, `lib/auth.ts`, `lib/seed.ts`
- `middleware.ts`
- `app/admin/**`

Then brand and re-seed. Estimated total time from clone-to-shipped admin: **3–4 hours** per client.
