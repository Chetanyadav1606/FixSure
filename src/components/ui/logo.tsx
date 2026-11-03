import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Shield icon. SWAPPABLE: set `site.logo.iconSrc` in src/config/site.ts to a transparent image
 * (e.g. "/images/logo-icon.png" cut from the original logo) and it replaces this drawn shield everywhere.
 */
export function Emblem({ className }: { dark?: boolean; className?: string }) {
  if (site.logo.iconSrc) {
    return <Image src={site.logo.iconSrc} alt="" width={120} height={120} className={cn("object-contain", className)} aria-hidden="true" />;
  }
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className} focusable="false">
      <defs>
        <linearGradient id="fs-blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#00a3ff" /><stop offset="1" stopColor="#1e4fd6" /></linearGradient>
        <linearGradient id="fs-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd75a" /><stop offset="1" stopColor="#ff9f1c" /></linearGradient>
      </defs>
      <path d="M60 4 106 20v38c0 27-19 47-46 58C33 105 14 85 14 58V20Z" fill="url(#fs-gold)" />
      <path d="M60 12 98 26v32c0 22-16 40-38 50C38 98 22 80 22 58V26Z" fill="#05070d" />
      <path d="M60 18 92 30v28c0 19-13 34-32 43C41 92 28 77 28 58V30Z" fill="url(#fs-blue)" />
      {/* handshake, simplified */}
      <path d="M36 62 50 50l10 6 10-6 14 12-8 8-8-6-8 8-8-6-8 6z" fill="#fff" opacity="0.95" />
      <path d="M50 50 60 44l10 6" stroke="url(#fs-gold)" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Wordmark: live text so the distorted "e" in the artwork never shows. */
export function Wordmark({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  return (
    <span className={cn("flex flex-col items-start leading-none", className)}>
      <span className={cn("font-[family-name:var(--font-display)] font-extrabold italic tracking-tight", size === "lg" ? "text-4xl" : "text-2xl")}>
        <span className="text-blue-400">Fix</span><span className="text-gold-400">Sure</span>
      </span>
      <span className="mt-1 rounded-sm bg-gradient-to-r from-[#8e99ab] via-[#e6ebf2] to-[#8e99ab] px-1.5 py-px text-[9px] font-extrabold tracking-[0.28em] text-[#05070d]">{site.badge}</span>
    </span>
  );
}

export function Logo({ className }: { dark?: boolean; tagline?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="FixSure Professor — home" className={cn("inline-flex items-center gap-2.5", className)}>
      <Emblem className="h-11 w-11 shrink-0 drop-shadow-[0_0_10px_rgba(30,107,255,0.45)]" />
      <Wordmark />
    </Link>
  );
}

/** Gold-line "wings" divider echoing the PROFESSOR banner. */
export function WingsDivider({ label = site.motto, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("mx-auto flex max-w-3xl items-center gap-3 px-4 py-10", className)} role="separator" aria-label={label}>
      <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-400/70 to-gold-400" />
      <svg viewBox="0 0 24 28" aria-hidden="true" className="h-6 w-5 text-gold-400"><path d="M12 1 23 5v9c0 6-5 11-11 13C6 25 1 20 1 14V5Z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      <span className="text-xs font-bold tracking-[0.3em] text-gold-400">{label}</span>
      <svg viewBox="0 0 24 28" aria-hidden="true" className="h-6 w-5 text-gold-400"><path d="M12 1 23 5v9c0 6-5 11-11 13C6 25 1 20 1 14V5Z" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-l from-transparent via-gold-400/70 to-gold-400" />
    </div>
  );
}
