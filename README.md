# Decision Thread Labs (MVP)

Next.js + Tailwind + Supabase + React Flow.

## Deploy (no local required)
1) Upload these files to the **repo root** (package.json must be at top level).
2) In **Vercel → Settings → General → Root Directory** = `/` (repo root). Redeploy with cache cleared.
3) In **Vercel → Settings → Environment Variables** add:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE
4) In **Supabase → SQL Editor** run:
   - supabase/migrations/001_init.sql
   - supabase/migrations/002_policies.sql
5) In **Supabase → Authentication**: enable Email + Google, set Site URL to your Vercel URL.
6) Visit `/auth` to sign in, then create org/membership via SQL (see instructions in chat).

## Local dev (optional)
- Create `.env.local` with the three vars above.
- `npm install`, `npm run dev`.
