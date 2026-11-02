import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About FixSure", description: "FixSure supplies computer parts and components and repairs laptops, desktops and phones in Mumbai, Navi Mumbai and Thane.", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <PageShell title="About FixSure" intro="Your reliable fix: the right part, or the right repair, from one place.">
      <p>FixSure combines two things people usually have to look for separately: genuine-grade computer parts and components, and technicians who can fit and repair them. Whether you are a customer with a broken laptop screen or a repair shop restocking, the goal is the same: the correct part, honestly described, and a repair you can follow from request to completion.</p>
      <h2>How we work</h2>
      <ul>
        <li><strong>Honest compatibility.</strong> We list a part as compatible with a device only when we have recorded it. Otherwise it is shown as not verified.</li>
        <li><strong>Quote before repair.</strong> We diagnose, tell you the cost, and wait for your approval.</li>
        <li><strong>Clear conditions.</strong> Every product is labelled new, refurbished, OEM-pulled or compatible aftermarket.</li>
      </ul>
      <h2>Where we operate</h2>
      <p>We are based in Mumbai and serve {site.serviceAreas.join(", ")}, with plans to expand across India.</p>
    </PageShell>
  );
}
