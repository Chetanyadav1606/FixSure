"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Building2, Check, Home, ImagePlus, Loader2, MapPin, MessageCircle, Search, Store, Truck, X } from "lucide-react";
import { checkPincode, submitRepairBooking, type PincodeResult } from "@/app/repair/actions";
import { ServiceIcon } from "@/components/repair/service-icon";
import { formatINR } from "@/lib/money";
import { INDIAN_MOBILE } from "@/lib/repair/schema";
import { cn } from "@/lib/utils";

export type WizardData = {
  configured: boolean;
  brands: { name: string; models: string[] }[];
  services: { id: string; slug: string; name: string; description: string; category: "common" | "advanced"; iconKey: string; startingPricePaise: number | null; diagnosticFeePaise: number | null; durationText: string | null; doorstepAvailable: boolean }[];
  slots: { id: string; startsAt: string; endsAt: string; fulfilment: "doorstep" | "pickup" | "store_dropoff"; remaining: number }[];
  centres: { id: string; name: string; address: string; city: string }[];
  whatsapp: string;
};

type Fulfil = "doorstep" | "pickup" | "store_dropoff";
type Place = "home" | "office";
const STEPS = ["Device", "Problem", "Service", "Location", "Time", "Review", "Done"] as const;
const OTHER = "__other__";

const input = "h-12 w-full rounded-lg border border-line bg-surface px-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 aria-[invalid=true]:border-danger";
const label = "mb-1.5 block text-sm font-semibold";

const fmtSlot = (iso: string) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(iso));

export type WizardPreset = { brand: string; model: string; serviceSlug?: string; describeOwn?: boolean; customBrand?: string; customModel?: string };

