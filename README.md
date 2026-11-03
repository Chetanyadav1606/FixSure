# FixSure

Computer parts, components and repair services platform (Mumbai / Navi Mumbai / Thane). Next.js 16 · TypeScript · Tailwind v4 · Supabase (schema ready, not yet wired).

**Status:** storefront + Smart Finder run on sample data. Auth, checkout, payments, repair booking, B2B and admin are not built yet — see [PROJECT_STATUS.md](PROJECT_STATUS.md).

## Run locally
```bash
npm install
npm run dev          # http://localhost:3000
npm test             # unit tests (Vitest)
npm run typecheck && npm run lint
npm run build && npm start
```
Copy `.env.example` to `.env.local` and fill in values as features come online. Never commit `.env*`.

## Layout
- `src/app` routes · `src/components` UI · `src/lib` business logic (`pricing`, `compat`, `catalog`)
- `supabase/migrations` schema + RLS (apply with the Supabase CLI once a project exists)
- `public/brand` logo assets · [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md)

## Before launch (owner actions)
Replace sample catalogue with real stock · verify phone/WhatsApp in `src/lib/site.ts` · review policies with a professional · confirm GST rates/invoice format with a CA · create Supabase, Razorpay, Shiprocket, Resend accounts. Deployment docs will be added in Phase 12.

## Deploy (Netlify)
`netlify.toml` sets the build command. Steps: push to GitHub → Netlify "Import project" → set env vars from `.env.example` → deploy → add custom domain (HTTPS is automatic) → run smoke tests (home, /shop, /finder, a product page, /sitemap.xml). Next.js 16 support on Netlify's adapter has not been verified by a deploy yet. See [Netlify's Next.js docs](https://docs.netlify.com/integrations/frameworks/next-js). Database setup, Razorpay/Shiprocket/Resend configuration are not yet implemented.
