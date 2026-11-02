import type { Metadata } from "next";
import { Laptop, MessageCircle, Monitor, Phone, Smartphone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Laptop, Desktop & Mobile Repair Services",
  description: "Repair services for laptops, desktops and mobile phones in Mumbai, Navi Mumbai and Thane. Diagnosis first, a clear quote before work begins.",
  alternates: { canonical: "/repair" },
};

const groups = [
  { title: "Laptop repair", Icon: Laptop, items: ["Screen replacement", "Keyboard replacement", "Battery replacement", "Charging issues", "Motherboard repair", "Cooling fan replacement", "SSD & RAM upgrades", "Software installation", "Virus & malware removal"] },
  { title: "Desktop repair", Icon: Monitor, items: ["Hardware troubleshooting", "Component replacement", "RAM & SSD upgrades", "Power supply repair", "Software troubleshooting"] },
  { title: "Mobile repair", Icon: Smartphone, items: ["Screen replacement", "Battery replacement", "Charging port repair", "Camera repair", "Speaker repair", "Water damage diagnosis", "Software troubleshooting"] },
];

export default function RepairPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 md:text-4xl">Repair services</h1>
      <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
        We diagnose first and quote before any repair begins. Availability varies by service and location, so tell us your device and fault and we will confirm what we can do.
      </p>

      <div className="mt-8 rounded-xl border border-gold-400/50 bg-gold-100 p-5 text-sm leading-6">
        <strong>Online booking and ticket tracking are being finished.</strong> For now, book by WhatsApp or phone and we will log your repair and give you a ticket reference.
        {!site.features.doorstepRepair && " Doorstep pickup is confirmed per area when you contact us."}
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href={whatsappLink("Hi FixSure, I'd like to book a repair.\nDevice & model: \nProblem: ")} rel="noopener"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Book on WhatsApp</ButtonLink>
          <ButtonLink href={`tel:+91${site.phone}`} variant="outline"><Phone className="h-4 w-4" aria-hidden="true" /> Call {site.phone}</ButtonLink>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {groups.map(({ title, Icon, items }) => (
          <section key={title} className="rounded-xl border border-line bg-white p-6" aria-labelledby={`g-${title}`}>
            <Icon className="h-8 w-8 text-navy-900" strokeWidth={1.5} aria-hidden="true" />
            <h2 id={`g-${title}`} className="mt-3 text-lg font-extrabold">{title}</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-ink/90">{items.map((i) => <li key={i}>{i}</li>)}</ul>
          </section>
        ))}
      </div>

      <section className="mt-12" aria-labelledby="proc-h">
        <h2 id="proc-h" className="text-xl font-extrabold text-navy-900">How a repair works</h2>
        <ol className="mt-4 grid gap-4 text-sm md:grid-cols-5">
          {["Requested", "Diagnosis", "Quote for your approval", "Repair & quality check", "Ready & completed"].map((s, i) => (
            <li key={s} className="rounded-lg border border-line bg-white p-4"><span className="text-xs font-bold text-gold-600">Step {i + 1}</span><p className="mt-1 font-semibold">{s}</p></li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted">Diagnostic fees and repair prices are quoted per device and fault. Nothing is charged for repair work you have not approved.</p>
      </section>
    </div>
  );
}
