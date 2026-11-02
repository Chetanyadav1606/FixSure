import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Buying Guides", description: "Practical guides for choosing laptop batteries, screens, RAM and storage.", alternates: { canonical: "/guides" } };

export default function GuidesPage() {
  return (
    <PageShell title="Buying guides" intro="Short, practical checklists for choosing the right part.">
      <h2>Choosing a laptop battery</h2>
      <ul>
        <li>Match the part number on your existing battery first; model names alone are not reliable.</li>
        <li>Match voltage; capacity (Wh or mAh) can be equal or higher but should not be lower.</li>
        <li>Check the connector and cell count shown on the label.</li>
      </ul>
      <h2>Choosing a replacement screen</h2>
      <ul>
        <li>Note the size, resolution and connector (for example pin count) printed on the back of the panel.</li>
        <li>Check whether yours is touch or non-touch, and matte or glossy.</li>
      </ul>
      <h2>Upgrading RAM or SSD</h2>
      <ul>
        <li>Find your supported memory generation (DDR3, DDR4, DDR5) and form factor (SO-DIMM for laptops).</li>
        <li>Check whether your storage slot is SATA or NVMe and its physical size.</li>
      </ul>
      <p>Still unsure? <Link href="/finder">Use the Smart Finder</Link> or <Link href="/contact">ask us</Link>.</p>
    </PageShell>
  );
}
