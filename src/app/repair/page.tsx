import type { Metadata } from "next";
import { Pillars, CuriousMinds, DeviceSection, FaqSection, InTheNews, Reveal, Testimonials, LandingHero, PromiseBanner, QuestionPanel, SpotlightRow, StepsCarousel, WarrantyBanner } from "@/components/repair/landing";
import { Pricing, Trust } from "@/components/repair/sections";
import { loadRepairCatalog } from "@/lib/repair/catalog";
import { site } from "@/lib/site";
import { WingsDivider } from "@/components/ui/logo";
import { repairContent } from "@/lib/repair/content";

export const metadata: Metadata = {
  title: { absolute: "FixSure Professor | Doorstep Mobile Repair in Mumbai" },
  description: "Professional mobile phone repairs in Mumbai, Navi Mumbai and Thane. Book a FixSure technician, get a clear quote before any work, and track your repair online.",
  alternates: { canonical: "/repair" },
  openGraph: { title: "FixSure Professor | Doorstep Mobile Repair in Mumbai", description: "Quote before any repair. Book a FixSure technician in Mumbai, Navi Mumbai and Thane.", url: "/repair", type: "website", },
  twitter: { card: "summary_large_image", title: "FixSure Professor | Doorstep Mobile Repair in Mumbai" },
};

type SP = Record<string, string | string[] | undefined>;

export default async function RepairPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const device = Array.isArray(sp.device) ? sp.device[0] : sp.device;
  const catalog = await loadRepairCatalog();

  const jsonLd = {
    "@context": "https://schema.org", "@type": "LocalBusiness", name: "FixSure", alternateName: "FixSure Professor", slogan: site.motto,
    url: `${site.url}/repair`, telephone: `+91${site.phone}`, image: `${site.url}/opengraph-image`,
    address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressRegion: "Maharashtra", addressCountry: "IN" },
    areaServed: site.serviceAreas.map((a) => ({ "@type": "City", name: a })),
  };

  return (
    <div className="pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: repairContent.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }) }} />
      <LandingHero />
      <Pillars />
      <DeviceSection brands={catalog.brands} services={catalog.services} initialTab={device} />
      <WingsDivider />
      <Reveal><PromiseBanner /></Reveal>
      <Reveal><SpotlightRow /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><StepsCarousel /></Reveal>
      <WingsDivider label="REPAIR WARRANTY" />
      <Reveal><WarrantyBanner /></Reveal>
      <Reveal><CuriousMinds /></Reveal>
      <Reveal><QuestionPanel /></Reveal>
      <InTheNews />
      <Reveal><Trust /></Reveal>
      <Reveal><Pricing services={catalog.services} /></Reveal>
      <WingsDivider />
      <FaqSection />
    </div>
  );
}
