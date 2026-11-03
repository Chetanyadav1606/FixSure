"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, Laptop, MessageCircle, Search, Smartphone, Tablet } from "lucide-react";
import { DeviceArt } from "@/components/repair/art";
import { CityMenu } from "@/components/repair/city-menu";
import { Emblem } from "@/components/ui/logo";
import { formatINR } from "@/lib/money";
import type { RepairServiceItem } from "@/lib/repair/catalog";
import { whatsappLink } from "@/lib/site";

const OTHER = "__other__";

export function BookTopBar({ backHref, children }: { backHref: string; children?: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-30 bg-surface shadow-sm">
      <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-4 py-3 md:px-10">
        <Link href={backHref} aria-label="Go back" className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 hover:bg-surface-2"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></Link>
        <div className="leading-tight"><p className="text-lg font-extrabold text-ink">Book a repair</p><CityMenu /></div>
        <Link href="/repair" aria-label="FixSure home" className="ml-auto"><Emblem className="h-9 w-9" /></Link>
      </div>
      {children && <div className="mx-auto max-w-[1360px] px-4 pb-3 md:px-10">{children}</div>}
    </div>
  );
}

function StepBar({ step, label, disabled, onClick }: { step: number; label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-canvas via-canvas to-transparent px-4 pb-4 pt-6">
      <button type="button" onClick={onClick} disabled={disabled} className="mx-auto flex h-14 w-full max-w-[1300px] cursor-pointer items-center justify-between rounded-2xl bg-gradient-to-r from-navy-800 to-blue-500 px-6 text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
        <span className="font-semibold text-white/85">Step {step}/3</span>
        <span className="inline-flex items-center gap-1.5 font-bold">{label} <ChevronRight className="h-4 w-4" aria-hidden="true" /></span>
      </button>
    </div>
  );
}

const field = "h-12 w-full rounded-xl border border-line bg-surface-2 px-4 text-base outline-none focus:border-blue-500 focus:bg-surface focus:ring-2 focus:ring-blue-500/20";
const seriesOf = (m: string) => m.replace(/\s+(Pro Max|Pro|Plus|Ultra|Air|FE|e|\+)$/i, "").trim();

type Brand = { name: string; models: string[] };

