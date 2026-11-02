import type { Metadata } from "next";
import { MessageCircle, Phone } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wholesale Hardware Supply (B2B)",
  description: "Trade supply of laptop, desktop and mobile parts for repair shops, service centres, resellers and IT teams.",
  alternates: { canonical: "/wholesale" },
};

export default function WholesalePage() {
  return (
    <PageShell title="Wholesale supply" intro="Parts and components for repair shops, computer service centres, hardware resellers, IT companies and institutional buyers.">
      <h2>What we can arrange</h2>
      <ul>
        <li>Trade pricing and quantity tiers for approved business accounts</li>
        <li>Bulk quantities and quotations against your part list</li>
        <li>Purchase-order references and GST invoices (give us your GSTIN)</li>
      </ul>
      <p>Business accounts are verified before trade pricing is shown. Credit terms are never automatic and require our explicit approval. The self-service business portal (registration, approvals, bulk SKU and CSV ordering) is still being built, so for now we handle trade enquiries directly.</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <ButtonLink href={whatsappLink("Hi FixSure, wholesale enquiry.\nBusiness name: \nGSTIN: \nParts / quantities: ")} rel="noopener"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Enquire on WhatsApp</ButtonLink>
        <ButtonLink href={`tel:+91${site.phone}`} variant="outline"><Phone className="h-4 w-4" aria-hidden="true" /> Call {site.phone}</ButtonLink>
      </div>
    </PageShell>
  );
}
