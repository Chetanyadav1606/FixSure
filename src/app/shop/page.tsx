import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { getCatalog, type DeviceKind, type ProductQuery } from "@/lib/catalog";
import { rupeesToPaise } from "@/lib/money";

export const metadata: Metadata = {
  title: "Shop Computer Parts & Components",
  description: "Browse laptop, desktop and mobile spare parts, components and accessories. Search by name, SKU or OEM number.",
  alternates: { canonical: "/shop" },
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const DEVICES: DeviceKind[] = ["laptop", "desktop", "mobile", "accessory"];
const SORTS = ["relevance", "price_asc", "price_desc", "name"] as const;

function num(v?: string) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? rupeesToPaise(n) : undefined;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const device = DEVICES.find((d) => d === one(sp.device));
  const sort = SORTS.find((s) => s === one(sp.sort)) ?? "relevance";
  const query: ProductQuery = {
    q: one(sp.q)?.slice(0, 80),
    device,
    category: one(sp.category),
    brand: one(sp.brand),
    minPaise: num(one(sp.min)),
    maxPaise: num(one(sp.max)),
    inStockOnly: one(sp.stock) === "1",
    sort,
    page: Number(one(sp.page)) || 1,
    pageSize: 12,
  };

  const catalog = getCatalog();
  const [{ items, total, page, pageSize }, categories, brands] = await Promise.all([
    catalog.products(query),
    catalog.categories(),
    catalog.brands(),
  ]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const brandById = new Map(brands.map((b) => [b.id, b]));
  const visibleCats = categories.filter((c) => !device || c.deviceType === device);
  const pages = Math.max(Math.ceil(total / pageSize), 1);

  const href = (over: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const base: Record<string, string | undefined> = {
      q: query.q, device, category: query.category, brand: query.brand,
      min: one(sp.min), max: one(sp.max), stock: query.inStockOnly ? "1" : undefined, sort: sort === "relevance" ? undefined : sort,
    };
    for (const [k, v] of Object.entries({ ...base, ...over })) if (v !== undefined && v !== "") p.set(k, String(v));
    const s = p.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:underline">Home</Link> / <span aria-current="page" className="text-ink">Shop</span>
      </nav>
      <h1 className="mt-3 text-3xl font-extrabold text-navy-900">
        {query.q ? `Results for “${query.q}”` : device ? `${device[0].toUpperCase()}${device.slice(1)} parts` : "All products"}
      </h1>
      <p className="mt-1 text-sm text-muted" aria-live="polite">{total} {total === 1 ? "product" : "products"}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside aria-label="Filters">
          <form action="/shop" className="space-y-5 rounded-xl border border-line bg-white p-5">
            <div>
              <label htmlFor="f-q" className="text-sm font-bold">Search</label>
              <input id="f-q" name="q" defaultValue={query.q} className="mt-1.5 h-10 w-full rounded-lg border border-line px-3 text-sm" />
            </div>
            <div>
              <label htmlFor="f-device" className="text-sm font-bold">Device</label>
              <select id="f-device" name="device" defaultValue={device ?? ""} className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-2 text-sm">
                <option value="">All devices</option>
                {DEVICES.map((d) => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="f-cat" className="text-sm font-bold">Category</label>
              <select id="f-cat" name="category" defaultValue={query.category ?? ""} className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-2 text-sm">
                <option value="">All categories</option>
                {visibleCats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="f-brand" className="text-sm font-bold">Brand</label>
              <select id="f-brand" name="brand" defaultValue={query.brand ?? ""} className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-2 text-sm">
                <option value="">All brands</option>
                {brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
              </select>
            </div>
            <fieldset>
              <legend className="text-sm font-bold">Price (₹)</legend>
              <div className="mt-1.5 flex gap-2">
                <input aria-label="Minimum price" name="min" type="number" min={0} inputMode="numeric" defaultValue={one(sp.min)} placeholder="Min" className="h-10 w-full rounded-lg border border-line px-3 text-sm" />
                <input aria-label="Maximum price" name="max" type="number" min={0} inputMode="numeric" defaultValue={one(sp.max)} placeholder="Max" className="h-10 w-full rounded-lg border border-line px-3 text-sm" />
              </div>
            </fieldset>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="stock" value="1" defaultChecked={query.inStockOnly} className="h-4 w-4 accent-navy-900" /> In stock only
            </label>
            <div>
              <label htmlFor="f-sort" className="text-sm font-bold">Sort by</label>
              <select id="f-sort" name="sort" defaultValue={sort} className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-2 text-sm">
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="h-10 flex-1 cursor-pointer rounded-lg bg-navy-900 text-sm font-semibold text-white hover:bg-navy-800">Apply</button>
              <Link href="/shop" className="inline-flex h-10 items-center rounded-lg border border-line px-3 text-sm font-semibold hover:bg-navy-50">Reset</Link>
            </div>
          </form>
        </aside>

        <section aria-label="Products">
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center">
              <h2 className="text-lg font-bold">No products match your filters</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">Try fewer filters, or tell us the part you need and we will try to source it.</p>
              <div className="mt-5 flex justify-center gap-3 text-sm font-semibold">
                <Link href="/shop" className="text-navy-700 underline">Clear filters</Link>
                <Link href="/finder" className="text-navy-700 underline">Use the Smart Finder</Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((p) => <ProductCard key={p.id} product={p} category={catById.get(p.categoryId)} brand={brandById.get(p.brandId)} />)}
            </div>
          )}

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold">
              {page > 1 && <Link href={href({ page: page - 1 })} rel="prev" className="rounded-lg border border-line bg-white px-4 py-2 hover:bg-navy-50">Previous</Link>}
              <span className="px-3 text-muted">Page {page} of {pages}</span>
              {page < pages && <Link href={href({ page: page + 1 })} rel="next" className="rounded-lg border border-line bg-white px-4 py-2 hover:bg-navy-50">Next</Link>}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