/** Step 1/3 — device. Brand → series → model, with model search. */
export function DevicePicker({ brands, initial }: { brands: Brand[]; initial?: { brand?: string; model?: string } }) {
  const router = useRouter();
  const [tab, setTab] = useState<"phone" | "laptop" | "tablet">("phone");
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [series, setSeries] = useState("");
  const [q, setQ] = useState("");
  const [cb, setCb] = useState("");
  const [cm, setCm] = useState("");

  const current = brands.find((b) => b.name === brand);
  const seriesList = useMemo(() => [...new Set((current?.models ?? []).map(seriesOf))], [current]);
  const showSeries = seriesList.length > 0 && seriesList.length < (current?.models.length ?? 0);
  const models = (current?.models ?? []).filter((m) => !showSeries || !series || seriesOf(m) === series);
  const hits = q.trim().length >= 2 ? brands.flatMap((b) => b.models.filter((m) => `${b.name} ${m}`.toLowerCase().includes(q.trim().toLowerCase())).map((m) => ({ brand: b.name, model: m }))).slice(0, 12) : [];
  const isOther = brand === OTHER;
  const ready = isOther ? cb.trim().length > 1 && cm.trim().length > 1 : Boolean(brand && model);

  const go = () => {
    const p = new URLSearchParams({ brand: isOther ? OTHER : brand, model: isOther ? OTHER : model });
    if (isOther) { p.set("cb", cb.trim()); p.set("cm", cm.trim()); }
    router.push(`/repair/book/issue?${p.toString()}`);
  };

  const tabs = [{ k: "phone" as const, l: "Phone", I: Smartphone }, { k: "laptop" as const, l: "Laptop", I: Laptop }, { k: "tablet" as const, l: "Tablet", I: Tablet }];

  return (
    <div className="repair-ui pb-40">
      <BookTopBar backHref="/repair">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <label htmlFor="model-search" className="sr-only">Search your phone model</label>
          <input id="model-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your phone model" className={`${field} pl-11`} autoComplete="off" />
        </div>
      </BookTopBar>
      <p className="bg-gradient-to-r from-navy-900 to-blue-500 px-4 py-3 text-center text-sm font-medium text-white md:text-base">Quote first. <strong className="text-gold-400">You approve</strong> before any repair starts.</p>

      <div className="mx-auto max-w-[1360px] px-4 md:px-10">
        {hits.length > 0 && (
          <ul aria-label="Search results" className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface">
            {hits.map((h) => (
              <li key={h.brand + h.model}><button type="button" onClick={() => { setBrand(h.brand); setModel(h.model); setSeries(seriesOf(h.model)); setQ(""); }} className="flex min-h-12 w-full cursor-pointer items-center justify-between px-4 text-left hover:bg-surface-2"><span className="font-semibold">{h.model}</span><span className="text-sm text-muted">{h.brand}</span></button></li>
            ))}
          </ul>
        )}
        {q.trim().length >= 2 && hits.length === 0 && <p className="mt-4 rounded-xl bg-gold-100 p-3 text-sm">No match. Use <button type="button" onClick={() => { setBrand(OTHER); setQ(""); }} className="cursor-pointer font-bold underline">My phone isn’t listed</button> to enter it yourself.</p>}

        <div role="tablist" aria-label="Device type" className="mt-4 grid grid-cols-3">
          {tabs.map((t, i) => (
            <button key={t.k} role="tab" aria-selected={tab === t.k} onClick={() => setTab(t.k)} className={`flex h-[70px] cursor-pointer flex-col items-center justify-center gap-1 border border-b-0 border-blue-500/60 text-sm font-semibold ${i === 0 ? "rounded-tl-[32px]" : ""} ${i === 2 ? "rounded-tr-[32px]" : ""} ${tab === t.k ? "bg-gradient-to-b from-blue-500/10 to-surface text-blue-400" : "text-muted"}`}><t.I className="h-5 w-5" aria-hidden="true" />{t.l}</button>
          ))}
        </div>

        {tab !== "phone" ? (
          <div className="mt-6 rounded-2xl bg-surface-2 p-6">
            <p className="text-lg font-bold">{tab === "laptop" ? "Laptop" : "Tablet"} repairs aren’t bookable online yet.</p>
            <p className="mt-1 text-muted">Message us the model and the problem and we’ll tell you what’s possible.</p>
            <a href={whatsappLink(`Hi FixSure, I need a ${tab} repair.`)} rel="noopener" className="mt-4 inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-navy-800 to-blue-500 px-6 font-bold text-white"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask on WhatsApp</a>
          </div>
        ) : (
          <>
            <h2 className="mt-8 border-b border-line pb-2 text-sm font-bold uppercase tracking-wide text-muted">Select Brand</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {brands.map((b) => (
                <li key={b.name}><button type="button" aria-pressed={brand === b.name} onClick={() => { setBrand(b.name); setModel(""); setSeries(""); }} className={`flex h-28 w-full cursor-pointer items-center justify-center rounded-2xl border bg-surface px-2 text-center text-lg font-extrabold transition ${brand === b.name ? "border-blue-500 text-ink shadow-md ring-2 ring-blue-500/30" : "border-line text-muted hover:border-blue-500/50"}`}>{b.name}</button></li>
              ))}
              <li><button type="button" aria-pressed={isOther} onClick={() => { setBrand(OTHER); setModel(""); }} className={`flex h-28 w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed bg-surface px-2 text-center font-bold ${isOther ? "border-blue-500 text-ink ring-2 ring-blue-500/30" : "border-line text-muted"}`}>My phone isn’t listed</button></li>
            </ul>

            {isOther && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div><label htmlFor="cb" className="mb-1 block text-sm font-semibold">Brand</label><input id="cb" value={cb} onChange={(e) => setCb(e.target.value)} className={field} placeholder="e.g. Realme" maxLength={40} /></div>
                <div><label htmlFor="cm" className="mb-1 block text-sm font-semibold">Model</label><input id="cm" value={cm} onChange={(e) => setCm(e.target.value)} className={field} placeholder="e.g. Narzo 60" maxLength={60} /></div>
                <p className="text-xs text-muted sm:col-span-2">We’ll confirm we can repair your model after diagnosis.</p>
              </div>
            )}

            {current && showSeries && (
              <>
                <h2 className="mt-8 border-b border-line pb-2 text-sm font-bold uppercase tracking-wide text-muted">Select Series</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {seriesList.map((s) => <li key={s}><button type="button" aria-pressed={series === s} onClick={() => { setSeries(s); setModel(""); }} className={`h-11 cursor-pointer rounded-full border bg-surface px-6 text-sm font-medium ${series === s ? "border-blue-500 text-blue-400 ring-1 ring-blue-500" : "border-line"}`}>{s}</button></li>)}
                </ul>
              </>
            )}

            {current && (
              <>
                <h2 className="mt-8 border-b border-line pb-2 text-sm font-bold uppercase tracking-wide text-muted">Select Model</h2>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {models.map((m) => (
                    <li key={m}><button type="button" aria-pressed={model === m} onClick={() => setModel(m)} className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border bg-surface p-2 text-center text-sm font-medium ${model === m ? "border-blue-500 ring-2 ring-blue-500/30" : "border-line hover:border-blue-500/50"}`}>
                      <DeviceArt kind="phone" className="h-16 w-20 rounded-lg" />{m}
                    </button></li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted">Listing a model does not guarantee we stock its parts. We confirm after diagnosis.</p>
              </>
            )}
          </>
        )}
      </div>
      <StepBar step={1} label={ready ? "Select issue in next step" : "Choose your model"} disabled={!ready || tab !== "phone"} onClick={go} />
    </div>
  );
}

const ART: Record<string, "screen" | "battery" | "charge" | "glass" | "camera" | "phone"> = { screen: "screen", battery: "battery", port: "charge", back: "glass", camera: "camera" };

/** Step 2/3 — issues. Search, category chips and Add cards (one repair per booking). */
export function IssuePicker({ services, deviceLabel, params, backHref }: { services: RepairServiceItem[]; deviceLabel: string; params: string; backHref: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | "common" | "advanced">("all");
  const [picked, setPicked] = useState("");
  const list = services.filter((s) => (cat === "all" || s.category === cat) && (!q.trim() || `${s.name} ${s.description}`.toLowerCase().includes(q.trim().toLowerCase())));
  const go = () => router.push(`/repair/book/details?${params}${picked === "own" ? "&own=1" : `&service=${encodeURIComponent(picked)}`}`);

  return (
    <div className="repair-ui pb-40">
      <BookTopBar backHref={backHref}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <label htmlFor="issue-search" className="sr-only">Search issues</label>
          <input id="issue-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search issues" className={`${field} pl-11`} autoComplete="off" />
        </div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {([["all", "All repairs"], ["common", "Common"], ["advanced", "Advanced"]] as const).map(([k, l]) => (
            <button key={k} type="button" aria-pressed={cat === k} onClick={() => setCat(k)} className={`h-10 shrink-0 cursor-pointer rounded-lg border px-4 text-sm font-medium ${cat === k ? "border-blue-500 bg-surface-2 text-blue-400" : "border-line bg-surface"}`}>{l}</button>
          ))}
        </div>
      </BookTopBar>
      <div className="mx-auto max-w-[1360px] px-4 pt-4 md:px-10">
        <p className="text-sm text-muted">Repairing: <strong className="text-ink">{deviceLabel}</strong></p>
        <ul className="mt-3 space-y-4">
          {list.map((s) => {
            const on = picked === s.slug;
            return (
              <li key={s.id} className={`flex items-stretch justify-between gap-4 rounded-2xl border bg-surface p-5 shadow-sm ${on ? "border-blue-500 ring-2 ring-blue-500/20" : "border-line"}`}>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h3 className="text-xl font-bold">{s.name}</h3>
                  <p className="mt-2"><span className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-semibold">{s.doorstepAvailable ? "At-home repair" : "Quote after diagnosis"}</span></p>
                  <p className="mt-2 border-b border-dashed border-line pb-2 text-sm text-muted">{s.description}</p>
                  <p className="mt-auto pt-3 text-sm font-semibold text-blue-400">{s.startingPricePaise != null ? `Starting at ${formatINR(s.startingPricePaise)} (estimate)` : "Price confirmed after diagnosis"}{s.durationText ? ` · ${s.durationText}` : ""}</p>
                </div>
                <div className="flex w-36 shrink-0 flex-col items-center justify-between gap-2 sm:w-44">
                  <DeviceArt kind={ART[s.iconKey] ?? "phone"} className="h-28 w-full rounded-xl object-cover sm:h-32" />
                  <button type="button" aria-pressed={on} onClick={() => setPicked(on ? "" : s.slug)} className={`inline-flex h-10 w-28 cursor-pointer items-center justify-center gap-1 rounded-lg border border-blue-500 font-bold ${on ? "bg-blue-500 text-white" : "bg-surface text-blue-600 hover:bg-surface-2"}`}>
                    {on ? <><Check className="h-4 w-4" aria-hidden="true" /> Added</> : "Add"}<span className="sr-only"> {s.name}</span>
                  </button>
                </div>
              </li>
            );
          })}
          {list.length === 0 && <li className="rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-muted">No matching repair. Choose “Something else” below to describe it.</li>}
          <li className={`flex items-center justify-between gap-4 rounded-2xl border bg-surface p-5 ${picked === "own" ? "border-blue-500 ring-2 ring-blue-500/20" : "border-line"}`}>
            <div><h3 className="text-xl font-bold">Something else / not sure</h3><p className="mt-1 text-sm text-muted">Describe the problem in your own words and we’ll diagnose it.</p></div>
            <button type="button" aria-pressed={picked === "own"} onClick={() => setPicked(picked === "own" ? "" : "own")} className={`h-10 w-28 shrink-0 cursor-pointer rounded-lg border border-blue-500 font-bold ${picked === "own" ? "bg-blue-500 text-white" : "text-blue-600"}`}>{picked === "own" ? "Added" : "Add"}<span className="sr-only"> something else, describe the problem</span></button>
          </li>
        </ul>
        <p className="mt-4 text-xs text-muted">One repair per booking for now. Need more? Mention it in the details and we’ll include it in your quotation.</p>
      </div>
      <StepBar step={2} label={picked ? "Add details in next step" : "Choose a repair"} disabled={!picked} onClick={go} />
    </div>
  );
}
