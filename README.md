# The Dollar Chain

$1 a week. Your number. Real change. (AUD, Australia-based.)

## Running locally

```bash
npm install
cp .env.local.example .env.local   # fill in once you have Stripe keys
npm run dev
```

Open http://localhost:3000.

## Stripe integration

The app is wired end-to-end for Stripe — but it works fine without it
(checkout will return a friendly error, and you can use the dev-login
shortcut on the Impact page to test voting).

### Once you have keys

1. In the Stripe dashboard create two **recurring** prices:
   - $1 AUD / week → copy the price ID into `STRIPE_PRICE_WEEKLY`
   - $1 AUD / month → copy into `STRIPE_PRICE_MONTHLY`
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Set `SESSION_SECRET` to a long random string.
4. Run the Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

It prints a `whsec_...` value — put that in `STRIPE_WEBHOOK_SECRET`.

### What happens on payment

- `POST /api/checkout` → creates a Stripe Checkout subscription session
- User pays → Stripe redirects to `/api/checkout/success`, which:
  - Creates/updates the member record
  - Sets a signed session cookie
  - Redirects to `/join/welcome`
- Asynchronously, Stripe fires `invoice.payment_succeeded` → our webhook
  grants **1 vote credit** to that member (idempotent on event ID)
- Stripe presentment currency is **AUD** — all amounts displayed as `$`
- Credits reset at the end of each weekly voting cycle

## Voting

- All votes are gated on a server cookie and a positive credit balance
- Category vote: 1 credit, 1 vote per member per week
- Suggestion upvote: 1 credit per suggestion (one per member per suggestion)
- Anyone can read the Impact page; only members can vote/suggest

## Dev-only shortcuts

When `NODE_ENV !== "production"`:
- `POST /api/auth/dev-login` `{ memberNumber, credits }` sets a cookie and
  grants synthetic credits, so you can test voting without Stripe
- The Impact sidebar shows a "Dev: log in as #..." input

## Data storage

All server state lives in JSON files under `./data/` (gitignored):
- `members.json` — member records, indexed by number, email, customer ID
- `credits.json` — current week's credit balances + processed event IDs
- `votes.json` — current week's category vote counts + voters
- `suggestions.json` — member-suggested issues + voters

This is fine for local dev / a single VPS. For Vercel or any
multi-instance deploy, swap `lib/store.ts` for Postgres/Redis/KV.
