# FixSure — Project Status
_Last updated: 2026-11-03_

## Mobile repair redesign (2026-11-03)
- `/repair`: new hero (custom SVG phone, draggable cracked/repaired compare), service grid (common vs advanced, prices/durations only if configured), 7-step booking wizard, 5-step journey, trust/privacy, pricing table, reviews component (renders **only real** reviews; no data source wired yet, always empty), sticky mobile CTA. `/repair/track`: ticket + phone/tracking-key lookup, real history timeline, quote approve/decline.
- Backend: `0003_repair_booking.sql` — service areas, appointment slots, `create_repair_booking` (area check, slot row-lock, photo-path validation, atomic), `track_repair`, `decide_repair_quote`. Server actions in `src/app/repair/actions.ts`, photo upload route `/api/repair/upload` (magic-byte check, 5 MB, 3 files, rate limited).
- **Honest unconfigured mode:** without Supabase env vars, the wizard ends in a WhatsApp handoff (no ticket, no fake success), tracking says it is off, no prices/areas/slots are advertised. Verified by Playwright.
- Not verified against real Supabase: the `rpc` calls, catalogue reads and storage upload (SQL logic itself is tested on PGlite). Rate limiting is per server instance.
- **Admin:** no admin UI exists yet. Brands/models/services/prices/areas/slots/technicians/quotes must be managed via SQL (`supabase/seed/repair_services.sql` has instructions) until the Control Center is built. Technician assignment, quote creation, parts used and completion have schema but no screens.
- Repair-review data source (reviews table is product-only) and technician "en route" status are not implemented.
- Owner commitments the copy implies (confirm you can honour): quote before work, approval recorded, parts type stated on quotation, no passwords requested.

## Current phase
Phases 1–4 done (brand, frontend foundation, storefront, Smart Finder) on a **sample-data repository**. Phase 5 partially done: SQL schema, RLS and stock functions are written but **not yet applied to any Supabase project and not yet wired into the app**. Phases 6–12 not started.

## Architecture
- Next.js 16.4 (App Router) + React 19 + TypeScript + Tailwind v4 (via scaffold's `@tailwindcss/turbopack` loader — keep it in `next.config.ts`).
- `src/lib/catalog/` — `CatalogRepository` interface; `SampleCatalogRepository` (seed) is active. Add `SupabaseCatalogRepository` and switch in `getCatalog()`.
- `src/lib/pricing.ts` — server-authoritative order math (paise ints, coupons, GST split, inclusive/exclusive). `src/lib/compat.ts` — finder logic. Both unit tested.
- `supabase/migrations/0001_schema.sql`, `0002_rls_storage.sql` — full schema from the spec, RLS, role-escalation guard, `reserve_stock/commit_stock/release_stock`, invoice numbering, storage buckets.

## Decisions
- **Hosting is Netlify** (changed from Vercel per latest brief). `netlify.toml` added; Next 16 on Netlify's adapter is unverified until a real deploy.
- Roles are the `app_role` enum on `profiles` (not a separate `roles` table).
- Palette stays as derived from the supplied logos (navy `#0B2A6F`, gold `#C8962E`); brief's `#1677E8` electric blue is not yet used and can be added as an accent.
- `cacheComponents`/`partialPrefetching` turned **off** (forces Suspense around all dynamic data; too much friction). Standard dynamic rendering used.
- Brand: shield + check emblem, navy/gold (see BRAND_GUIDELINES.md).
- Money = integer paise in code, `numeric(12,2)` in DB. Tax rate lives per product (nullable = cannot be sold); nothing hardcoded.
- Online checkout, doorstep repair, COD, wholesale portal are **off** (`site.features`); pages route to phone/WhatsApp instead of showing dead buttons.
- Owner phone/Instagram taken from the poster — marked VERIFY in `src/lib/site.ts`.
- Next 16 renames: `middleware` → `proxy.ts`; `params`/`searchParams` are Promises.

## Done
Brand SVG set + guidelines · design tokens · header/footer/layout · homepage · `/shop` (search, SKU/OEM, filters, sort, pagination) · `/product/[slug]` (specs, compatibility, JSON-LD) · `/finder` (model autocomplete, part-number lookup, 4 statuses, part-ID via WhatsApp) · `/repair`, `/wholesale`, `/about`, `/contact`, `/faq`, `/guides`, 6 draft policy pages · sitemap/robots/security headers · 404/error pages · 23 unit tests.

## NOT done (do not assume these exist)
Auth, accounts, cart, checkout, Razorpay, orders, invoices/PDF, shipping/Shiprocket, repair booking & tracking forms, B2B portal, admin Control Center, CSV import/export, email/WhatsApp notifications, reviews, wishlist, comparison, recently viewed, real product photos, full-site Playwright journeys (only repair page covered), persistent rate limiting, general `supabase/seed.sql`, deployment docs, accessibility audit, Lighthouse run.

## Migration status
Now **executed and tested on PGlite** (WASM Postgres with stubbed `auth`/`storage` schemas): `src/db/__tests__/migrations.test.ts` — all spec tables exist, RLS isolation, role-escalation block, wholesale-price protection, oversell prevention, webhook de-dup constraint. Still **not applied to a real Supabase project**; Supabase-specific behaviour (real auth.uid(), storage, grants) remains unverified.

## Environment
Node 24, npm 11. See `.env.example`. Nothing external is configured.

## Known issues / risks
- All catalogue, price, stock and compatibility data is **sample** (`DEMO-` SKUs). Compatibility rows are unverified.
- Policies are drafts with `[Owner: …]` placeholders; need legal/CA review (GST, e-commerce rules, DPDP).
- The `playwright` Chromium is installed; no E2E specs written yet.

## Tests (last run 2026-11-02)
`npx vitest run` 69/69 pass · `npx playwright test` 10/10 pass (desktop + Pixel 7, sample mode) · `tsc --noEmit` clean · `eslint src` clean · `next build` succeeds (20 routes). Visual check of home/finder at desktop width only; mobile not yet reviewed.

## Next steps (in order)
1. Create Supabase project, apply migrations, write `seed.sql`, implement `SupabaseCatalogRepository`.
2. Auth (Supabase SSR clients, `proxy.ts` optimistic guard, server-side role checks), bootstrap-admin script.
3. Cart + server-side pricing endpoint + checkout + Razorpay (order, signature verify, idempotent webhook via `payment_webhook_events`).
4. Repair booking/tracking (token-based guest tracking) → B2B → Admin → hardening → Playwright journeys → deployment docs.
