import type { Metadata } from "next";
import Link from "next/link";
import { Camera, MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { CompatBadge } from "@/components/shop/compat-badge";
import { ProductCard } from "@/components/shop/product-card";
import { getCatalog } from "@/lib/catalog";
import { lookupByPartNumber, modelLabel, partsForModel, searchModels } from "@/lib/compat";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Smart Compatibility Finder",
  description: "Find parts for your laptop, desktop or phone by model or part number. Compatibility is shown only where it has been recorded.",
  alternates: { canonical: "/finder" },
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function FinderPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = (one(sp.q) ?? "").trim().slice(0, 80);
  const modelId = one(sp.model);

  const catalog = getCatalog();
  const [models, records, { items: allProducts }, categories, brands] = await Promise.all([
    catalog.deviceModels(), catalog.compatibility(), catalog.products({ pageSize: 48 }), catalog.categories(), catalog.brands(),
  ]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const brandById = new Map(brands.map((b) => [b.id, b]));

  const matches = q ? searchModels(models, q) : [];
  const selected = models.find((m) => m.id === modelId) ?? (matches.length === 1 ? matches[0] : undefined);
  const partResults = selected ? partsForModel(selected.id, records, allProducts) : [];
  const partNumberHits = q ? lookupByPartNumber(allProducts, q) : [];
  const nothing = q && matches.length === 0 && partNumberHits.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-navy-900">Smart Compatibility Finder</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Search by device model, or by an exact SKU / OEM part number. We only list compatibility we have recorded. If a device is not listed it is <strong>not verified</strong>, never assumed compatible.
      </p>

      <form action="/finder" role="search" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="fq" className="sr-only">Device model or part number</label>
          <input id="fq" name="q" list="model-suggestions" defaultValue={q} required minLength={2} autoComplete="off" placeholder="Device model or part number, e.g. HP Pavilion 15" className="h-12 w-full rounded-lg border border-line bg-white px-4 text-sm outline-none focus:border-navy-700" />
          <datalist id="model-suggestions">{models.map((m) => <option key={m.id} value={modelLabel(m)} />)}</datalist>
        </div>
        <button className="h-12 cursor-pointer rounded-lg bg-navy-900 px-6 text-sm font-semibold text-white hover:bg-navy-800">Find parts</button>
      </form>

      {matches.length > 1 && !selected && (
        <section className="mt-8" aria-labelledby="pick-h">
          <h2 id="pick-h" className="font-bold">Which device is yours?</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {matches.map((m) => (
              <li key={m.id}><Link href={`/finder?q=${encodeURIComponent(q)}&model=${m.id}`} className="block rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold hover:border-navy-700">{modelLabel(m)} <span className="font-normal text-muted">· {m.deviceType}</span></Link></li>
            ))}
          </ul>
        </section>
      )}

      {selected && (
        <section className="mt-8" aria-labelledby="res-h">
          <h2 id="res-h" className="text-xl font-extrabold text-navy-900">Parts for {modelLabel(selected)}</h2>
          {partResults.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-line bg-white p-6 text-sm text-muted">No parts recorded for this device yet. That does not mean none exist — send us the details below and we will check.</p>
          ) : (
            <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {partResults.map(({ product, status, note }) => (
                <li key={product.id} className="flex flex-col gap-3">
                  <div><CompatBadge status={status} />{note && <p className="mt-1.5 text-xs text-muted">{note}</p>}</div>
                  <div className="flex-1"><ProductCard product={product} category={catById.get(product.categoryId)} brand={brandById.get(product.brandId)} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {partNumberHits.length > 0 && (
        <section className="mt-8" aria-labelledby="pn-h">
          <h2 id="pn-h" className="text-xl font-extrabold text-navy-900">Exact part-number match</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partNumberHits.map((p) => <ProductCard key={p.id} product={p} category={catById.get(p.categoryId)} brand={brandById.get(p.brandId)} />)}
          </div>
        </section>
      )}

      {nothing && <p className="mt-8 rounded-xl border border-line bg-white p-6 text-sm" role="status">No device or part number matches “{q}”.</p>}

      <section className="mt-12 rounded-2xl bg-navy-50 p-6 md:p-8" aria-labelledby="id-h">
        <h2 id="id-h" className="flex items-center gap-2 text-lg font-extrabold text-navy-900"><Camera className="h-5 w-5" aria-hidden="true" /> Can’t identify your part?</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Send a clear photo of the part (and its label or serial sticker) with your device model. A technician will identify it for you.</p>
        <div className="mt-4"><ButtonLink href={whatsappLink("Hi FixSure, please help me identify a part. Device model: ")} rel="noopener"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Send photo on WhatsApp</ButtonLink></div>
      </section>
    </div>
  );
}
