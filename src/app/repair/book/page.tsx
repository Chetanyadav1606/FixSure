import type { Metadata } from "next";
import { DevicePicker } from "@/components/repair/book-ui";
import { loadRepairCatalog } from "@/lib/repair/catalog";

export const metadata: Metadata = {
  title: "Book a Repair — Choose your device",
  description: "Choose your phone brand and model to book a FixSure repair.",
  alternates: { canonical: "/repair/book" },
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function BookDevicePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const catalog = await loadRepairCatalog();
  return <DevicePicker brands={catalog.brands} initial={{ brand: one(sp.brand), model: one(sp.model) }} />;
}