export function BookingWizard({ data, initialServiceSlug, preset, backHref }: { data: WizardData; initialServiceSlug?: string; preset?: WizardPreset; backHref?: string }) {
  const startService = data.services.find((s) => s.slug === (preset?.serviceSlug ?? initialServiceSlug));
  const minStep = preset ? 2 : 0; // with a preset, device + problem were chosen on the previous pages
  const [step, setStep] = useState(minStep);
  const [brand, setBrand] = useState(preset?.brand ?? "");
  const [customBrand, setCustomBrand] = useState(preset?.customBrand ?? "");
  const [model, setModel] = useState(preset?.model ?? "");
  const [customModel, setCustomModel] = useState(preset?.customModel ?? "");
  const [modelQuery, setModelQuery] = useState("");
  const [serviceId, setServiceId] = useState(startService?.id ?? "");
  const [describeOwn, setDescribeOwn] = useState(preset?.describeOwn ?? false);
  const [issueText, setIssueText] = useState("");
  const [details, setDetails] = useState("");
  const [photos, setPhotos] = useState<{ path: string; name: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [fulfil, setFulfil] = useState<Fulfil | "">("");
  const [place, setPlace] = useState<Place>("home");
  const [line1, setLine1] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState<PincodeResult | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [slotId, setSlotId] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState<{ ticketNumber: string; trackingToken: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const heading = useRef<HTMLHeadingElement>(null);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; } // don't steal focus/scroll on page load
    heading.current?.focus();
  }, [step]);

  const brandName = brand === OTHER ? customBrand.trim() : brand;
  const modelName = model === OTHER || brand === OTHER ? customModel.trim() : model;
  const service = data.services.find((s) => s.id === serviceId);
  const issueSummary = describeOwn ? issueText.trim() : service?.name ?? "";
  const models = useMemo(() => {
    const m = data.brands.find((b) => b.name === brand)?.models ?? [];
    const q = modelQuery.trim().toLowerCase();
    return q ? m.filter((x) => x.toLowerCase().includes(q)) : m;
  }, [data.brands, brand, modelQuery]);
  const slots = data.slots.filter((s) => s.fulfilment === fulfil);
  const needsAddress = fulfil === "doorstep" || fulfil === "pickup";
  const blockedByArea = data.configured && needsAddress && pin !== null && pin.status === "not_served";

  const options: { key: string; fulfil: Fulfil; place?: Place; title: string; blurb: string; Icon: typeof Home; available: boolean; note: string }[] = [
    { key: "home", fulfil: "doorstep", place: "home", title: "Home doorstep repair", blurb: "A technician comes to your home.", Icon: Home,
      available: !data.configured || (service ? service.doorstepAvailable : data.services.some((s) => s.doorstepAvailable)), note: data.configured ? "Not offered for this repair" : "Availability confirmed by our team" },
    { key: "office", fulfil: "doorstep", place: "office", title: "Office doorstep repair", blurb: "A technician comes to your workplace.", Icon: Building2,
      available: !data.configured || (service ? service.doorstepAvailable : data.services.some((s) => s.doorstepAvailable)), note: data.configured ? "Not offered for this repair" : "Availability confirmed by our team" },
    { key: "pickup", fulfil: "pickup", title: "Pickup & drop-off", blurb: "We collect your phone and return it repaired.", Icon: Truck,
      available: !data.configured || true, note: "Subject to your PIN code" },
    { key: "centre", fulfil: "store_dropoff", title: "Service centre visit", blurb: data.centres[0] ? `Visit ${data.centres[0].name}, ${data.centres[0].city}.` : "Bring your phone to our service centre.", Icon: Store,
      available: !data.configured || data.centres.length > 0, note: data.configured ? "No service centre configured yet" : "Address confirmed by our team" },
  ];

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!brandName) e.brand = "Choose your phone brand";
      if (!modelName) e.model = "Choose or enter your model";
    }
    if (s === 1) {
      if (!describeOwn && !service) e.issue = "Choose a repair, or describe the problem yourself";
      if (describeOwn && issueText.trim().length < 3) e.issue = "Tell us what is wrong";
    }
    if (s === 2 && describeOwn && issueText.trim().length < 3) e.issue = "Tell us what is wrong";
    if (s === 2 && !fulfil) e.fulfil = "Choose how you’d like the repair done";
    if (s === 3) {
      if (needsAddress) {
        if (line1.trim().length < 5) e.line1 = "Enter your full address";
        if (!/^[1-9]\d{5}$/.test(pincode)) e.pincode = "Enter a valid 6-digit PIN code";
        if (city.trim().length < 2) e.city = "Enter your city";
        if (blockedByArea) e.pincode = "We don’t serve this PIN code for this option";
      }
      if (name.trim().length < 2) e.name = "Enter your name";
      if (!INDIAN_MOBILE.test(phone.replace(/[\s-]/g, ""))) e.phone = "Enter a valid Indian mobile number";
      if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email";
    }
    if (s === 5 && !consent) e.consent = "Please confirm to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) { setFormError(""); setStep((x) => x + 1); } };
  const back = () => { setErrors({}); setFormError(""); setStep((x) => Math.max(minStep, x - 1)); };

  const verifyPin = (v: string) => {
    setPin(null);
    if (/^[1-9]\d{5}$/.test(v)) checkPincode(v).then((r) => { setPin(r); if (r.status === "served" && r.city && !city) setCity(r.city); });
  };

  async function onPhotos(files: FileList | null) {
    if (!files) return;
    setUploadErr(""); setUploading(true);
    for (const f of Array.from(files).slice(0, 3 - photos.length)) {
      const fd = new FormData(); fd.append("file", f);
      try {
        const r = await fetch("/api/repair/upload", { method: "POST", body: fd });
        const j = await r.json();
        if (!r.ok) { setUploadErr(j.error ?? "Upload failed"); break; }
        setPhotos((p) => [...p, { path: j.path, name: f.name }]);
      } catch { setUploadErr("Upload failed. Check your connection."); break; }
    }
    setUploading(false);
  }

  const summary = [
    `Hi FixSure, I'd like to book a mobile repair.`,
    `Phone: ${brandName} ${modelName}`,
    `Problem: ${issueSummary}${details ? ` (${details})` : ""}`,
    `Service: ${options.find((o) => o.fulfil === fulfil && (o.place ?? place) === (fulfil === "doorstep" ? place : o.place))?.title ?? fulfil}`,
    needsAddress ? `Address: ${line1}${landmark ? `, near ${landmark}` : ""}, ${city} ${pincode}` : "",
    `Name: ${name} · Phone: ${phone}`,
  ].filter(Boolean).join("\n");
  const waHref = `https://wa.me/${data.whatsapp}?text=${encodeURIComponent(summary)}`;

  function submit() {
    if (!validate(5)) return;
    setFormError("");
    startTransition(async () => {
      const r = await submitRepairBooking({
        manufacturer: brandName, model: modelName, serviceId: describeOwn ? "" : serviceId, issueSummary, issueDetails: details,
        photoPaths: photos.map((p) => p.path), fulfilment: fulfil, placeType: fulfil === "doorstep" ? place : "home",
        address: needsAddress ? { line1, landmark, pincode, city } : undefined, slotId, contactName: name, contactPhone: phone, contactEmail: email, consent,
      });
      if (r.ok) { setResult({ ticketNumber: r.ticketNumber, trackingToken: r.trackingToken }); setStep(6); return; }
      setFormError(r.message);
      if (r.code === "validation" && r.fieldErrors) setErrors(r.fieldErrors);
    });
  }

  const card = (selected: boolean, disabled = false) => cn(
    "relative flex w-full cursor-pointer items-start gap-3 rounded-xl border bg-surface p-4 text-left transition",
    selected ? "border-blue-500 ring-2 ring-blue-500/30" : "border-line hover:border-navy-700/40",
    disabled && "cursor-not-allowed opacity-50 hover:border-line");

  return (
    <MotionConfig reducedMotion="user">
      <div className="rounded-2xl border border-line bg-surface shadow-sm">
        <ol className="flex items-center gap-1 overflow-x-auto border-b border-line px-4 py-3 text-xs font-semibold" aria-label="Booking progress">
          {STEPS.map((s, i) => i < minStep ? null : (
            <li key={s} aria-current={i === step ? "step" : undefined} className={cn("flex shrink-0 items-center gap-1.5", i === step ? "text-ink" : i < step ? "text-success" : "text-muted")}>
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[11px]", i === step ? "bg-navy-900 text-white" : i < step ? "bg-success text-white" : "bg-canvas")}>
                {i < step ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn(i === step ? "inline" : "hidden sm:inline")}>{s}</span>
              {i < STEPS.length - 1 && <span aria-hidden="true" className="mx-1 h-px w-3 bg-line sm:w-6" />}
            </li>
          ))}
        </ol>

        <div className="p-5 sm:p-8">
          {!data.configured && step < 6 && (
            <p className="mb-5 rounded-lg border border-gold-400/50 bg-gold-100 p-3 text-sm" role="note">
              Online booking isn’t switched on yet. Fill this in and we’ll send your request to us on WhatsApp.
            </p>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <h3 ref={heading} tabIndex={-1} className="text-2xl font-extrabold text-ink outline-none">
                {["What needs fixing today?", "What’s the problem?", "How should we do it?", "Where and who?", "Choose a time", "Review your booking", "Booking received"][step]}
              </h3>

              {/* 1 — device */}
              {step === 0 && (
                <div className="mt-5">
                  <fieldset>
                    <legend className={label}>Phone brand</legend>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[...data.brands.map((b) => b.name), "Other brand"].map((b) => {
                        const v = b === "Other brand" ? OTHER : b;
                        return (
                          <button key={b} type="button" onClick={() => { setBrand(v); setModel(""); setModelQuery(""); }} aria-pressed={brand === v} className={cn(card(brand === v), "min-h-14 items-center font-bold")}>
                            {b}{brand === v && <Check className="ml-auto h-4 w-4 text-blue-500" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                    {errors.brand && <p className="mt-2 text-sm text-danger" role="alert">{errors.brand}</p>}
                  </fieldset>

                  {brand === OTHER && (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div><label className={label} htmlFor="w-cb">Brand</label><input id="w-cb" className={input} value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} maxLength={60} /></div>
                      <div><label className={label} htmlFor="w-cm">Model</label><input id="w-cm" className={input} value={customModel} onChange={(e) => setCustomModel(e.target.value)} maxLength={80} aria-invalid={!!errors.model} /></div>
                    </div>
                  )}
                  {brand && brand !== OTHER && (
                    <div className="mt-6">
                      <label className={label} htmlFor="w-mq">Search your model</label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                        <input id="w-mq" className={cn(input, "pl-9")} value={modelQuery} onChange={(e) => setModelQuery(e.target.value)} placeholder="e.g. 13" />
                      </div>
                      <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2" role="group" aria-label="Models">
                        {models.map((m) => (
                          <button key={m} type="button" onClick={() => setModel(m)} aria-pressed={model === m} className={cn(card(model === m), "items-center py-3 font-semibold")}>
                            {m}{model === m && <Check className="ml-auto h-4 w-4 text-blue-500" aria-hidden="true" />}
                          </button>
                        ))}
                        <button type="button" onClick={() => setModel(OTHER)} aria-pressed={model === OTHER} className={cn(card(model === OTHER), "items-center py-3 font-semibold")}>My model isn’t listed</button>
                      </div>
                      {models.length === 0 && <p className="mt-2 text-sm text-muted">No listed model matches. Choose “My model isn’t listed”.</p>}
                      {model === OTHER && (
                        <div className="mt-4"><label className={label} htmlFor="w-cm2">Your model</label><input id="w-cm2" className={input} value={customModel} onChange={(e) => setCustomModel(e.target.value)} maxLength={80} aria-invalid={!!errors.model} /></div>
                      )}
                      <p className="mt-3 text-xs text-muted">Listed models are not a guarantee of availability. We confirm parts for your exact model before the repair.</p>
                    </div>
                  )}
                  {errors.model && <p className="mt-2 text-sm text-danger" role="alert">{errors.model}</p>}
                </div>
              )}

              {/* 2 — problem */}
              {step === 1 && (
                <div className="mt-5">
                  <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Repair type">
                    {data.services.map((s) => (
                      <button key={s.id} type="button" onClick={() => { setServiceId(s.id); setDescribeOwn(false); }} aria-pressed={!describeOwn && serviceId === s.id} className={card(!describeOwn && serviceId === s.id)}>
                        <ServiceIcon name={s.iconKey} className="mt-0.5 h-6 w-6 shrink-0 text-ink" />
                        <span><span className="block font-bold">{s.name}</span><span className="block text-sm text-muted">{s.description}</span>
                          {s.startingPricePaise != null && <span className="mt-1 block text-xs font-semibold text-ink">From {formatINR(s.startingPricePaise)} · estimate</span>}</span>
                      </button>
                    ))}
                    <button type="button" onClick={() => { setDescribeOwn(true); setServiceId(""); }} aria-pressed={describeOwn} className={card(describeOwn)}>
                      <span><span className="block font-bold">Something else</span><span className="block text-sm text-muted">Describe the problem in your own words.</span></span>
                    </button>
                  </div>
                  {data.services.length === 0 && <p className="mt-3 text-sm text-muted">No repair services are published yet. Describe the problem and we’ll take it from there.</p>}
                  {describeOwn && (
                    <div className="mt-4"><label className={label} htmlFor="w-issue">Problem in a few words</label><input id="w-issue" className={input} value={issueText} onChange={(e) => setIssueText(e.target.value)} maxLength={120} aria-invalid={!!errors.issue} /></div>
                  )}
                  {errors.issue && <p className="mt-2 text-sm text-danger" role="alert">{errors.issue}</p>}
                  <div className="mt-5">
                    <label className={label} htmlFor="w-details">More details <span className="font-normal text-muted">(optional)</span></label>
                    <textarea id="w-details" className={cn(input, "h-24 py-2")} value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} />
                  </div>
                  {data.configured && (
                    <div className="mt-5">
                      <p className={label}>Photos <span className="font-normal text-muted">(optional, up to 3 · JPG, PNG or WebP · 5 MB each)</span></p>
                      <ul className="mb-2 flex flex-wrap gap-2">
                        {photos.map((p) => (
                          <li key={p.path} className="flex items-center gap-2 rounded-full bg-surface-2 py-1 pl-3 pr-1 text-sm">{p.name}
                            <button type="button" aria-label={`Remove ${p.name}`} onClick={() => setPhotos((x) => x.filter((y) => y.path !== p.path))} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-surface"><X className="h-4 w-4" aria-hidden="true" /></button></li>
                        ))}
                      </ul>
                      {photos.length < 3 && (
                        <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-4 text-sm font-semibold text-ink hover:bg-surface-2">
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />} Add photo
                          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={uploading} onChange={(e) => { onPhotos(e.target.files); e.target.value = ""; }} />
                        </label>
                      )}
                      {uploadErr && <p className="mt-2 text-sm text-danger" role="alert">{uploadErr}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* 3 — service type */}
              {step === 2 && (
                <div className="mt-5">
                  {preset && (
                    <div className="mb-6 space-y-4">
                      <p className="rounded-lg bg-surface-2 p-3 text-sm"><strong>{brandName} {modelName}</strong> · {describeOwn ? "Describe the problem" : service?.name}</p>
                      {describeOwn && (
                        <div><label className={label} htmlFor="w-issue-p">What is wrong?</label><input id="w-issue-p" className={input} value={issueText} onChange={(e) => setIssueText(e.target.value)} maxLength={120} aria-invalid={!!errors.issue} />
                          {errors.issue && <p role="alert" className="mt-1 text-sm text-danger">{errors.issue}</p>}</div>
                      )}
                      <div><label className={label} htmlFor="w-details-p">Anything else we should know? <span className="font-normal text-muted">(optional)</span></label><textarea id="w-details-p" className={cn(input, "h-20 py-2")} value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} /></div>
                    </div>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Service type">
                    {options.map((o) => {
                      const sel = fulfil === o.fulfil && (o.fulfil !== "doorstep" || place === o.place);
                      return (
                        <button key={o.key} type="button" disabled={!o.available} aria-pressed={sel} onClick={() => { setFulfil(o.fulfil); if (o.place) setPlace(o.place); setSlotId(""); }} className={card(sel, !o.available)}>
                          <o.Icon className="mt-0.5 h-6 w-6 shrink-0 text-ink" strokeWidth={1.5} aria-hidden="true" />
                          <span><span className="block font-bold">{o.title}</span><span className="block text-sm text-muted">{o.blurb}</span>
                            <span className="mt-1 block text-xs font-semibold text-ink">{o.available ? o.note : "Not available"}{!o.available && ` — ${o.note}`}</span></span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.fulfil && <p className="mt-2 text-sm text-danger" role="alert">{errors.fulfil}</p>}
                </div>
              )}

              {/* 4 — location + contact */}
              {step === 3 && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {needsAddress && (
                    <>
                      <div className="sm:col-span-2"><label className={label} htmlFor="w-l1">Full address</label><input id="w-l1" autoComplete="street-address" className={input} value={line1} onChange={(e) => setLine1(e.target.value)} maxLength={200} aria-invalid={!!errors.line1} />{errors.line1 && <p className="mt-1 text-sm text-danger" role="alert">{errors.line1}</p>}</div>
                      <div><label className={label} htmlFor="w-lm">Landmark <span className="font-normal text-muted">(optional)</span></label><input id="w-lm" className={input} value={landmark} onChange={(e) => setLandmark(e.target.value)} maxLength={100} /></div>
                      <div><label className={label} htmlFor="w-pin">PIN code</label><input id="w-pin" inputMode="numeric" autoComplete="postal-code" maxLength={6} className={input} value={pincode} onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setPincode(v); verifyPin(v); }} aria-invalid={!!errors.pincode} aria-describedby="w-pin-s" />
                        <p id="w-pin-s" className="mt-1 text-sm" aria-live="polite">
                          {errors.pincode ? <span className="text-danger">{errors.pincode}</span>
                            : pin?.status === "served" ? <span className="text-success">We serve {pin.city} for this option.</span>
                            : pin?.status === "not_served" ? <span className="text-danger">We don’t currently serve this PIN code.</span>
                            : pin?.status === "unconfigured" ? <span className="text-muted">We’ll confirm your area after you send the request.</span> : null}
                        </p></div>
                      <div><label className={label} htmlFor="w-city">City</label><input id="w-city" autoComplete="address-level2" className={input} value={city} onChange={(e) => setCity(e.target.value)} maxLength={60} aria-invalid={!!errors.city} />{errors.city && <p className="mt-1 text-sm text-danger" role="alert">{errors.city}</p>}</div>
                    </>
                  )}
                  {fulfil === "store_dropoff" && data.centres[0] && (
                    <p className="flex items-start gap-2 rounded-lg bg-surface-2 p-3 text-sm sm:col-span-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{data.centres[0].name}, {data.centres[0].address}, {data.centres[0].city}</p>
                  )}
                  <div><label className={label} htmlFor="w-name">Your name</label><input id="w-name" autoComplete="name" className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} aria-invalid={!!errors.name} />{errors.name && <p className="mt-1 text-sm text-danger" role="alert">{errors.name}</p>}</div>
                  <div><label className={label} htmlFor="w-phone">Mobile number</label><input id="w-phone" type="tel" inputMode="tel" autoComplete="tel" className={input} value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={16} aria-invalid={!!errors.phone} />{errors.phone && <p className="mt-1 text-sm text-danger" role="alert">{errors.phone}</p>}</div>
                  <div className="sm:col-span-2"><label className={label} htmlFor="w-email">Email <span className="font-normal text-muted">(optional)</span></label><input id="w-email" type="email" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} aria-invalid={!!errors.email} />{errors.email && <p className="mt-1 text-sm text-danger" role="alert">{errors.email}</p>}</div>
                </div>
              )}

              {/* 5 — appointment */}
              {step === 4 && (
                <div className="mt-5">
                  {slots.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Available appointments">
                      {slots.map((s) => (
                        <button key={s.id} type="button" onClick={() => setSlotId(slotId === s.id ? "" : s.id)} aria-pressed={slotId === s.id} className={cn(card(slotId === s.id), "items-center font-semibold")}>
                          {fmtSlot(s.startsAt)} – {new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(s.endsAt))}
                          {slotId === s.id && <Check className="ml-auto h-4 w-4 text-blue-500" aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-line bg-canvas p-5 text-sm leading-6">
                      No fixed appointment times are published for this option. <strong>Continue and we’ll call you to agree a time.</strong> Nothing is scheduled until we confirm with you.
                    </p>
                  )}
                  {slots.length > 0 && <p className="mt-3 text-xs text-muted">Choose a time, or skip and we’ll call to arrange one.</p>}
                </div>
              )}

              {/* 6 — review */}
              {step === 5 && (
                <div className="mt-5">
                  <dl className="divide-y divide-line rounded-xl border border-line text-sm">
                    {[
                      ["Device", `${brandName} ${modelName}`],
                      ["Problem", issueSummary + (details ? ` — ${details}` : "")],
                      ["Service", options.find((o) => o.fulfil === fulfil && (o.fulfil !== "doorstep" || o.place === place))?.title ?? ""],
                      ...(needsAddress ? [["Address", `${line1}${landmark ? `, near ${landmark}` : ""}, ${city} ${pincode}`]] : []),
                      ["Contact", `${name} · ${phone}${email ? ` · ${email}` : ""}`],
                      ["Appointment", slotId ? fmtSlot(data.slots.find((s) => s.id === slotId)?.startsAt ?? "") : "To be agreed with you by phone"],
                      ["Estimated charges", service?.startingPricePaise != null ? `From ${formatINR(service.startingPricePaise)} (estimate; the final price is in your quotation)` : "Quoted after diagnosis"],
                      ...(service?.diagnosticFeePaise != null ? [["Diagnostic fee", formatINR(service.diagnosticFeePaise)]] : []),
                      ...(photos.length ? [["Photos", `${photos.length} attached`]] : []),
                    ].map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3"><dt className="font-semibold text-muted">{k}</dt><dd>{v}</dd></div>
                    ))}
                  </dl>
                  <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 accent-navy-900" aria-invalid={!!errors.consent} />
                    <span>I confirm these details are correct and agree that FixSure may contact me about this repair. I understand no repair work starts until I approve a quotation, and that I should back up my data.</span>
                  </label>
                  {errors.consent && <p className="mt-1 text-sm text-danger" role="alert">{errors.consent}</p>}
                  {formError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-danger" role="alert">{formError}</p>}
                </div>
              )}

              {/* 7 — done */}
              {step === 6 && result && (
                <div className="mt-5 text-center">
                  <svg viewBox="0 0 52 52" className="mx-auto h-20 w-20" aria-hidden="true">
                    <circle cx="26" cy="26" r="24" fill="none" stroke="#067647" strokeWidth="3" />
                    <motion.path d="M15 27l8 8 15-17" fill="none" stroke="#067647" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.15 }} />
                  </svg>
                  <p className="mt-4 text-sm text-muted">Your repair ticket</p>
                  <p className="text-3xl font-extrabold tracking-wide text-ink" data-testid="ticket-number">{result.ticketNumber}</p>
                  <p className="mt-3 text-sm">Tracking key (keep it private): <code className="rounded bg-canvas px-2 py-1 font-mono text-xs">{result.trackingToken}</code></p>
                  <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">Save your ticket number. You can track with it plus the phone number you gave us. Our team will contact you to confirm the booking — it is not scheduled until we do.</p>
                  <Link href={`/repair/track?ticket=${encodeURIComponent(result.ticketNumber)}`} className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-navy-900 px-6 font-semibold text-white hover:bg-navy-800">Track this repair <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step < 6 && (
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
              {step === minStep && backHref
                ? <a href={backHref} className="inline-flex h-12 items-center gap-2 rounded-lg px-4 font-semibold text-ink hover:bg-surface-2"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back</a>
                : <button type="button" onClick={back} disabled={step === 0} className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg px-4 font-semibold text-ink hover:bg-surface-2 disabled:invisible"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back</button>}
              {step < 5 && <button type="button" onClick={next} className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg bg-navy-900 px-6 font-semibold text-white hover:bg-navy-800">{step === 4 && !slotId ? "Continue without a time" : "Next"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>}
              {step === 5 && data.configured && (
                <button type="button" onClick={submit} disabled={pending} className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg bg-gold-500 px-6 font-bold text-navy-950 hover:bg-gold-400 disabled:opacity-60">
                  {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Confirm booking
                </button>
              )}
              {step === 5 && !data.configured && (consent ? (
                <a href={waHref} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-lg bg-gold-500 px-6 font-bold text-navy-950 hover:bg-gold-400">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> Send request on WhatsApp
                </a>
              ) : (
                <button type="button" onClick={() => validate(5)} className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg bg-gold-500 px-6 font-bold text-navy-950 hover:bg-gold-400">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> Send request on WhatsApp
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}
