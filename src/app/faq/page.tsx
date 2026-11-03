import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Frequently Asked Questions", description: "Answers about parts compatibility, repairs, ordering and wholesale at FixSure.", alternates: { canonical: "/faq" } };

const faqs = [
  { q: "How do I know a part fits my device?", a: <>Use the <Link href="/finder">Smart Finder</Link>. We show compatibility only where it is recorded, and label everything else “not verified”. Always compare the part number printed on your original part.</> },
  { q: "What if I can’t identify the part I need?", a: "Send a clear photo of the part and your device model on WhatsApp and a technician will help identify it." },
  { q: "Do you quote before repairing?", a: "Yes. We diagnose first, give you a quote, and only proceed once you approve it." },
  { q: "Do you offer doorstep repair?", a: "Only in areas where we have confirmed capacity. Contact us with your location and we will tell you what is available." },
  { q: "Can I buy online?", a: "Online checkout is being finished. Until then, order by WhatsApp or phone using the product SKU." },
  { q: "Do you supply repair shops?", a: <>Yes. See <Link href="/wholesale">wholesale</Link>. Trade pricing is for verified business accounts.</> },
];

export default function FaqPage() {
  const ld = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.filter((f) => typeof f.a === "string").map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a as string } })),
  };
  return (
    <PageShell title="Frequently asked questions">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="divide-y divide-line rounded-xl border border-line bg-surface">
        {faqs.map((f) => (
          <details key={f.q} className="group p-5">
            <summary className="cursor-pointer list-none font-bold [&::-webkit-details-marker]:hidden">{f.q}</summary>
            <p className="mt-3 text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
