/**
 * Business details. Everything here is configuration — override via env vars or (Phase 9) the
 * admin Store Settings screen. Values marked VERIFY come from the owner's marketing poster and
 * should be confirmed before launch.
 */
export const site = {
  name: "FixSure",
  tagline: "Your Reliable Fix",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fixsure.in",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "9152613559", // VERIFY
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919152613559", // VERIFY (country code, no +)
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "", // set before launch; hidden in UI when empty
  instagram: "fixsure.india", // VERIFY
  serviceAreas: ["Mumbai", "Navi Mumbai", "Thane"],
  currency: "INR",
  timezone: "Asia/Kolkata",
  locale: "en-IN",
  /** Owner toggles. Nothing is advertised as available unless switched on. */
  features: {
    doorstepRepair: false,
    onlineCheckout: false, // enabled once Razorpay + shipping are configured (Phase 6)
    cod: false,
    wholesalePortal: false, // enabled once B2B backend ships (Phase 8)
  },
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const navCategories = [
  { label: "Laptop Parts", href: "/shop?device=laptop" },
  { label: "Desktop Components", href: "/shop?device=desktop" },
  { label: "Mobile Parts", href: "/shop?device=mobile" },
  { label: "Accessories", href: "/shop?device=accessory" },
] as const;
