import Link from "next/link";
import { ArrowRight, Heart, Home, Laptop, Smartphone, Tablet } from "lucide-react";
import { Emblem, Logo, Wordmark } from "@/components/ui/logo";
import { CityMenu } from "@/components/repair/city-menu";
import { Plants } from "@/components/repair/art";
import { site, whatsappLink } from "@/lib/site";
import { repairContent as C } from "@/lib/repair/content";

const nav = [
  { label: "Home", href: "/repair" },
  { label: "Shop Parts", href: "/shop" },
  { label: "About Us", href: "/about" },
  { label: "Track Repair", href: "/repair/track" },
  { label: "Contact Us", href: "/contact" },
];

/** Repair-experience header: logo + tagline + service-area menu, text links, one primary CTA. */
export function RepairHeader() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1360px] items-center gap-4 px-4 py-3 md:px-10">
          <span className="flex shrink-0 flex-col"><Logo tagline={!C.speedClaim} />{C.speedClaim && <span className="ml-12 -mt-1 text-xs font-bold text-blue-500">{C.speedClaim}</span>}</span>
          <span aria-hidden="true" className="hidden h-9 w-px bg-line md:block" />
          <CityMenu className="hidden md:block" />
          <nav aria-label="Primary" className="ml-auto hidden items-center gap-8 lg:flex">
            {nav.map((n) => <Link key={n.href} href={n.href} className="text-[15px] font-medium text-muted hover:text-gold-400">{n.label}</Link>)}
          </nav>
          <Link href="/repair/book" className="ml-auto inline-flex h-11 items-center gap-1.5 whitespace-nowrap btn-gold rounded-xl px-5 text-[15px] font-extrabold transition hover:brightness-110 lg:ml-0">
            Book now <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <details className="group relative lg:hidden">
            <summary aria-label="Open menu" className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-line [&::-webkit-details-marker]:hidden">
              <span className="space-y-1.5" aria-hidden="true"><span className="block h-0.5 w-5 bg-ink" /><span className="block h-0.5 w-5 bg-ink" /><span className="block h-0.5 w-3 bg-ink" /></span>
            </summary>
            <div className="absolute right-0 top-14 w-60 rounded-2xl border border-line bg-surface p-2 shadow-2xl">
              {nav.map((n) => <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-3 text-sm font-semibold hover:bg-surface-2">{n.label}</Link>)}
            </div>
          </details>
        </div>
        <div className="border-t border-line px-4 py-2 md:hidden"><CityMenu /></div>
      </header>
      <p className="bg-gradient-to-r from-gold-400 to-gold-600 px-4 py-2 text-center text-xs font-semibold text-[#05070d]">{C.promo} Serving <strong>{site.serviceAreas.join(", ")}</strong>.</p>
    </>
  );
}

const tabs = [
  { label: "Home", href: "/repair", Icon: Home },
  { label: "Phone", href: "/repair/book", Icon: Smartphone },
  { label: "Laptop", href: "/repair?device=laptop#devices", Icon: Laptop },
  { label: "Tablet", href: "/repair?device=tablet#devices", Icon: Tablet },
];

export function RepairFooter() {
  const cols: { h: string; l: [string, string][] }[] = [
    { h: "Services", l: [["Screen Replacement", "/repair/book"], ["Battery Replacement", "/repair/book"], ["Back Glass", "/repair/book"], ["Charging Port", "/repair/book"], ["Camera", "/repair/book"]] },
    { h: "Company", l: [["About Us", "/about"], ["Guides", "/guides"], ["Contact Us", "/contact"], ["Terms & Conditions", "/policies/terms"], ["Privacy Policy", "/policies/privacy"]] },
    { h: "Support", l: [["Claim Warranty", whatsappLink("Hi FixSure, warranty support for my repair.")], ["Warranty Policy", "/policies/warranty"], ["Track Repair", "/repair/track"], ["FAQ", "/repair#faq"], ["WhatsApp Us", whatsappLink("Hi FixSure, I have an enquiry.")]] },
  ];
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-gold-400/30 bg-gradient-to-b from-[#0b1220] to-[#05070d] pb-24 text-white md:pb-0">
      <div className="mx-auto grid max-w-[1360px] gap-10 px-4 pb-48 pt-14 md:px-10 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <h2 className="text-base font-bold">Service areas</h2>
          <p className="mt-2 max-w-xs text-white/80">{site.serviceAreas.join(", ")}. Doorstep availability depends on your PIN code.</p>
          <h2 className="mt-8 text-base font-bold">Get in touch</h2>
          <p className="mt-2 text-white/80">{site.contactName} · <a className="hover:text-gold-400" href={`tel:+91${site.phone}`}>+91 {site.phone.slice(0, 5)} {site.phone.slice(5)}</a></p>
          {site.email && <p className="text-white/80"><a className="hover:text-gold-400" href={`mailto:${site.email}`}>{site.email}</a></p>}
          <a href={`https://instagram.com/${site.instagram}`} rel="noopener" className="mt-6 inline-flex h-11 items-center rounded-full border border-white/30 px-5 text-sm font-semibold hover:bg-white/10">Instagram</a>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {cols.map((c) => (
            <div key={c.h}>
              <h2 className="text-base font-bold">{c.h}</h2>
              <ul className="mt-3 space-y-2.5">
                {c.l.map(([t, h]) => <li key={t}><Link href={h} className="text-white/80 hover:text-white" {...(h.startsWith("http") ? { rel: "noopener" } : {})}>{t}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <Plants className="pointer-events-none absolute bottom-0 left-0 w-72 md:w-96" />
      <div className="absolute inset-x-0 bottom-20 flex flex-col items-center gap-2 text-center text-xs text-white/75 md:bottom-4">
        <span className="inline-flex items-center gap-2"><Emblem className="h-9 w-9" /><Wordmark /></span>
        <span className="text-[11px] font-bold tracking-[0.3em] text-gold-400">{site.motto}</span>
        <span className="inline-flex items-center gap-1">{C.footerLine} <Heart className="h-3.5 w-3.5 fill-pink-400 text-pink-400" aria-hidden="true" /></span>
        {C.rating && <span>{C.rating.score}+ {C.rating.label}</span>}
        <span>Your Reliable Fix. © {new Date().getFullYear()} FixSure. All rights reserved.</span>
      </div>

      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur md:hidden">
        <ul className="grid grid-cols-4">
          {tabs.map(({ label, href, Icon }) => (
            <li key={label}><Link href={href} className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-muted hover:text-gold-400"><Icon className="h-5 w-5" aria-hidden="true" />{label}</Link></li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
