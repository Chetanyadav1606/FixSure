import Link from "next/link";
import { ProductVisual } from "@/components/ui/product-visual";
import { formatINR } from "@/lib/money";
import type { Brand, Category, Product } from "@/lib/catalog";

export const CONDITION_LABEL: Record<Product["condition"], string> = {
  new: "New",
  refurbished: "Refurbished",
  oem_pulled: "OEM pulled",
  compatible_aftermarket: "Compatible aftermarket",
};

export function ProductCard({ product, category, brand }: { product: Product; category?: Category; brand?: Brand }) {
  const hasDiscount = product.mrpPaise != null && product.mrpPaise > product.pricePaise;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-lg">
      <ProductVisual categorySlug={category?.slug ?? ""} label={product.name} className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {brand?.name ?? "—"} · {CONDITION_LABEL[product.condition]}
        </p>
        <h3 className="mt-1 text-sm font-bold leading-snug text-ink">
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 hover:text-navy-700">{product.name}</Link>
        </h3>
        <p className="mt-1 text-xs text-muted">SKU {product.sku}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <p className="text-lg font-extrabold text-navy-900">
            {formatINR(product.pricePaise)}
            {hasDiscount && <span className="ml-2 text-xs font-medium text-muted line-through">{formatINR(product.mrpPaise!)}</span>}
          </p>
          <span className={product.inStock ? "text-xs font-semibold text-success" : "text-xs font-semibold text-danger"}>
            {product.inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
      </div>
    </article>
  );
}
