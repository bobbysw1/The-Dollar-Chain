# Putting The Dollar Chain on the internet (Vercel)

Right now the site only runs on your computer. Vercel makes it a real, public
website — free to start. About 15 minutes. You don't need to know any code.

---

## Step 1 — Make a Vercel account
1. Go to **https://vercel.com/signup**
2. Sign up with your email or GitHub (either is fine, both free).

## Step 2 — Install the Vercel tool & deploy
In your project folder, in the Terminal, run these one at a time:

```
npm install -g vercel
vercel
```

When you run `vercel`, it will ask a few questions — just press **Enter** to accept
the defaults for all of them, except:
- "Set up and deploy?" → **Y**
- "Link to existing project?" → **N**
- "Project name?" → press Enter (or type `the-dollar-chain`)

It will give you a link when it's done (something like
`https://the-dollar-chain-xxxx.vercel.app`). **Copy that link.**

## Step 3 — Add your settings (environment variables)
Your secrets live in `.env.local` on your computer. Vercel needs them too.

1. Go to **vercel.com → your project → Settings → Environment Variables**.
2. Open your `.env.local` file. For **each line** in it (ignore the `#` comment
   lines), add a variable in Vercel:
   - the part before the `=` is the **Name**
   - the part after the `=` is the **Value**
3. Add all of them — Supabase, Stripe, the price IDs, SESSION_SECRET, ADMIN_PASSWORD.
4. **One change:** for `NEXT_PUBLIC_SITE_URL`, use your real Vercel link from Step 2
   (e.g. `https://the-dollar-chain-xxxx.vercel.app`), not `http://localhost:3000`.

## Step 4 — Redeploy so the settings take effect
Back in the Terminal:
```
vercel --prod
```
That publishes the live version with all your settings. Visit your link — you
should see the site, with the founder #1 in the chain. 🎉

## Step 5 — Connect your domain (dollarchain.org)
1. In Vercel: **your project → Settings → Domains**.
2. Type **`dollarchain.org`** and click **Add**. Add **`www.dollarchain.org`** too.
3. Vercel shows you DNS records to add. Go to wherever you bought the domain
   (your registrar's dashboard), find **DNS settings**, and add the records Vercel
   gives you — usually:
   - an **A record** for `@` pointing to Vercel's IP, **or** a **CNAME** for `www`
     pointing to `cname.vercel-dns.com`.
   (Vercel spells out the exact values — just copy them across.)
4. Wait a few minutes (sometimes up to an hour) for it to verify. Vercel shows a
   green tick when it's live.
5. **Important:** once the domain works, go back to **Environment Variables** and
   set `NEXT_PUBLIC_SITE_URL` to **`https://dollarchain.org`**, then `vercel --prod`
   once more. (This makes Stripe send people back to the right place.)

Then tell me the domain is live and I'll register the Stripe webhook against
`https://dollarchain.org` to finish the loop.

---

## Step 5 — The Stripe webhook (I'll do this for you)
Once you have your live link, **tell me the URL** and I'll:
- register the Stripe webhook against it (so payments automatically update members),
- give you the one extra setting (`STRIPE_WEBHOOK_SECRET`) to paste into Vercel,
- and you redeploy one last time.

After that, the whole loop works: someone pays $1 → they're in the chain → their
contribution is tracked → if they stop, they become the latest link. All live.

---

## Later: going from test money to real money
You're currently in Stripe **test mode** (no real charges). When you're ready for
real payments:
1. In Stripe, flip to **live mode** and get your live keys (`sk_live_…`, `pk_live_…`).
2. Tell me — I'll recreate the 6 plans (×2 = 12 prices) in live mode, same as before.
3. Swap the keys in Vercel, redeploy. Done.

Don't do this until your legal/banking setup (the incorporated association + bank
account) is sorted — test mode is perfect for everything up to that point.
