import type { CompatRecord, DeviceModel } from "../compat";
import type { Paise } from "../money";

export type DeviceKind = "laptop" | "desktop" | "mobile" | "accessory";

export type Category = {
  id: string;
  slug: string;
  name: string;
  deviceType: DeviceKind;
  description: string;
};

export type Brand = { id: string; slug: string; name: string };

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brandId: string;
  categoryId: string;
  description: string;
  condition: "new" | "refurbished" | "oem_pulled" | "compatible_aftermarket";
  pricePaise: Paise;
  mrpPaise: Paise | null; // only set when a genuine MRP exists; never invented
  warrantyMonths: number | null;
  oemNumbers: string[];
  specs: { key: string; value: string }[];
  featured: boolean;
  popular: boolean;
  /** Public availability. Raw stock counts are never exposed to the browser. */
  inStock: boolean;
};

export type ProductQuery = {
  q?: string;
  category?: string;
  device?: DeviceKind;
  brand?: string;
  minPaise?: number;
  maxPaise?: number;
  inStockOnly?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "name";
  page?: number;
  pageSize?: number;
};

export type ProductPage = { items: Product[]; total: number; page: number; pageSize: number };

/** Storefront data access. Swap implementations (seed ↔ Supabase) without touching pages. */
export interface CatalogRepository {
  readonly source: "sample" | "supabase";
  categories(): Promise<Category[]>;
  brands(): Promise<Brand[]>;
  products(query: ProductQuery): Promise<ProductPage>;
  productBySlug(slug: string): Promise<Product | null>;
  productsByIds(ids: string[]): Promise<Product[]>;
  featured(limit?: number): Promise<Product[]>;
  popular(limit?: number): Promise<Product[]>;
  related(product: Product, limit?: number): Promise<Product[]>;
  deviceModels(): Promise<DeviceModel[]>;
  compatibility(): Promise<CompatRecord[]>;
  compatibilityForProduct(productId: string): Promise<{ model: DeviceModel; status: CompatRecord["status"]; note?: string }[]>;
}
