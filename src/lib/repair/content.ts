/**
 * Repair landing — editable business content in ONE place.
 *
 * Every claim-type field is empty/null by default. A section or badge that depends on it is
 * HIDDEN until you fill it with something true and verifiable. Never put invented numbers,
 * reviews, investors or press here.
 *
 * Images: put files in /public/images/repair/ and set the path (e.g. "/images/repair/hero.webp").
 * While a path is null, the built-in original illustration is shown instead.
 */
export type Testimonial = { name: string; repair: string; text: string; rating: 1 | 2 | 3 | 4 | 5; avatar?: string; source: string };
export type PressItem = { headline: string; outlet: string; url: string };
export type Backer = { name: string; logo: string };

export const repairContent = {
  /** Thin strip above the hero. Only state offers you actually provide (e.g. EMI only if your payment gateway supports it). */
  promo: "Doorstep mobile repair across Mumbai. Upfront quote before any work.",
  /** e.g. "in 30 minutes" — only if you consistently meet it. null = show the brand tagline. */
  speedClaim: null as string | null,
  hero: {
    line1: "MOBILE REPAIR AT YOUR",
    highlight: "DOORSTEP",
    sub: "Trusted technicians. Genuine quality parts. Repair done in front of you, anywhere in Mumbai.",
    image: null as string | null, // "/images/repair/hero-technician.webp"
    imageAlt: "FixSure technician repairing a phone at a customer's home",
    /** TODO(owner): keep only chips you can stand behind. */
    chips: ["Verified technicians", "Quality parts", "Repair warranty", "Transparent pricing"],
  },
  /** TRUST • REPAIR • SOLVE pillars. TODO(owner): confirm "background-checked" and "free diagnosis" are true. */
  pillars: [
    { k: "TRUST", t: "Verified team", d: "Verified, background-checked technicians." },
    { k: "REPAIR", t: "At your doorstep", d: "Repaired at your home or office, in front of you." },
    { k: "SOLVE", t: "Clear answers", d: "Free diagnosis and an upfront quote before any work." },
  ],
  /** Investor / partner logos. Empty = "Backed by" row hidden. */
  backers: [] as Backer[],
  /** e.g. { score: "4.8", label: "rated on Google" } — only from a real, linkable source. */
  rating: null as { score: string; label: string; url: string } | null,
  /** Real reviews only, with where they came from (e.g. "Google review"). Empty = honest empty state. */
  testimonials: [] as Testimonial[],
  /** Real press coverage. Empty = "In the news" hidden. */
  press: [] as PressItem[],
  spotlightImages: {
    "screen-replacement": null as string | null, // "/images/repair/spotlight-screen.webp"
    "battery-replacement": null as string | null,
    "back-glass-replacement": null as string | null,
  },
  /** FAQ accordion + FAQPage schema. */
  faqs: [
    ["Is doorstep phone repair safe?", "Doorstep visits only happen against a booking you made and in areas we serve. We contact you to confirm before a technician is sent."],
    ["What if the problem is different from what I booked?", "We diagnose first and send a revised quotation. Nothing extra is done without your approval."],
    ["What parts do you use for repairs?", "Each quotation states whether a part is genuine, OEM or compatible, so you decide with full information."],
    ["How long does a repair take?", "It depends on the fault and part availability. We confirm the time with your quotation rather than promising a fixed duration."],
    ["Is my data safe during the repair?", "We only access what a repair needs and don’t ask for passwords unless diagnosis genuinely requires it. Please back up first; some repairs need a reset."],
    ["What does the warranty cover?", "Terms are stated on your quotation. Damage unrelated to the repaired part is typically excluded."],
  ] as [string, string][],
  footerLine: "Doorstep mobile repair you can trust",
};
