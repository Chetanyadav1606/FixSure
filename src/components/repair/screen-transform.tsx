"use client";

import { useId, useState } from "react";

/**
 * Custom illustration: drag to compare a cracked screen with a repaired one.
 * It is an illustration, not a photo of a real repair. The range input makes it keyboard/touch accessible.
 */
export function ScreenTransform() {
  const [pos, setPos] = useState(55);
  const id = useId();
  const sx = 24, sw = 212; // screen x / width inside the 260-wide viewBox
  const split = sx + (sw * pos) / 100;

  return (
    <figure className="relative mx-auto w-full max-w-[300px]">
      <svg viewBox="0 0 260 520" role="img" aria-label="Illustration of a smartphone: left side shows a repaired screen, right side shows a cracked one" className="w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]">
        <defs>
          <linearGradient id={`${id}-ok`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4f9bf5" /><stop offset="0.55" stopColor="#1677e8" /><stop offset="1" stopColor="#0b2a6f" /></linearGradient>
          <linearGradient id={`${id}-bad`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1b2133" /><stop offset="1" stopColor="#0a0d16" /></linearGradient>
          <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a4561" /><stop offset="1" stopColor="#10162a" /></linearGradient>
          <clipPath id={`${id}-screen`}><rect x={sx} y="26" width={sw} height="468" rx="30" /></clipPath>
          <clipPath id={`${id}-left`}><rect x="0" y="0" width={split} height="520" /></clipPath>
        </defs>

        <rect x="6" y="6" width="248" height="508" rx="44" fill={`url(#${id}-body)`} />
        <rect x="12" y="12" width="236" height="496" rx="38" fill="#05070d" />

        {/* cracked (full) */}
        <g clipPath={`url(#${id}-screen)`}>
          <rect x={sx} y="26" width={sw} height="468" fill={`url(#${id}-bad)`} />
          <g stroke="#cfd8ee" strokeLinecap="round" fill="none" opacity="0.85">
            <path d="M170 60 L150 150 L118 205 L128 290 L92 360 L104 440" strokeWidth="1.6" />
            <path d="M150 150 L205 185 L226 250" strokeWidth="1.2" />
            <path d="M118 205 L60 228 L40 300" strokeWidth="1.2" />
            <path d="M128 290 L190 322 L214 400" strokeWidth="1.1" />
            <path d="M92 360 L50 392 L36 450" strokeWidth="1" />
            <path d="M150 150 L138 112 L98 90" strokeWidth="0.9" opacity="0.8" />
            <path d="M118 205 L146 232 L178 238" strokeWidth="0.8" opacity="0.7" />
          </g>
          <path d="M150 150 L205 185 L226 250 L168 232 Z" fill="#fff" opacity="0.05" />
          <path d="M118 205 L60 228 L128 290 Z" fill="#fff" opacity="0.04" />
        </g>

        {/* repaired (left of divider) */}
        <g clipPath={`url(#${id}-left)`}>
          <g clipPath={`url(#${id}-screen)`}>
            <rect x={sx} y="26" width={sw} height="468" fill={`url(#${id}-ok)`} />
            <text x="130" y="150" textAnchor="middle" fontSize="64" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif" opacity="0.95">10:24</text>
            <text x="130" y="180" textAnchor="middle" fontSize="13" fill="#fff" opacity="0.8" fontFamily="system-ui, sans-serif">Screen restored</text>
            <rect x="44" y="260" width="172" height="58" rx="16" fill="#fff" opacity="0.16" />
            <rect x="44" y="330" width="82" height="82" rx="20" fill="#fff" opacity="0.16" />
            <rect x="134" y="330" width="82" height="82" rx="20" fill="#e0b050" opacity="0.5" />
            <rect x="98" y="478" width="64" height="5" rx="2.5" fill="#fff" opacity="0.8" />
          </g>
        </g>

        {/* divider */}
        <line x1={split} y1="26" x2={split} y2="494" stroke="#fff" strokeWidth="2" opacity="0.9" />
        <circle cx={split} cy="260" r="14" fill="#fff" />
        <path d={`M${split - 3} 255 l-5 5 l5 5 M${split + 3} 255 l5 5 l-5 5`} stroke="#0b2a6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="96" y="32" width="68" height="18" rx="9" fill="#05070d" />
      </svg>

      <figcaption className="mt-3">
        <label htmlFor={`${id}-range`} className="sr-only">Compare cracked and repaired screen</label>
        <input
          id={`${id}-range`}
          type="range"
          min={5}
          max={95}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="h-11 w-full cursor-ew-resize accent-gold-400"
        />
        <p className="text-center text-xs text-white/60">Drag to compare · illustration</p>
      </figcaption>
    </figure>
  );
}
