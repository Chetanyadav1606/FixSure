import Link from "next/link";
import { Menu, Phone, Search } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { navCategories, site } from "@/lib/site";

const primaryNav = [
  { label: "Shop", href: "/shop" },
  { label: "Smart Finder", href: "/finder" },
  { label: "Repair Services", href: "/repair" },
  { label: "Track Repair", href: "/repair/track" },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Support", href: "/contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur supports-[backdrop-filter]:bg-canvas/90">
      <div className="bg-gradient-to-r from-[#0b1a3d] via-[#0b1220] to-[#0b1a3d] text-xs text-muted border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          <p>Serving {site.serviceAreas.join(", ")}. Parts, components and repairs under one roof.</p>
          <a href={`tel:+91${site.phone}`} className="hidden items-center gap-1.5 font-semibold hover:text-gold-400 sm:inline-flex">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Call / WhatsApp {site.phone}
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Logo />

        <form action="/shop" role="search" className="mx-auto hidden w-full max-w-xl md:block">
          <label htmlFor="site-search" className="sr-only">Search parts by name, SKU or part number</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search part name, SKU or OEM number"
              className="h-11 w-full rounded-lg border border-line bg-canvas pl-10 pr-24 text-sm outline-none focus:border-navy-700 focus:bg-surface"
            />
            <button className="absolute right-1 top-1 h-9 cursor-pointer rounded-md btn-gold px-4 text-sm font-bold">Search</button>
          </div>
        </form>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 lg:flex">
          {primaryNav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-2 hover:text-ink">
              {n.label}
            </Link>
          ))}
          <Link href="/repair#book" className="ml-2 inline-flex h-10 items-center btn-gold rounded-full px-5 text-sm font-extrabold hover:brightness-105">Book now</Link>
        </nav>

        <details className="group relative ml-auto lg:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg border border-line [&::-webkit-details-marker]:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" aria-hidden="true" />
          </summary>
          <div className="absolute right-0 top-12 w-64 rounded-xl border border-line bg-surface p-2 shadow-xl">
            {[...primaryNav, ...navCategories].map((n) => (
              <Link key={n.href + n.label} href={n.href} className="block rounded-md px-3 py-2.5 text-sm font-semibold hover:bg-surface-2">
                {n.label}
              </Link>
            ))}
          </div>
        </details>
      </div>

      <form action="/shop" role="search" className="px-4 pb-3 md:hidden">
        <label htmlFor="site-search-m" className="sr-only">Search parts</label>
        <input id="site-search-m" name="q" type="search" placeholder="Search part name, SKU or OEM number" className="h-11 w-full rounded-lg border border-line bg-canvas px-3 text-sm outline-none focus:border-navy-700 focus:bg-surface" />
      </form>

      <nav aria-label="Categories" className="hidden border-t border-line bg-surface lg:block">
        <ul className="mx-auto flex max-w-7xl gap-1 px-4">
          {navCategories.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="inline-block px-3 py-2.5 text-sm font-medium text-muted hover:text-ink">{c.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
