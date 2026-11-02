import Link from "next/link";
import { ArrowRight, Boxes, ClipboardCheck, Cpu, Laptop, MapPin, Search, Smartphone, Truck, Wrench } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { getCatalog } from "@/lib/catalog";
import { site } from "@/lib/site";

const deviceTiles = [
  { label: "Laptop parts", href: "/shop?device=laptop", Icon: Laptop, blurb: "Screens, batteries, keyboards, chargers, RAM, SSDs and more." },
  { label: "Desktop components", href: "/shop?device=desktop", Icon: Cpu, blurb: "Processors, memory, storage and power supplies." },
  { label: "Mobile parts", href: "/shop?device=mobile", Icon: Smartphone, blurb: "Displays, batteries and replacement components." },
  { label: "Accessories & tools", href: "/shop?device=accessory", Icon: Boxes, blurb: "Peripherals, cables, cleaning kits and repair tools." },
];

const steps = [
  { title: "Find the right part", body: "Search by model, part number or OEM number. We only show compatibility we have recorded." },
  { title: "Order or book", body: "Buy components, or describe the fault and book a repair ticket." },
  { title: "Track it", body: "Follow your order or repair status from request to completion." },
];

export default async function Home() {
  const catalog = getCatalog();
  const [featured, categories, brands] = await Promise.all([catalog.featured(4), catalog.categories(), catalog.brands()]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const brandById = new Map(brands.map((b) => [b.id, b]));
  const laptopBrands = brands.filter((b) => ["hp", "dell", "lenovo", "asus", "acer", "apple"].includes(b.slug));

  return (
    <>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_20%,rgba(200,150,46,0.18),transparent)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:py-24 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold-400">Parts · Components · Repairs</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl">
              Every Component. Every Repair. One Reliable Destination.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">
              Source laptop, desktop and mobile parts, or hand your device to technicians who fix it. Based in Mumbai, serving {site.serviceAreas.join(", ")}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/shop" variant="gold" size="lg">Explore Components <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
              <ButtonLink href="/repair" variant="onDark" size="lg">Book a Repair</ButtonLink>
            </div>
          </div>

          <form action="/finder" className="rounded-2xl bg-white p-6 text-ink shadow-2xl" aria-labelledby="finder-heading">
            <h2 id="finder-heading" className="flex items-center gap-2 text-lg font-extrabold text-navy-900">
              <Search className="h-5 w-5 text-gold-600" aria-hidden="true" /> Smart Compatibility Finder
            </h2>
            <p className="mt-1 text-sm text-muted">Enter your device model or a part number to see the parts we have on record for it.</p>
            <label htmlFor="hero-model" className="mt-4 block text-sm font-semibold">Device model or part number</label>
            <input id="hero-model" name="q" required minLength={2} placeholder="e.g. HP Pavilion 15" className="mt-1.5 h-12 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-navy-700" />
            <button className="mt-4 h-12 w-full cursor-pointer rounded-lg bg-navy-900 font-semibold text-white hover:bg-navy-800">Find compatible parts</button>
            <p className="mt-3 text-xs text-muted">Compatibility is shown only where verified or recorded. Always confirm against your part.</p>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16" aria-labelledby="cat-h">
        <h2 id="cat-h" className="text-2xl font-extrabold text-navy-900">Shop by category</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deviceTiles.map(({ label, href, Icon, blurb }) => (
            <Link key={href} href={href} className="group rounded-xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-navy-700/40 hover:shadow-lg">
              <Icon className="h-8 w-8 text-navy-900" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-4 font-bold">{label}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{blurb}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-700">Browse <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14" aria-labelledby="brand-h">
        <h2 id="brand-h" className="text-2xl font-extrabold text-navy-900">Shop by laptop brand</h2>
        <ul className="mt-6 flex flex-wrap gap-3">
          {laptopBrands.map((b) => (
            <li key={b.id}><Link href={`/shop?device=laptop&brand=${b.slug}`} className="inline-block rounded-lg border border-line bg-white px-5 py-3 font-bold hover:border-navy-700 hover:text-navy-900">{b.name}</Link></li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14" aria-labelledby="feat-h">
        <div className="flex items-end justify-between">
          <h2 id="feat-h" className="text-2xl font-extrabold text-navy-900">Featured products</h2>
          <Link href="/shop" className="text-sm font-semibold text-navy-700 hover:underline">View all</Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} category={catById.get(p.categoryId)} brand={brandById.get(p.brandId)} />)}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4" aria-labelledby="rep-h">
        <div className="grid gap-8 rounded-2xl bg-navy-50 p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 id="rep-h" className="text-2xl font-extrabold text-navy-900">Repair services</h2>
            <p className="mt-3 max-w-md leading-7 text-muted">
              Laptop, desktop and mobile repairs. Diagnosis first, a clear quote before any work begins, and a ticket you can track.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/repair">See repair services</ButtonLink>
              <ButtonLink href="/contact" variant="outline">Ask a technician</ButtonLink>
            </div>
          </div>
          <ul className="grid gap-3 text-sm font-semibold text-navy-900 sm:grid-cols-2">
            {["Screen replacement", "Battery replacement", "Charging issues", "Keyboard replacement", "SSD & RAM upgrades", "Software & malware"].map((s) => (
              <li key={s} className="flex items-center gap-2 rounded-lg bg-white px-4 py-3"><Wrench className="h-4 w-4 text-gold-600" aria-hidden="true" />{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16" aria-labelledby="how-h">
        <h2 id="how-h" className="text-2xl font-extrabold text-navy-900">How FixSure works</h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-line bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4" aria-labelledby="b2b-h">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-navy-900 p-8 text-white md:flex-row md:items-center md:p-12">
          <div className="max-w-xl">
            <h2 id="b2b-h" className="text-2xl font-extrabold">Wholesale supply for repair shops and IT teams</h2>
            <p className="mt-3 leading-7 text-white/80">Running a service centre or reselling hardware? Ask about trade pricing, bulk quantities and quotations.</p>
          </div>
          <ButtonLink href="/wholesale" variant="gold" size="lg">Wholesale enquiry <ClipboardCheck className="h-4 w-4" aria-hidden="true" /></ButtonLink>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14" aria-label="Service area">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted">
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-navy-800" aria-hidden="true" /> {site.serviceAreas.join(" · ")}</span>
          <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-navy-800" aria-hidden="true" /> Delivery and doorstep options are shown only where available</span>
        </div>
      </section>
    </>
  );
}
