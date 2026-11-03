import type { Metadata } from "next";
import { BookingWizard } from "@/components/repair/booking-wizard";
import { FinalCta, Journey, Pricing, RepairHero, Reviews, ServiceGrid, StickyBookCta, Trust } from "@/components/repair/sections";
import { loadRepairCatalog } from "@/lib/repair/catalog";
import { site } from "@/lib/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mobile Repair at Your Doorstep",
  description: "Professional mobile phone repairs in Mumbai, Navi Mumbai and Thane. Book a FixSure technician, get a clear quote before any work, and track your repair online.",
  alternates: { canonical: "/repair" },
};

type SP = Record<string, string | string[] | undefined>;

export default async function RepairPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const service = Array.isArray(sp.service) ? sp.service[0] : sp.service;
  const catalog = await loadRepairCatalog();

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Service", name: "Mobile phone repair", provider: { "@type": "Organization", name: "FixSure", url: site.url },
    areaServed: site.serviceAreas.map((a) => ({ "@type": "City", name: a })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <RepairHero />
      <ServiceGrid services={catalog.services} configured={catalog.configured} />

      <section id="book" className="mx-auto max-w-4xl scroll-mt-44 md:scroll-mt-32 px-4 pt-24" aria-labelledby="book-h">
        <h2 id="book-h" className="text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">Book your repair</h2>
        <p className="mt-2 text-muted">Takes a few minutes. Already booked? <Link href="/repair/track" className="font-semibold text-navy-700 underline">Track your repair</Link>.</p>
        <div className="mt-6">
          <BookingWizard
            initialServiceSlug={service}
            data={{ configured: catalog.configured, brands: catalog.brands, services: catalog.services, slots: catalog.slots, centres: catalog.centres, whatsapp: site.whatsapp }}
          />
        </div>
      </section>

      <Journey />
      <Trust />
      <Pricing services={catalog.services} />
      <Reviews reviews={[]} />
      <FinalCta />
      <div className="h-20 md:hidden" aria-hidden="true" />
      <StickyBookCta />
    </>
  );
}
