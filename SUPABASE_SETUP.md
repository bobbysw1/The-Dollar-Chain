# Connecting The Dollar Chain to Supabase

This is the database that remembers your members, votes, submissions and logins.
You don't need any coding skill — it's copy, paste, and click. About 10 minutes.

Right now the app saves data to files on the computer it runs on. That's fine for
testing, but it won't work on a real website host. Supabase is a free, proper
database. Once you connect it, **nothing else in the app needs to change** — it
switches over automatically the moment you add the two keys below.

---

## Step 1 — Make a Supabase account & project

1. Go to **https://supabase.com** and click **Start your project** (sign in with
   GitHub or email — both free).
2. Click **New project**.
3. Give it a name (e.g. `dollar-chain`), choose a **database password** (save it
   somewhere — you won't need it day to day, but don't lose it), and pick the
   region **Sydney (ap-southeast-2)** so it's fast in Australia.
4. Click **Create new project** and wait ~2 minutes while it sets up.

## Step 2 — Create the table

1. In the left sidebar of your Supabase project, click **SQL Editor**.
2. Click **New query**.
3. Open the file **`supabase/schema.sql`** from this project, copy *everything*
   in it, and paste it into the box.
4. Click **Run** (bottom right). You should see **Success. No rows returned.**

That's the whole database created. There's just one table — the app handles the
rest.

## Step 3 — Copy your two keys

1. In the left sidebar, click **Project Settings** (the gear), then **API**.
2. You'll see:
   - **Project URL** — looks like `https://abcdwxyz.supabase.co`
   - **Project API keys** → **`service_role`** key (click **Reveal**, then copy).
     ⚠️ This is the *secret* one. Never put it in the browser or share it. It only
     ever lives on the server.

## Step 4 — Add the keys to the app

### If you're running it locally (on your own computer)
1. In the project folder, find the file **`.env.local`** (if it doesn't exist,
   copy `.env.local.example` and rename the copy to `.env.local`).
2. Add these two lines, pasting your values after the `=`:

   ```
   SUPABASE_URL=https://abcdwxyz.supabase.co
   SUPABASE_SERVICE_KEY=eyJ...your service_role key...
   ```
3. Save the file and restart the app (`npm run dev`).

### If you're hosting on Vercel (the live website)
1. In your Vercel project, go to **Settings → Environment Variables**.
2. Add two variables:
   - Name `SUPABASE_URL`, value = your Project URL
   - Name `SUPABASE_SERVICE_KEY`, value = your service_role key
3. Click **Save**, then **redeploy** (Deployments → ⋯ → Redeploy).

## Step 5 — Check it worked

- Open the site and visit **/chain**. You should see the founder, **#1**.
- Join with a test $1 (it'll simulate if Stripe isn't connected yet), then in
  Supabase go to **Table Editor → kv**. You'll see rows appear like
  `members.json`, `votes.json`, etc. — that's your data, now living in Supabase. ✅

---

## What's stored where

The app keeps everything in one table called **`kv`** (key + value). Each row is
one part of the system:

| Row key            | What it holds                                    |
|--------------------|--------------------------------------------------|
| `members.json`     | Everyone in the chain: number, email, password (hashed), figure, plan, suburb, allocations, referrals |
| `votes.json`       | This week's vote tally                            |
| `credits.json`     | Each member's vote credits                        |
| `suggestions.json` | Causes members have submitted                     |

You don't need to touch these — the app reads and writes them. But it means
**everything is in one place** and easy to back up (Supabase does daily backups
on every plan).

## Is it secure?

Yes. The `kv` table has **Row Level Security on with no public policies**, which
means the public/anon key can't read or write it at all. Only the server, using
the secret `service_role` key, can touch it — and that key never goes near a
browser. Passwords are stored **hashed** (scrypt), never in plain text.

## Costs

Supabase's **free tier** is plenty to start: 500MB database, 50,000 monthly
active users, daily backups. You won't pay anything until you're well past
launch. If you outgrow it, the next tier is ~US$25/month.

## A note on scale (for later)

The app uses a simple in-memory lock to avoid two writes colliding. On a single
server or Vercel's default setup that's fine for a community fund's volume. If
you ever reach very high concurrent traffic, a developer can move the hottest
data (votes, credits) into proper Postgres rows with database-level locking —
but that's a good-problem-to-have, not a launch blocker.
