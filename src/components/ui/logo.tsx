import Link from "next/link";
import { cn } from "@/lib/utils";

/** Inline emblem so it inherits the site font and never flashes. Geometry matches public/brand/icon*.svg */
export function Emblem({ dark = false, className }: { dark?: boolean; className?: string }) {
  const navy = dark ? "#14398F" : "#0B2A6F";
  const gold = dark ? "#E0B050" : "#C8962E";
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className} focusable="false">
      <path d="M60 5 104 21v37c0 26-19 46-44 56C35 104 16 84 16 58V21Z" fill={navy} />
      <path d="M60 13 96 26v32c0 22-16 39-36 47C40 97 24 80 24 58V26Z" fill="none" stroke={gold} strokeWidth="3" strokeLinejoin="round" />
      <path d="m40 60 14 14" stroke={gold} strokeWidth="10" strokeLinecap="round" />
      <path d="M54 74 82 42" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
      <path d="M6 80C26 106 84 104 114 36 94 76 42 92 6 80Z" fill={gold} />
    </svg>
  );
}

export function Logo({ dark = false, tagline = false, className }: { dark?: boolean; tagline?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="FixSure — home" className={cn("inline-flex items-center gap-2.5", className)}>
      <Emblem dark={dark} className="h-10 w-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-2xl font-extrabold tracking-tight">
          <span className={dark ? "text-white" : "text-navy-900"}>Fix</span>
          <span className={dark ? "text-gold-400" : "text-gold-600"}>Sure</span>
        </span>
        {tagline && (
          <span className={cn("mt-1 text-[10px] font-bold uppercase tracking-[0.2em]", dark ? "text-white/80" : "text-navy-900")}>
            Your Reliable Fix
          </span>
        )}
      </span>
    </Link>
  );
}
