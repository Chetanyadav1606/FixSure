import Link from "next/link";
import { ArrowRight, ClipboardCheck, EyeOff, FileText, Lock, MessageCircle, Radio, ScanSearch, ShieldCheck, Star, Wrench } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ScreenTransform } from "@/components/repair/screen-transform";
import { ServiceIcon } from "@/components/repair/service-icon";
import { formatINR } from "@/lib/money";
import type { RepairServiceItem } from "@/lib/repair/catalog";
import { site, whatsappLink } from "@/lib/site";

export function RepairHero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-white">
      <div aria-hidden="true" className="grid-fade absolute inset-0 -z-10" />
      <div aria-hidden="true" className="absolute -right-32 -top-32 -z-10 h-[34rem] w-[34rem] rounded-full bg-blue-500/25 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 md:pb-24 md:pt-20 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-400">
            <Wrench className="h-3.5 w-3.5" aria-hidden="true" /> Mobile repair · {site.serviceAreas.join(" · ")}
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Your Phone Deserves Better. <span className="text-gold-400">We Fix It at Your Doorstep.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
            From cracked screens to battery issues, get professional mobile repairs at your home or workplace. Book a trusted FixSure technician in just a few steps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="#book" variant="gold" size="lg">Book a Repair <ArrowRight className="h-4 w-4" aria-hidden="true" /></ButtonLink>
            <ButtonLink href="#services" variant="onDark" size="lg">Explore Services</ButtonLink>
          </div>
          <ul className="mt-10 grid max-w-xl gap-3 text-sm sm:grid-cols-3">
            {[[FileText, "Quote before any repair"], [Radio, "Track every step online"], [ShieldCheck, "You approve before we start"]].map(([Icon, t]) => {
              const I = Icon as typeof FileText;
              return <li key={t as string} className="flex items-start gap-2 text-white/85"><I className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />{t as string}</li>;
            })}
          </ul>
        </div>

        <div className="relative">
          <ScreenTransform />
          <div aria-hidden="true" className="floaty absolute -left-2 top-16 hidden rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs backdrop-blur sm:block lg:-left-10">
            <p className="font-bold text-gold-400">Diagnosis first</p><p className="text-white/80">then a clear quote</p>
          </div>
          <div aria-hidden="true" className="floaty absolute -right-2 bottom-28 hidden rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs backdrop-blur [animation-delay:-3s] sm:block lg:-right-8">
            <p className="font-bold text-gold-400">Live status</p><p className="text-white/80">from booking to handover</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServiceGrid({ services, configured }: { services: RepairServiceItem[]; configured: boolean }) {
  const groups = [
    { key: "common", title: "Common repairs", blurb: "The fixes we’re asked for most." },
    { key: "advanced", title: "Advanced repairs", blurb: "Component-level and diagnostic work." },
  ] as const;
  return (
    <section id="services" className="mx-auto max-w-7xl scroll-mt-44 md:scroll-mt-32 px-4 pt-20" aria-labelledby="svc-h">
      <h2 id="svc-h" className="max-w-2xl text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">Every repair, explained before it starts.</h2>
      <p className="mt-3 max-w-2xl text-muted">Prices and durations appear only where we’ve set them. Everything else is quoted after diagnosis.</p>
      {services.length === 0 && <p className="mt-8 rounded-xl border border-dashed border-line bg-white p-8 text-center text-sm text-muted">Repair services will appear here once they’re published.</p>}
      {groups.map((g) => {
        const list = services.filter((s) => s.category === g.key);
        if (!list.length) return null;
        return (
          <div key={g.key} className="mt-10">
            <div className="flex items-baseline gap-3"><h3 className="text-lg font-extrabold">{g.title}</h3><p className="text-sm text-muted">{g.blurb}</p></div>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((s, i) => (
                <li key={s.id} className={`group relative overflow-hidden rounded-xl border bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl ${g.key === "advanced" ? "border-navy-900/20" : "border-line"} ${i === 0 && g.key === "common" ? "lg:col-span-1" : ""}`}>
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-500 to-gold-500 transition-transform duration-300 group-hover:scale-x-100" />
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-900 transition group-hover:bg-navy-900 group-hover:text-white"><ServiceIcon name={s.iconKey} className="h-6 w-6" /></span>
                    {g.key === "advanced" && <span className="rounded-full bg-gold-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-600">Advanced</span>}
                  </div>
                  <h4 className="mt-4 text-lg font-extrabold text-navy-900">{s.name}</h4>
                  <p className="mt-1 text-sm leading-6 text-muted">{s.description}</p>
                  <p className="mt-4 text-sm font-semibold text-ink">
                    {s.startingPricePaise != null ? <>From {formatINR(s.startingPricePaise)} <span className="font-normal text-muted">· estimate</span></> : <span className="text-muted">Quote after diagnosis</span>}
                    {s.durationText && <span className="font-normal text-muted"> · {s.durationText}</span>}
                  </p>
                  <Link href={`/repair?service=${s.slug}#book`} className="mt-4 inline-flex h-11 items-center gap-1.5 text-sm font-bold text-navy-700 after:absolute after:inset-0 hover:text-navy-900">
                    Book this service <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {!configured && <p className="mt-6 text-xs text-muted">Service list shown for reference; prices and availability are confirmed when you book.</p>}
    </section>
  );
}

const journey = [
  { t: "Book your repair", d: "Tell us the phone and the problem. It takes a few minutes." },
  { t: "We confirm your request", d: "Our team contacts you to confirm details and timing." },
  { t: "A technician comes to you", d: "For doorstep bookings in areas we serve; otherwise pickup or a centre visit." },
  { t: "Your device gets repaired", d: "Diagnosis first, then a quote you approve before work begins." },
  { t: "Quality check & handover", d: "We test the repair and hand the phone back with your invoice." },
];

export function Journey() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4" aria-labelledby="jr-h">
      <div className="rounded-3xl bg-navy-950 px-6 py-14 text-white md:px-12">
        <h2 id="jr-h" className="max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl">Expert Repairs. Without Leaving Your Home.</h2>
        <ol className="relative mt-12 grid gap-0 md:grid-cols-5 md:gap-6">
          <span aria-hidden="true" className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-white/20 md:left-0 md:right-0 md:top-[19px] md:h-px md:w-full" />
          {journey.map((s, i) => (
            <li key={s.t} className="relative flex gap-4 pb-8 md:block md:pb-0">
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-400 bg-navy-950 text-sm font-extrabold text-gold-400">{String(i + 1).padStart(2, "0")}</span>
              <div className="md:mt-5"><h3 className="font-bold">{s.t}</h3><p className="mt-1 text-sm leading-6 text-white/70">{s.d}</p></div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs text-white/50">Timings are confirmed per booking. We don’t promise same-day service.</p>
      </div>
    </section>
  );
}

export function Trust() {
  const items = [
    { Icon: FileText, t: "Transparent quotations", d: "Diagnosis first. You see parts, labour and tax before you decide." },
    { Icon: ClipboardCheck, t: "Your approval, recorded", d: "No repair work starts until you approve the quotation." },
    { Icon: ScanSearch, t: "Clearly described parts", d: "Your quotation states whether a part is genuine, OEM or compatible." },
    { Icon: Radio, t: "Status you can follow", d: "Every stage is logged against your ticket and visible when you track." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24" aria-labelledby="trust-h">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 id="trust-h" className="text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">Your Device. Your Data. Your Peace of Mind.</h2>
          <p className="mt-4 leading-7 text-muted">
            Your phone holds your photos, messages and banking apps. We only access what a repair needs, we don’t ask for your passwords or PINs unless a diagnosis genuinely requires it, and we explain every step. Please back up your data before a repair; some repairs can’t be done without a reset.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex gap-3"><Lock className="mt-0.5 h-5 w-5 shrink-0 text-navy-800" aria-hidden="true" /> Photos you upload are stored privately and only used for your repair.</li>
            <li className="flex gap-3"><EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-navy-800" aria-hidden="true" /> Tracking needs your ticket number plus your phone number or tracking key.</li>
          </ul>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map(({ Icon, t, d }) => (
            <li key={t} className="rounded-xl border border-line bg-white p-5">
              <Icon className="h-6 w-6 text-blue-500" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-3 font-bold">{t}</h3><p className="mt-1 text-sm leading-6 text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Pricing({ services }: { services: RepairServiceItem[] }) {
  const priced = services.filter((s) => s.startingPricePaise != null || s.diagnosticFeePaise != null);
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24" aria-labelledby="price-h">
      <h2 id="price-h" className="text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">Pricing, without surprises.</h2>
      <p className="mt-3 max-w-2xl text-muted">Figures here are <strong>estimates or starting prices</strong>. The price you pay is the one in your quotation, which you approve first.</p>
      {priced.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-white p-8 text-sm leading-6">
          <p className="font-bold">Prices are quoted per phone and fault.</p>
          <p className="mt-1 text-muted">We diagnose first, then send a quotation showing parts, labour and tax. You decide whether to go ahead.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Estimated repair prices</caption>
            <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-900"><tr><th scope="col" className="px-4 py-3">Service</th><th scope="col" className="px-4 py-3">Starting price (estimate)</th><th scope="col" className="px-4 py-3">Diagnostic fee</th><th scope="col" className="px-4 py-3">Time</th></tr></thead>
            <tbody className="divide-y divide-line">
              {priced.map((s) => (
                <tr key={s.id}><th scope="row" className="px-4 py-3 font-semibold">{s.name}</th>
                  <td className="px-4 py-3">{s.startingPricePaise != null ? `From ${formatINR(s.startingPricePaise)}` : "Quote after diagnosis"}</td>
                  <td className="px-4 py-3">{s.diagnosticFeePaise != null ? formatINR(s.diagnosticFeePaise) : "—"}</td>
                  <td className="px-4 py-3">{s.durationText ?? "Confirmed on booking"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export type RepairReview = { id: string; rating: number; text: string; author: string; repair: string; brand: string };

/** Renders ONLY real, approved reviews. With none, shows an honest empty state — never invented testimonials. */
export function Reviews({ reviews }: { reviews: RepairReview[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24" aria-labelledby="rev-h">
      <h2 id="rev-h" className="text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">What customers say</h2>
      {reviews.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-line bg-white p-8 text-sm text-muted">Customer reviews will appear here after completed repairs. We only publish genuine feedback.</p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-line bg-white p-6">
              <p className="flex gap-0.5 text-gold-500" role="img" aria-label={`${r.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4" fill={i < r.rating ? "currentColor" : "none"} aria-hidden="true" />)}</p>
              <blockquote className="mt-3 text-sm leading-6">“{r.text}”</blockquote>
              <p className="mt-4 text-xs text-muted">{r.author} · {r.repair} · {r.brand}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-navy-900 to-navy-950 p-8 text-white md:flex-row md:items-center md:p-12">
        <div><h2 className="text-2xl font-extrabold md:text-3xl">Not sure what’s wrong?</h2><p className="mt-2 max-w-lg text-white/75">Describe it in the booking form, or message a technician first.</p></div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#book" variant="gold" size="lg">Book a Repair</ButtonLink>
          <ButtonLink href={whatsappLink("Hi FixSure, I have a question about a phone repair.")} variant="onDark" size="lg" rel="noopener"><MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp</ButtonLink>
        </div>
      </div>
    </section>
  );
}

export function StickyBookCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 p-3 backdrop-blur md:hidden">
      <Link href="#book" className="flex h-12 items-center justify-center gap-2 rounded-lg bg-navy-900 font-bold text-white">Book a Repair <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </div>
  );
}
