import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookTopBar } from "@/components/repair/book-ui";
import { BookingWizard } from "@/components/repair/booking-wizard";
import { loadRepairCatalog } from "@/lib/repair/catalog";
import { readDevice } from "@/lib/repair/device-params";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Book a Repair — Your details", robots: { index: false } };

export default async function BookDetailsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const dev = readDevice(sp);
  if (!dev) redirect("/repair/book");
  const own = (Array.isArray(sp.own) ? sp.own[0] : sp.own) === "1";
  const slug = (Array.isArray(sp.service) ? sp.service[0] : sp.service) ?? "";
  const catalog = await loadRepairCatalog();
  if (!own && !catalog.services.some((s) => s.slug === slug)) redirect(`/repair/book/issue?${dev.query}`);

  return (
    <div className="repair-ui pb-16">
      <BookTopBar backHref={`/repair/book/issue?${dev.query}`} />
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <p className="text-sm font-semibold text-blue-400">Step 3/3 · {dev.brandName} {dev.modelName}</p>
        <div className="mt-3">
          <BookingWizard
            preset={{ brand: dev.brand, model: dev.model, customBrand: dev.cb, customModel: dev.cm, serviceSlug: own ? undefined : slug, describeOwn: own }}
            backHref={`/repair/book/issue?${dev.query}`}
            data={{ configured: catalog.configured, brands: catalog.brands, services: catalog.services, slots: catalog.slots, centres: catalog.centres, whatsapp: site.whatsapp }}
          />
        </div>
      </div>
    </div>
  );
}
