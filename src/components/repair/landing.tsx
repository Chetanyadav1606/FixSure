"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Phone, Quote, Star, ArrowUpRight, ChevronLeft, ChevronRight, ClipboardCheck, FileText, Laptop, Minus, Plus, ScanSearch, ShieldCheck, Smartphone, Tablet, Wrench, Radio, MessageCircle, MapPin } from "lucide-react";
import { DeviceArt, ShieldBadge, Telephone } from "@/components/repair/art";
import { formatINR } from "@/lib/money";
import type { RepairServiceItem } from "@/lib/repair/catalog";
import { site, telLink, whatsappLink } from "@/lib/site";
import { repairContent as C } from "@/lib/repair/content";
import Image from "next/image";

const wrap = "mx-auto max-w-[1360px] px-4 md:px-10";
const h2 = "text-2xl tracking-tight text-ink md:text-4xl";
const sub = "mt-1 text-lg text-muted md:text-xl";
const cta = "btn-gold inline-flex items-center gap-2 rounded-xl font-extrabold transition hover:brightness-110";

export function LandingHero() {
  return (
    <section className="relative isolate overflow-hidden bg-canvas" aria-labelledby="hero-h">
      <div aria-hidden="true" className="absolute -left-40 top-0 -z-10 h-[34rem] w-[34rem] rounded-full bg-blue-500/25 blur-[120px]" />
      <div aria-hidden="true" className="absolute -right-32 bottom-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-gold-400/15 blur-[120px]" />
      <div className={`${wrap} grid items-center gap-10 py-12 md:py-20 lg:grid-cols-[1.25fr_1fr]`}>
        <div className="rise">
          <p className="text-xs font-bold tracking-[0.3em] text-gold-400">{site.motto}</p>
          <h1 id="hero-h" className="mt-4 text-[38px] leading-[1.02] sm:text-6xl lg:text-7xl">
            {C.hero.line1} <span className="text-gradient">{C.hero.highlight}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">{C.hero.sub}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={whatsappLink()} rel="noopener" className="btn-gold inline-flex h-14 items-center gap-2 rounded-xl px-7 text-lg font-extrabold"><MessageCircle className="h-5 w-5" aria-hidden="true" /> Book on WhatsApp</a>
            <a href={telLink} className="btn-blue inline-flex h-14 items-center gap-2 rounded-xl px-7 text-lg font-bold"><Phone className="h-5 w-5" aria-hidden="true" /> Call {site.contactName.split(" ")[0]}</a>
          </div>
          <ul className="mt-7 flex flex-wrap gap-2">
            {C.hero.chips.map((c) => (
              <li key={c} className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-gold-400" aria-hidden="true" />{c}</li>
            ))}
          </ul>
          {C.backers.length > 0 && <p className="mt-5 flex items-center gap-3 text-sm text-muted">Backed by {C.backers.map((b) => <Image key={b.name} src={b.logo} alt={b.name} width={90} height={24} className="h-6 w-auto" />)}</p>}
          <Link href="/repair/book" className="mt-5 inline-flex h-11 items-center gap-1 text-sm font-semibold text-blue-400 underline underline-offset-4">Or book online in 3 steps <ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <figure className="relative mx-auto w-full max-w-md">
          {C.hero.image ? (
            <div className="glass relative aspect-[4/5] overflow-hidden rounded-3xl"><Image src={C.hero.image} alt={C.hero.imageAlt} fill priority sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" /></div>
          ) : (
            <div className="relative flex items-center justify-center py-6">
              <div aria-hidden="true" className="absolute inset-10 rounded-full bg-gradient-to-br from-blue-500/40 to-gold-400/25 blur-3xl" />
              <Image src={site.logo.fullSrc} alt="FixSure — Trust, Repair, Solve" width={1000} height={673} priority sizes="(min-width:1024px) 440px, 90vw" className="relative w-full drop-shadow-[0_0_30px_rgba(30,107,255,0.35)]" />
            </div>
          )}
        </figure>
      </div>
    </section>
  );
}

