# FixSure Brand Guidelines

## Logo evaluation (6 references reviewed)

| Reference | Verdict |
|---|---|
| Gold "Fix" + navy "Sure" wordmark with mechanic inside the "e" (flat and 3D) | Not chosen. The figure turns the "e" into an unreadable glyph ("Sur…"), reads as repair-only, and detail is lost at favicon size. |
| "FixSure Professor" (glossy, red/white broken "e") | Rejected. Extra "Professor" name, gradients/glow, red accent off-palette, illegible at small sizes. |
| Shield + handshake + orbit swoosh (logo sheet and glowing version) | **Chosen concept.** Shield = trust and protection, works for parts, repair and wholesale, navy/gold palette. The photoreal gradients and handshake detail do not scale, so the emblem was simplified. |
| Poster (phone-in-shield icon, "1000+ customers", "100% satisfaction") | Not used as a logo. Phone icon locks the brand to mobile; the claims are unverified and are not used anywhere on the site. |

## Final system

| Role | File |
|---|---|
| Primary logo (light bg) | `public/brand/logo-primary.svg` |
| Primary logo (dark bg) | `public/brand/logo-primary-dark.svg` |
| Secondary (stacked) | `public/brand/logo-secondary.svg` |
| Icon only (light / dark / mono) | `public/brand/icon.svg`, `icon-dark.svg`, `icon-mono.svg` |
| Monochrome logo | `public/brand/logo-mono.svg` |
| Favicon | `public/brand/favicon.svg` (also `src/app/icon.svg`) |
| Social avatar | `public/brand/social.svg` |

Emblem: navy shield, gold inner outline, check mark (gold short stroke + white long stroke), gold orbit swoosh. The check conveys "sure/verified" and removes the repair-only bias. The orbit and shield are kept from the supplied concept.

Notes: standalone wordmark SVGs use live text (Manrope, falling back to Segoe UI/Arial). Before print or signage, convert text to outlines in a vector editor, and consider a professional designer for a refined handshake illustration. Raster exports (PNG favicons, 180px apple icon, 1200×630 OG image) are not yet generated.

## Colour

| Token | Hex | Use |
|---|---|---|
| Navy 900 | `#0B2A6F` | Primary brand, buttons, headings |
| Navy 950 | `#061A47` | Hero, footer |
| Navy 700 | `#1B45A3` | Links, focus ring |
| Gold 500 | `#C8962E` | Accent, CTA on dark |
| Gold 600 | `#A87820` | Gold text on light (meets contrast for large text; use Navy for body copy) |
| Gold 400 | `#E0B050` | Gold on dark |
| Ink / Muted | `#101828` / `#475467` | Text |
| Canvas / Line | `#F7F8FB` / `#E2E6EE` | Backgrounds, borders |
| Success / Warning / Danger | `#067647` / `#A15C07` / `#B42318` | Status |

Defined as CSS variables in `src/app/globals.css`.

## Typography
Manrope (Google Fonts via `next/font`): 800 for headings and wordmark, 600–700 for UI, 400–500 for body. Sentence case headings; no oversized decorative headings.

## Usage rules
- Clear space: at least the height of the "F" on all sides. Minimum width: 120px (logo), 16px (favicon).
- Navy "Fix" + gold "Sure" on light; white "Fix" + light-gold "Sure" on navy.
- Do not stretch, recolour, add glow/gradients, or add trademark/certification symbols.
- Do not use the promotional poster as a logo.
- Status is never conveyed by colour alone.
