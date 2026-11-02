import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { site, whatsappLink } from "@/lib/site";

const cols = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Laptop parts", href: "/shop?device=laptop" },
      { label: "Desktop components", href: "/shop?device=desktop" },
      { label: "Mobile parts", href: "/shop?device=mobile" },
      { label: "Accessories", href: "/shop?device=accessory" },
      { label: "Smart Finder", href: "/finder" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Repair services", href: "/repair" },
      { label: "Wholesale (B2B)", href: "/wholesale" },
      { label: "Buying guides", href: "/guides" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About FixSure", href: "/about" },
      { label: "Contact & support", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Shipping", href: "/policies/shipping" },
      { label: "Returns", href: "/policies/returns" },
      { label: "Refunds", href: "/policies/refunds" },
      { label: "Warranty", href: "/policies/warranty" },
      { label: "Privacy", href: "/policies/privacy" },
      { label: "Terms", href: "/policies/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-navy-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo dark tagline />
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
            Laptop, desktop and mobile parts, plus repair services, for {site.serviceAreas.join(", ")}.
          </p>
          <p className="mt-4 text-sm text-white/80">
            <a className="font-semibold hover:text-gold-400" href={`tel:+91${site.phone}`}>{site.phone}</a>
            {" · "}
            <a className="hover:text-gold-400" href={whatsappLink("Hi FixSure, I have an enquiry.")} rel="noopener">WhatsApp</a>
          </p>
          {site.email && <p className="mt-1 text-sm"><a className="hover:text-gold-400" href={`mailto:${site.email}`}>{site.email}</a></p>}
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gold-400">{c.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-sm text-white/75 hover:text-white">{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/60">
          © {new Date().getFullYear()} FixSure. All rights reserved. Product images are illustrative until photography is added.
        </p>
      </div>
    </footer>
  );
}
