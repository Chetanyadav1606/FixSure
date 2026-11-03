"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";

/** Service-area menu. Informational: shows where FixSure operates; the exact PIN check happens in booking. */
export function CityMenu({ className = "" }: { className?: string }) {
  return (
    <details className={`group relative ${className}`}>
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <MapPin className="h-4 w-4 text-blue-500" aria-hidden="true" />
        <span><span className="block text-[11px] font-medium text-muted">Serving</span>{site.serviceAreas[0]} &amp; nearby</span>
        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="absolute left-0 top-12 z-50 w-64 rounded-2xl border border-line bg-surface p-4 text-sm shadow-2xl">
        <p className="font-bold">We serve</p>
        <ul className="mt-2 space-y-1.5 text-muted">{site.serviceAreas.map((a) => <li key={a}>{a}</li>)}</ul>
        <p className="mt-3 text-xs text-muted">Availability is checked by PIN code when you book.</p>
        <a href={whatsappLink("Hi FixSure, do you cover my area?")} rel="noopener" className="mt-3 inline-block text-xs font-bold text-blue-400 underline">Ask about your area</a>
      </div>
    </details>
  );
}
