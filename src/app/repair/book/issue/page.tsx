import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IssuePicker } from "@/components/repair/book-ui";
import { loadRepairCatalog } from "@/lib/repair/catalog";
import { readDevice } from "@/lib/repair/device-params";

export const metadata: Metadata = { title: "Book a Repair — Choose the issue", robots: { index: false } };

export default async function BookIssuePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const dev = readDevice(await searchParams);
  if (!dev) redirect("/repair/book");
  const catalog = await loadRepairCatalog();
  return <IssuePicker services={catalog.services} deviceLabel={`${dev.brandName} ${dev.modelName}`} params={dev.query} backHref={`/repair/book?${new URLSearchParams({ brand: dev.brand, model: dev.model }).toString()}`} />;
}
