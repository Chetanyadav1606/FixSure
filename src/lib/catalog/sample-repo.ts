import { compact, normalize, type CompatRecord, type DeviceModel } from "../compat";
import * as seed from "./seed";
import type { CatalogRepository, Product, ProductPage, ProductQuery } from "./types";

function matchesText(p: Product, q: string, brandName: string): boolean {
  const tokens = normalize(q).split(" ").filter(Boolean);
  if (!tokens.length) return true;
  const hay = normalize([p.name, p.sku, p.description, brandName, ...p.oemNumbers, ...p.specs.map((s) => s.value)].join(" "));
  const hayC = compact([p.sku, ...p.oemNumbers].join(" "));
  return tokens.every((t) => hay.includes(t)) || hayC.includes(compact(q));
}

export class SampleCatalogRepository implements CatalogRepository {
  readonly source = "sample" as const;

  async categories() { return seed.categories; }
  async brands() { return seed.brands; }

  async products(query: ProductQuery): Promise<ProductPage> {
    const brandName = (id: string) => seed.brands.find((b) => b.id === id)?.name ?? "";
    const cats = new Map(seed.categories.map((c) => [c.id, c]));
    let items = seed.products.filter((p) => {
      const c = cats.get(p.categoryId);
      if (query.category && c?.slug !== query.category) return false;
      if (query.device && c?.deviceType !== query.device) return false;
      if (query.brand && seed.brands.find((b) => b.id === p.brandId)?.slug !== query.brand) return false;
      if (query.minPaise != null && p.pricePaise < query.minPaise) return false;
      if (query.maxPaise != null && p.pricePaise > query.maxPaise) return false;
      if (query.inStockOnly && !p.inStock) return false;
      return query.q ? matchesText(p, query.q, brandName(p.brandId)) : true;
    });
    switch (query.sort) {
      case "price_asc": items = [...items].sort((a, b) => a.pricePaise - b.pricePaise); break;
      case "price_desc": items = [...items].sort((a, b) => b.pricePaise - a.pricePaise); break;
      case "name": items = [...items].sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    const pageSize = Math.min(Math.max(query.pageSize ?? 12, 1), 48);
    const total = items.length;
    const page = Math.min(Math.max(query.page ?? 1, 1), Math.max(Math.ceil(total / pageSize), 1));
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
  }

  async productBySlug(slug: string) { return seed.products.find((p) => p.slug === slug) ?? null; }
  async productsByIds(ids: string[]) { return seed.products.filter((p) => ids.includes(p.id)); }
  async featured(limit = 8) { return seed.products.filter((p) => p.featured).slice(0, limit); }
  async popular(limit = 8) { return seed.products.filter((p) => p.popular).slice(0, limit); }
  async related(product: Product, limit = 4) {
    return seed.products.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, limit);
  }
  async deviceModels(): Promise<DeviceModel[]> { return seed.deviceModels; }
  async compatibility(): Promise<CompatRecord[]> { return seed.compatibility; }
  async compatibilityForProduct(productId: string) {
    return seed.compatibility
      .filter((r) => r.productId === productId)
      .map((r) => ({ model: seed.deviceModels.find((m) => m.id === r.modelId)!, status: r.status, note: r.note }))
      .filter((r) => r.model);
  }
}
