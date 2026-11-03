import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Phone, ShieldCheck, Truck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { ProductVisual } from "@/components/ui/product-visual";
import { ProductCard, CONDITION_LABEL } from "@/components/shop/product-card";
import { CompatBadge } from "@/components/shop/compat-badge";
import { getCatalog } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { site, whatsappLink } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getCatalog().productBySlug((await params).slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.name, description: product.description.slice(0, 155), type: "website" },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const catalog = getCatalog();
  const product = await catalog.productBySlug(slug);
  if (!product) notFound();

  const [categories, brands, related, compat] = await Promise.all([
    catalog.categories(), catalog.brands(), catalog.related(product, 4), catalog.compatibilityForProduct(product.id),
  ]);
  const category = categories.find((c) => c.id === product.categoryId);
  const brand = brands.find((b) => b.id === product.brandId);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const brandById = new Map(brands.map((b) => [b.id, b]));
  const hasDiscount = product.mrpPaise != null && product.mrpPaise > product.pricePaise;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        sku: product.sku,
        description: product.description,
        brand: brand ? { "@type": "Brand", name: brand.name } : undefined,
        itemCondition: product.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition",
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: (product.pricePaise / 100).toFixed(2),
          availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: `${site.url}/product/${product.slug}`,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${site.url}/shop` },
          { "@type": "ListItem", position: 3, name: product.name },
        ],
      },
    ],
  };

  const enquiry = whatsappLink(`Hi FixSure, I'd like to order: ${product.name} (SKU ${product.sku}).`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:underline">Home</Link> / <Link href="/shop" className="hover:underline">Shop</Link>
        {category && <> / <Link href={`/shop?category=${category.slug}`} className="hover:underline">{category.name}</Link></>}
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductVisual categorySlug={category?.slug ?? ""} label={product.name} className="aspect-square rounded-2xl border border-line" />

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">{brand?.name} · {CONDITION_LABEL[product.condition]}</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-ink">{product.name}</h1>
          <p className="mt-2 text-sm text-muted">SKU {product.sku}{product.oemNumbers.length > 0 && <> · OEM {product.oemNumbers.join(", ")}</>}</p>

          <p className="mt-5 text-3xl font-extrabold text-ink">
            {formatINR(product.pricePaise)}
            {hasDiscount && <span className="ml-3 text-base font-medium text-muted line-through">{formatINR(product.mrpPaise!)}</span>}
          </p>
          <p className="mt-1 text-xs text-muted">Tax and shipping are calculated at checkout.</p>
          <p className={`mt-3 text-sm font-semibold ${product.inStock ? "text-success" : "text-danger"}`}>{product.inStock ? "In stock" : "Currently out of stock"}</p>

          <p className="mt-5 leading-7 text-ink/90">{product.description}</p>

          <div className="mt-6 rounded-xl border border-line bg-surface p-5">
            <h2 className="font-bold">{site.features.onlineCheckout ? "Order" : "Order by WhatsApp or phone"}</h2>
            <p className="mt-1 text-sm text-muted">
              Online checkout is not open yet. Message or call us with the SKU and we will confirm availability and arrange payment and delivery.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <ButtonLink href={enquiry} variant="primary" rel="noopener"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Order on WhatsApp</ButtonLink>
              <ButtonLink href={`tel:+91${site.phone}`} variant="outline"><Phone className="h-4 w-4" aria-hidden="true" /> Call {site.phone}</ButtonLink>
            </div>
          </div>

          <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-ink" aria-hidden="true" />
              {product.warrantyMonths ? `${product.warrantyMonths}-month warranty (terms apply)` : "Warranty: see warranty policy"}</li>
            <li className="flex items-start gap-2"><Truck className="mt-0.5 h-4 w-4 text-ink" aria-hidden="true" />
              <Link href="/policies/shipping" className="underline">Shipping information</Link> · <Link href="/policies/returns" className="underline">Returns</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="spec-h">
          <h2 id="spec-h" className="text-xl font-extrabold text-ink">Specifications</h2>
          {product.specs.length ? (
            <dl className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
              {product.specs.map((s) => (
                <div key={s.key} className="grid grid-cols-2 gap-4 px-4 py-3 text-sm"><dt className="font-semibold text-muted">{s.key}</dt><dd>{s.value}</dd></div>
              ))}
            </dl>
          ) : <p className="mt-4 text-sm text-muted">No specifications listed.</p>}
        </section>

        <section aria-labelledby="compat-h">
          <h2 id="compat-h" className="text-xl font-extrabold text-ink">Compatibility</h2>
          <p className="mt-1 text-sm text-muted">Only devices we have on record are listed. If yours is not here, it is <strong>not verified</strong> — check the part number or ask us first.</p>
          {compat.length ? (
            <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
              {compat.map((c) => (
                <li key={c.model.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold">{c.model.manufacturer} {c.model.series} {c.model.model}</p>
                    {c.note && <p className="mt-0.5 text-xs text-muted">{c.note}</p>}
                  </div>
                  <CompatBadge status={c.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-line bg-surface p-5 text-sm text-muted">No compatibility records yet. <Link href="/finder" className="font-semibold text-blue-400 underline">Ask us to identify your part</Link>.</p>
          )}
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-14" aria-labelledby="rel-h">
          <h2 id="rel-h" className="text-xl font-extrabold text-ink">Related products</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} category={catById.get(p.categoryId)} brand={brandById.get(p.brandId)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
