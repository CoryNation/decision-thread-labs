# Decision Thread Labs (MVP)

Next.js App Router + Tailwind + Supabase (Auth/RLS) + React Flow canvas.

## Quick start

1. **Clone & install**
   ```bash
   npm install
   ```

2. **Supabase**
   - Create a project on Supabase
   - Set Google OAuth credentials in Auth > Providers
   - Run SQL in `supabase/migrations/001_init.sql` then `002_policies.sql`
   - Create a service role key and anon key

3. **Env vars** (create `.env.local`):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE=your-service-role-key
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Dev**
   ```bash
   npm run dev
   ```

5. **Deploy**
   - Push to GitHub, connect to Vercel, set env vars, deploy.

## Notes
- Canvas uses React Flow. Decisions persist to Supabase per project.
- Exports: CSV (API route) and PDF (experimental—renders SVG to PDF).
