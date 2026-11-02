import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { items } = await getCatalog().products({ pageSize: 48 });
  const statics = ["", "/shop", "/finder", "/repair", "/wholesale", "/about", "/contact", "/faq", "/guides"].map((p) => ({ url: `${site.url}${p}` }));
  const policies = ["shipping", "returns", "refunds", "warranty", "privacy", "terms"].map((s) => ({ url: `${site.url}/policies/${s}` }));
  return [...statics, ...policies, ...items.map((p) => ({ url: `${site.url}/product/${p.slug}` }))];
}
