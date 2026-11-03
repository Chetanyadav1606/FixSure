# Reference Analysis — Instafix (withinstafix.com)

**Method and limits (updated 2026-11-03).** Two pages were fetched as extracted text: `https://www.withinstafix.com/` and `https://booking.withinstafix.com`. I could **not** see rendered visuals, colours, typography, spacing, section heights, animation or mobile layout. The booking app is rendered client-side, so its brand/series/model lists, issue selection, PIN/location step, slots and per-repair prices were **not visible**. Nothing below about those is claimed. Visual and booking-flow fidelity needs screenshots or a screen recording from the owner.

## Homepage order (from text, in sequence)
1. Header: logo, location selector (Gurgaon), Home / About Us / Track Repair / Contact Us, "Book now". EMI note under header.
2. Hero: "Doorstep device repair in minutes", technician-at-home image, one "Book now" CTA, "Backed by" investor logos.
3. "What can we fix for you?": brand logos (Nothing, Motorola, Google, Samsung, Apple, OnePlus) and device tabs Phone / MacBook / iPad.
4. Three price-anchor cards: Screen guard (from ₹299), Phone repairs (from ₹999), Doorstep diagnostics (₹199).
5. "Our Promise": warranty up to 1 year, trained technicians, quality parts.
6. "Services in the spotlight": four service cards, each with "Book now".
7. Customer reviews carousel (named reviewers, star ratings, "4.8+ rated").
8. "How do we work?": six steps (book, technician collects parts, doorstep service, quality check before, repair, quality check after).
9. Warranty band: "Up to 12 months", "Claim warranty" via WhatsApp.
10. "For curious minds": four expandable topics (genuine parts, warranty exclusions, quality, home vs in-store).
11. "Got a question?" contact CTA.
12. "In the news" (funding article).
13. FAQ accordion (safety, different problem on arrival, parts, duration, data safety, warranty).
14. Footer: socials, two addresses, Services / Company / Support columns, legal entity, bottom bar Home / Phone / Laptop / iPad.

## Booking (what is known)
Device tabs Phone / MacBook / iPad, then Select Brand → Select Series → Select Model, each with "View all". Headline fee "schedule a technician visit at just ₹199". Booking and tracking live on a separate subdomain. Everything after model selection is unknown to me.

## FixSure vs reference (structure only)
| Reference element | FixSure `/repair` today |
|---|---|
| Single dominant "Book now" CTA, repeated | Present (hero, sticky bar, final CTA) |
| Device tabs + brand logos | Brand/model picker inside wizard; no tabbed device strip on the home page |
| Price-anchor cards | Present only when the owner enters real prices; else "Quote after diagnosis" |
| "How do we work" steps | Present (5 steps) |
| Warranty band + claim path | Not built (policy is a draft; terms not set by owner) |
| FAQ accordion on the service page | FAQ exists at `/faq`, not embedded on `/repair` |
| Track Repair in header | Present at `/repair/track` |
| Location selector in header | Not built |
| Reviews carousel, "4.8+ rating", investor/press strips | **Deliberately not copied** — no real data exists |
| Separate booking subdomain | FixSure keeps booking on-site |

## Not copied, on purpose
Investor logos, press coverage, star-rating claims, named testimonials, "30 minutes" and "12 months" promises, and the reference's copy and imagery. FixSure can show these only when they are true for FixSure.

## Needed from the owner to go further
Screenshots or a screen recording of: the homepage (desktop and phone), the full booking flow step by step, the track-order page, and a service detail page. With those I can match spacing, density and interactions honestly, then compare side by side.

---
## Addendum — rendered inspection (2026-11-03)
Playwright (Chromium) rendered the reference at 1440px and 390px and its booking app, so visuals were seen directly. Observed: DM Sans headings + Figtree body; white sticky header (logo, "30 Minutes ⚡" + city menu, 4 links, filled "Book now"); mint notice strip; light-grey hero with a photo, italic uppercase headline and one CTA, a "Backed by" tab at its base; brand-logo strip beside "What can we fix for you?"; curved-corner Phone/MacBook/iPad tabs with "NEW" badges; lavender price cards; three photo "spotlight" cards with black Book-now pills; deep-purple "Our Promise" banner with gold lettering; review photo carousel; step-illustration carousel; purple warranty banner with shield; four deep-blue "curious minds" flip cards; lavender "Got a question?" panel with telephone art; "In the news"; FAQ accordion (open = white bordered, closed = grey); indigo footer with plants/sofa art; mobile: compact header with city, bottom tab bar (Home/Phone/Laptop/iPad).
Booking app: Step 1/3 device (search, promo banner, tabs, Select Brand cards, Select Series pills, Select Model cards, sticky gradient "Step 1/3 · Select Issue in next step" bar) → Step 2/3 issues (search, category chips, cards with image and "Add") → Step 3/3 NOT reached (not captured).
## What FixSure now mirrors
Same section order, header, tabs, price trio, spotlight row, promise banner, steps carousel, warranty banner, flip cards, question panel, FAQ accordion, footer and mobile tab bar; booking Steps 1–2 follow the reference layout; Step 3 reuses FixSure's own details wizard (address, time, review) because the reference's was not observed.
## Deliberate differences
Palette = FixSure navy/electric blue/gold (not indigo/mint). Original vector illustrations instead of the reference's photos. No investor strip, press, ratings, named reviews or "30 minutes"/"12 months" claims. Reviews carousel replaced by an honest empty state. Laptop/Tablet tabs = WhatsApp enquiry (only phones book online).