export function Pillars() {
  return (
    <section className={`${wrap} pb-4`} aria-label={site.motto}>
      <ul className="grid gap-4 md:grid-cols-3">
        {C.pillars.map((p, i) => (
          <li key={p.k} style={{ animationDelay: `${i * 140}ms` }} className="rise glass lift relative overflow-hidden rounded-2xl p-6">
            <svg viewBox="0 0 24 28" aria-hidden="true" className="absolute -right-4 -top-4 h-28 w-24 text-blue-500/15"><path d="M12 1 23 5v9c0 6-5 11-11 13C6 25 1 20 1 14V5Z" fill="currentColor" /></svg>
            <p className="font-[family-name:var(--font-display)] text-3xl font-extrabold italic text-gold-400">{p.k}</p>
            <h3 className="mt-2 text-lg font-bold">{p.t}</h3>
            <p className="mt-1 text-muted">{p.d}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Tab = "phone" | "laptop" | "tablet";
const TABS: { key: Tab; label: string; Icon: typeof Smartphone; badge?: string }[] = [
  { key: "phone", label: "Phone", Icon: Smartphone },
  { key: "laptop", label: "Laptop", Icon: Laptop, badge: "ENQUIRE" },
  { key: "tablet", label: "Tablet", Icon: Tablet, badge: "ENQUIRE" },
];

export function DeviceSection({ brands, services, initialTab }: { brands: { name: string }[]; services: RepairServiceItem[]; initialTab?: string }) {
  const [tab, setTab] = useState<Tab>(initialTab === "laptop" || initialTab === "tablet" ? initialTab : "phone");
  const by = (slug: string) => services.find((s) => s.slug === slug);
  const screen = by("screen-replacement"); const batt = by("battery-replacement");
  const diag = services.map((s) => s.diagnosticFeePaise).find((v) => v != null) ?? null;
  const pill = (p: number | null | undefined) => p != null
    ? <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-800">Starting at {formatINR(p)}</span>
    : <span className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 text-sm font-bold text-emerald-800">Quote after diagnosis</span>;

  return (
    <section id="devices" className={`${wrap} scroll-mt-40 pt-12`} aria-labelledby="dev-h">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="dev-h" className={h2}>What can we fix for you?</h2>
        <div className="marquee w-full overflow-hidden rounded-xl bg-surface-2 py-3 md:w-[46%]" role="img" aria-label={`Brands we repair: ${brands.map((b) => b.name).join(", ")}`}>
          <ul aria-hidden="true" className="marquee-track flex w-max gap-8 px-4 text-sm font-extrabold uppercase tracking-wider text-muted">
            {[...brands, ...brands].map((b, i) => <li key={i} className="whitespace-nowrap">{b.name}</li>)}
          </ul>
        </div>
      </div>

      <div role="tablist" aria-label="Device type" className="mt-6 grid grid-cols-3 gap-0">
        {TABS.map((t, i) => {
          const on = tab === t.key;
          return (
            <button key={t.key} role="tab" id={`tab-${t.key}`} aria-selected={on} aria-controls="device-panel" onClick={() => setTab(t.key)}
              className={`relative flex h-[78px] cursor-pointer flex-col items-center justify-center gap-1 border border-b-0 border-blue-500/60 text-sm font-semibold transition ${i === 0 ? "rounded-tl-[36px]" : ""} ${i === 2 ? "rounded-tr-[36px]" : ""} ${on ? "bg-gradient-to-b from-blue-500/10 to-surface text-blue-400" : "bg-surface text-muted hover:bg-surface-2"}`}>
              {t.badge && <span className="absolute right-3 top-2 rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-extrabold text-navy-950">+ {t.badge}</span>}
              <t.Icon className="h-6 w-6" aria-hidden="true" />{t.label}
              {on && <span aria-hidden="true" className="absolute bottom-0 h-0.5 w-16 bg-blue-500" />}
            </button>
          );
        })}
      </div>

      <div id="device-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="rounded-b-3xl border border-t-0 border-blue-500/60 p-4 md:p-6">
        {tab === "phone" ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[{ t: "Screen & glass", s: screen, art: "screen" as const }, { t: "Phone repairs", s: batt, art: "battery" as const }].map((c) => (
              <Link key={c.t} href="/repair/book" className="group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-navy-100 p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div><h3 className="text-2xl font-semibold text-ink">{c.t}</h3>{pill(c.s?.startingPricePaise)}</div>
                <DeviceArt kind={c.art} className="absolute -bottom-4 -right-4 w-36 rotate-6 rounded-2xl" />
                <ChevronRight className="absolute right-4 top-4 h-5 w-5 text-blue-500" aria-hidden="true" />
              </Link>
            ))}
            <Link href="/repair/book" className="group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-navy-100 p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <h3 className="max-w-[10ch] text-2xl font-semibold leading-tight">Doorstep diagnostics</h3>
              <p className="text-4xl font-extrabold text-emerald-700">{diag != null ? <><span className="text-base font-semibold text-muted">at just </span>{formatINR(diag)}</> : <span className="text-xl">Diagnosis first</span>}</p>
              <ChevronRight className="absolute right-4 top-4 h-5 w-5 text-blue-500" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="grid items-center gap-6 md:grid-cols-[240px_1fr]">
            <DeviceArt kind={tab} className="mx-auto w-52 rounded-2xl md:w-full" />
            <div>
              <h3 className="text-2xl font-bold">{tab === "laptop" ? "Laptop" : "Tablet"} repairs</h3>
              <p className="mt-2 max-w-xl text-muted">Online booking is open for phones. For a {tab}, message us the model and the problem and we’ll tell you what’s possible and how we’d quote it.</p>
              <a href={whatsappLink(`Hi FixSure, I need a ${tab} repair.`)} rel="noopener" className={`${cta} mt-4 h-12 px-6`}><MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp</a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const SPOT: { slug: string; title: string; blurb: string; grad: string; art: "screen" | "battery" | "glass" }[] = [
  { slug: "screen-replacement", title: "Phone Screen Replacement", blurb: "Cracked or unresponsive display", grad: "from-blue-500/30 to-surface", art: "screen" },
  { slug: "battery-replacement", title: "Phone Battery Replacement", blurb: "Drains fast or shuts down", grad: "from-teal-500/25 to-surface", art: "battery" },
  { slug: "back-glass-replacement", title: "Back Glass Replacement", blurb: "Cracked or shattered rear panel", grad: "from-gold-400/25 to-surface", art: "glass" },
];

export function SpotlightRow() {
  return (
    <section className={`${wrap} pt-14`} aria-labelledby="spot-h">
      <div className="border-t-[10px] border-[#f3f4f7] pt-8" />
      <div className="flex items-start justify-between gap-4">
        <div><h2 id="spot-h" className={h2}>Services in the spotlight</h2><p className={sub}>Fast, clearly quoted mobile repair, at your doorstep where we serve</p></div>
        <Link href="/repair/book" className="inline-flex h-10 shrink-0 items-center gap-1 rounded-lg bg-surface-2 px-4 text-sm font-medium text-muted underline">View all <ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>
      <ul className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        {SPOT.map((s) => (
          <li key={s.slug} className={`relative min-h-[232px] w-[82%] shrink-0 snap-start md:w-auto overflow-hidden rounded-2xl bg-gradient-to-br ${s.grad} p-6`}>
            <h3 className="max-w-[12ch] text-xl font-semibold leading-snug">{s.title}</h3>
            <p className="mt-3 max-w-[14ch] text-sm text-muted">{s.blurb}</p>
            <Link href="/repair/book" className="relative z-10 mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-gold-400 px-4 text-sm font-bold text-[#05070d]">Book now <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
            {C.spotlightImages[s.slug as keyof typeof C.spotlightImages]
              ? <Image src={C.spotlightImages[s.slug as keyof typeof C.spotlightImages]!} alt={s.title} width={200} height={200} loading="lazy" className="absolute bottom-0 right-0 h-44 w-44 object-cover" />
              : <DeviceArt kind={s.art} className="absolute -bottom-3 -right-6 w-44 rotate-6 rounded-3xl shadow-xl" />}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PromiseBanner() {
  const months = site.repairWarrantyMonths;
  const items = [
    { Icon: ShieldCheck, t: months ? `Warranty upto ${months} months` : "Warranty stated on quotation" },
    { Icon: FileText, t: "Quote before repair" },
    { Icon: ScanSearch, t: "Parts clearly labelled" },
  ];
  return (
    <section className={`${wrap} pt-14`} aria-labelledby="promise-h">
      <div className="relative grid items-center gap-6 overflow-hidden rounded-sm bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 px-6 py-8 md:grid-cols-[1.1fr_2fr] md:px-10">
        <span aria-hidden="true" className="absolute -left-10 bottom-0 h-full w-1/2 -skew-x-[28deg] bg-white/5" />
        <h2 id="promise-h" className="relative text-5xl font-black italic leading-[0.95] tracking-tight text-gold-400 md:text-6xl">OUR<br />PROMISE</h2>
        <ul className="relative grid grid-cols-3 gap-2 text-center text-white">
          {items.map(({ Icon, t }) => (
            <li key={t} className="flex flex-col items-center gap-3 px-1">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/15 ring-2 ring-gold-400/70"><Icon className="h-8 w-8 text-gold-400" aria-hidden="true" /></span>
              <span className="text-sm font-medium leading-tight md:text-base">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STEPS: { t: string; d: string; Icon: typeof Wrench; bg: string }[] = [
  { t: "Book a repair", d: "Choose your device and issue, then tell us where and when.", Icon: Smartphone, bg: "from-navy-800 to-blue-500" },
  { t: "We confirm", d: "Our team confirms details and timing with you.", Icon: MessageCircle, bg: "from-teal-600 to-emerald-500" },
  { t: "Technician visit", d: "At your door where we serve, or pickup or a centre visit.", Icon: MapPin, bg: "from-orange-500 to-rose-500" },
  { t: "Diagnosis & quote", d: "We check the fault first and send a quotation to approve.", Icon: ClipboardCheck, bg: "from-violet-600 to-fuchsia-500" },
  { t: "Repair", d: "Work starts only after you approve the quotation.", Icon: Wrench, bg: "from-sky-600 to-cyan-500" },
  { t: "Quality check & handover", d: "We test the repair and hand the phone back with your invoice.", Icon: Radio, bg: "from-amber-500 to-yellow-400" },
];

export function StepsCarousel() {
  const ref = useRef<HTMLOListElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  return (
    <section className={`${wrap} pt-14`} aria-labelledby="how-h">
      <div className="border-t-[10px] border-[#f3f4f7] pt-8" />
      <div className="flex items-end justify-between gap-4">
        <div><h2 id="how-h" className={h2}>How do we work?</h2><p className={sub}>Simple. Clear. Reliable.</p></div>
        <div className="hidden gap-2 md:flex">
          <button type="button" onClick={() => scroll(-1)} aria-label="Previous steps" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line hover:bg-surface-2"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
          <button type="button" onClick={() => scroll(1)} aria-label="Next steps" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-line hover:bg-surface-2"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
        </div>
      </div>
      <ol ref={ref} className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2" tabIndex={0} aria-label="Repair steps">
        {STEPS.map((s, i) => (
          <li key={s.t} className="w-[232px] shrink-0 snap-start overflow-hidden rounded-2xl bg-surface shadow-md ring-1 ring-line">
            <div className={`relative flex h-[200px] items-center justify-center bg-gradient-to-br ${s.bg}`}>
              <span className="absolute left-3 top-3 rounded-full bg-canvas/90 px-2.5 py-0.5 text-xs font-extrabold text-ink">Step {i + 1}</span>
              <s.Icon className="h-20 w-20 text-white/95" strokeWidth={1.3} aria-hidden="true" />
            </div>
            <div className="p-4 text-center"><h3 className="font-bold">{s.t}</h3><p className="mt-1 text-sm text-muted">{s.d}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function WarrantyBanner() {
  const months = site.repairWarrantyMonths;
  return (
    <section className={`${wrap} pt-14`} aria-labelledby="war-h">
      <div className="relative grid items-center overflow-hidden rounded-sm bg-gradient-to-r from-navy-950 via-navy-900 to-blue-500 px-6 py-10 text-white md:grid-cols-2 md:px-8 md:py-14">
        <div className="relative z-10">
          <h2 id="war-h" className="text-3xl font-bold md:text-[32px]">{months ? `Upto ${months} months warranty` : "Warranty on every quotation"}</h2>
          <p className="mt-3 max-w-md text-xl text-white/85">{months ? "Raise a claim and get quick assistance from our support team." : "Your quotation states the warranty period and what it excludes. Raise a claim and our support team will help."}</p>
          <a href={whatsappLink("Hi FixSure, warranty support for my repair.")} rel="noopener" className="mt-6 inline-flex h-14 items-center gap-2 rounded-xl bg-surface px-8 text-xl font-semibold text-ink shadow-lg hover:bg-gold-100">Claim warranty <ChevronRight className="h-5 w-5" aria-hidden="true" /></a>
        </div>
        <ShieldBadge className="mx-auto mt-6 h-52 w-auto md:mt-0 md:h-64" />
      </div>
    </section>
  );
}

const CURIOUS: { tag: string; q: string; a: string }[] = [
  { tag: "Genuine repair parts", q: "Which parts will be used for my repair?", a: "Your quotation lists each part and says whether it is genuine, OEM or compatible. You choose before any work starts." },
  { tag: "Warranty", q: "What does the warranty not cover?", a: "Terms are on your quotation. Damage unrelated to the repaired part, such as new cracks, liquid damage or tampering, is typically excluded." },
  { tag: "Quality service", q: "How do you ensure the quality of your repair service?", a: "We diagnose first, repair only what you approved, test the device before handover and log each stage on your ticket." },
  { tag: "At home and in-store repairs", q: "Is a doorstep repair available for me?", a: "It depends on your PIN code and the slots we have open. If not, choose pickup or a service-centre visit when you book." },
];

export function CuriousMinds() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className={`${wrap} pt-14`} aria-labelledby="cur-h">
      <h2 id="cur-h" className={h2}>For curious minds</h2><p className={sub}>Straight answers about parts, warranty and quality</p>
      <ul className="no-scrollbar mt-6 flex snap-x gap-4 overflow-x-auto pb-2">
        {CURIOUS.map((c, i) => (
          <li key={c.tag} className="relative flex min-h-[240px] w-[78%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-navy-700 to-navy-950 p-5 text-white sm:w-[300px] md:w-0 md:flex-1">
            <span aria-hidden="true" className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full border-[14px] border-white/10" />
            <span className="relative w-fit rounded-lg bg-black px-3 py-1.5 text-sm font-semibold">{c.tag}</span>
            <p className="relative my-4 text-center text-xl font-medium leading-snug">{open === i ? c.a : c.q}</p>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="relative mx-auto inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-white/70 px-5 text-sm font-semibold hover:bg-white/10">
              {open === i ? "Back" : <>Learn more <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></>}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function QuestionPanel() {
  return (
    <section className={`${wrap} pt-14`} aria-labelledby="q-h">
      <div className="relative grid items-center overflow-hidden rounded-2xl bg-gradient-to-r from-navy-50 to-blue-500/10 p-6 md:grid-cols-[1.4fr_1fr] md:p-10">
        <div>
          <h2 id="q-h" className="text-3xl font-bold">Got a question?</h2>
          <p className="mt-3 text-xl text-muted">We’re here to help. Contact our support team to resolve your queries.</p>
          <Link href="/contact" className={`${cta} mt-6 h-12 px-7 text-lg`}>Contact support <ChevronRight className="h-5 w-5" aria-hidden="true" /></Link>
        </div>
        <Telephone className="mx-auto mt-4 w-56 md:mt-0" />
      </div>
    </section>
  );
}

const FAQS = C.faqs;

export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className={`${wrap} scroll-mt-40 pt-14`} aria-labelledby="faq-h">
      <h2 id="faq-h" className={h2}>Frequently asked questions</h2><p className={sub}>Common questions about phone repair with FixSure</p>
      <ul className="mt-6 space-y-3">
        {FAQS.map(([q, a], i) => {
          const on = open === i;
          return (
            <li key={q} className={on ? "rounded-xl border border-line bg-surface" : "rounded-xl bg-surface-2 border border-line"}>
              <h3>
                <button type="button" aria-expanded={on} aria-controls={`faq-${i}`} onClick={() => setOpen(on ? -1 : i)} className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 px-5 py-3 text-left text-lg font-medium text-blue-400">
                  {q}{on ? <Minus className="h-5 w-5 shrink-0" aria-hidden="true" /> : <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />}
                </button>
              </h3>
              {on && <p id={`faq-${i}`} className="px-5 pb-5 text-lg text-muted">{a}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}



/** Auto-advancing, swipeable testimonial carousel. Renders ONLY real reviews from content.ts. */
export function Testimonials() {
  const ref = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const list = C.testimonials;
  useEffect(() => {
    if (!list.length || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      const el = ref.current; if (!el) return;
      el.scrollBy({ left: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 ? -el.scrollWidth : 340, behavior: "smooth" });
    }, 4500);
    return () => clearInterval(id);
  }, [list.length, paused]);
  return (
    <section className={`${wrap} pt-14`} aria-labelledby="rev-h">
      <div className="border-t-[10px] border-[#f3f4f7] pt-8" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="rev-h" className={h2}>{list.length ? "What our customers say" : "Customer reviews"}</h2><p className={sub}>Genuine feedback only</p></div>
        {C.rating && <a href={C.rating.url} rel="noopener" className="inline-flex items-center gap-1.5 rounded-full bg-gold-100 px-4 py-2 text-sm font-bold text-navy-950"><Star className="h-4 w-4 fill-gold-500 text-gold-500" aria-hidden="true" /> {C.rating.score}+ {C.rating.label}</a>}
      </div>
      {list.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-8 text-muted">Reviews will appear here after completed repairs. We only publish genuine customer feedback.</p>
      ) : (
        <ul ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} tabIndex={0} aria-label="Customer reviews"
          className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {list.map((t) => (
            <li key={t.name + t.repair} className="w-[300px] shrink-0 snap-start rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 p-5 text-white shadow-lg sm:w-[340px]">
              <div className="flex items-center gap-3">
                {t.avatar ? <Image src={t.avatar} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" /> : <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400 font-bold text-navy-950">{t.name[0]}</span>}
                <div><p className="font-bold">{t.name}</p><p className="text-xs text-white/70">{t.repair} · {t.source}</p></div>
              </div>
              <p className="mt-3 flex gap-0.5" role="img" aria-label={`${t.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-gold-400 text-gold-400" : "text-white/30"}`} aria-hidden="true" />)}</p>
              <Quote className="mt-3 h-7 w-7 text-gold-400" aria-hidden="true" />
              <blockquote className="mt-1 text-sm leading-6 text-white/90">{t.text}</blockquote>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Shown only when real press coverage is listed in content.ts. */
export function InTheNews() {
  if (!C.press.length) return null;
  return (
    <section className={`${wrap} pt-14`} aria-labelledby="news-h">
      <h2 id="news-h" className={h2}>In the news</h2><p className={sub}>Our latest stories and milestones</p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {C.press.map((p) => (
          <li key={p.url} className="rounded-2xl border border-line bg-surface p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-muted">{p.outlet}</p>
            <h3 className="mt-2 text-xl font-bold">{p.headline}</h3>
            <a href={p.url} rel="noopener" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold underline">Read more <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Fades/lifts children in when scrolled into view. Shown immediately with reduced motion. */
export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`transition-all duration-700 ${shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"}`}>{children}</div>;
}
