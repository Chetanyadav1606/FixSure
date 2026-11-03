/**
 * Business details. Everything here is configuration — override via env vars or (Phase 9) the
 * admin Store Settings screen. Values marked VERIFY come from the owner's marketing poster and
 * should be confirmed before launch.
 */
export const site = {
  name: "FixSure",
  tagline: "Your Reliable Fix",
  badge: "PROFESSOR",
  motto: "TRUST • REPAIR • SOLVE",
  contactName: "Vishnu Khaire",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.fixsure.in",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "8655770559", // owner-supplied 2026-11-03
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "918655770559", // country code, no +
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "", // set before launch; hidden in UI when empty
  instagram: "fixsure.india", // VERIFY
  /** Default WhatsApp booking message. */
  whatsappBookingText: "Hi FixSure, I want to book a doorstep mobile repair",
  /** Swappable logo. Set iconSrc to a transparent PNG/SVG (e.g. "/images/logo-icon.png") to replace the drawn shield. */
  logo: { iconSrc: null as string | null, iconAlt: "FixSure shield" },
  serviceAreas: ["Mumbai", "Navi Mumbai", "Thane"],
  /** Warranty months on repairs. null until the owner sets real terms; UI then says terms are on the quotation. */
  repairWarrantyMonths: null as number | null,
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

export const whatsappLink = (text: string = site.whatsappBookingText) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
export const telLink = `tel:+91${site.phone}`;

export const navCategories = [
  { label: "Laptop Parts", href: "/shop?device=laptop" },
  { label: "Desktop Components", href: "/shop?device=desktop" },
  { label: "Mobile Parts", href: "/shop?device=mobile" },
  { label: "Accessories", href: "/shop?device=accessory" },
] as const;
