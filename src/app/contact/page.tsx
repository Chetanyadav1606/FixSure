import type { Metadata } from "next";
import { MessageCircle, Phone } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Contact & Support", description: "Contact FixSure by phone or WhatsApp for parts enquiries, repair bookings and support.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return (
    <PageShell title="Contact & support" intro="Talk to us about parts, repairs, orders or wholesale.">
      <div className="flex flex-wrap gap-3">
        <ButtonLink href={whatsappLink("Hi FixSure, ")} rel="noopener"><MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp us</ButtonLink>
        <ButtonLink href={`tel:+91${site.phone}`} variant="outline"><Phone className="h-4 w-4" aria-hidden="true" /> {site.phone}</ButtonLink>
      </div>
      {site.email && <p>Email: <a href={`mailto:${site.email}`}>{site.email}</a></p>}
      <h2>Service area</h2>
      <p>{site.serviceAreas.join(", ")}.</p>
      <h2>Helpful details to include</h2>
      <ul>
        <li>Device make and model (and the part number if you have it)</li>
        <li>What the problem is, and when it started</li>
        <li>Your order number, if this is about an order</li>
      </ul>
    </PageShell>
  );
}
