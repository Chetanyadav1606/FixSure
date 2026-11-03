/**
 * Original FixSure illustrations (vector, drawn for this project). They are DEMO artwork,
 * not photographs of real FixSure technicians, customers or repairs, and every place they
 * appear is labelled "Illustration". Replace with real photography when available.
 */
import { useId } from "react";

export function DoorstepScene({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 640 420" role="img" aria-label="Illustration: a FixSure technician repairing a phone for a customer at their front door" className={className}>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7cc4ff" /><stop offset="1" stopColor="#fde9b8" /></linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff8a5b" /><stop offset="1" stopColor="#e0457b" /></linearGradient>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4f9bf5" /><stop offset="1" stopColor="#0b2a6f" /></linearGradient>
      </defs>
      <rect width="640" height="420" rx="28" fill={`url(#${id}s)`} />
      <circle cx="540" cy="80" r="46" fill="#ffd166" opacity="0.9" />
      <ellipse cx="130" cy="70" rx="60" ry="18" fill="#fff" opacity="0.8" /><ellipse cx="175" cy="60" rx="38" ry="14" fill="#fff" opacity="0.8" />
      <ellipse cx="420" cy="110" rx="50" ry="14" fill="#fff" opacity="0.7" />
      {/* building */}
      <rect x="300" y="120" width="300" height="250" rx="10" fill={`url(#${id}w)`} />
      <rect x="300" y="120" width="300" height="26" rx="10" fill="#b3265a" />
      {[0, 1, 2].map((i) => <rect key={i} x={330 + i * 90} y="170" width="56" height="56" rx="8" fill="#ffe9a8" stroke="#fff" strokeWidth="4" />)}
      <rect x="470" y="262" width="76" height="108" rx="8" fill="#0b2a6f" /><circle cx="534" cy="318" r="4" fill="#e0b050" />
      <rect x="0" y="360" width="640" height="60" fill="#2f9e6b" /><rect x="0" y="372" width="640" height="48" fill="#27885c" />
      <circle cx="60" cy="330" r="34" fill="#34b07a" /><rect x="56" y="350" width="8" height="30" fill="#7a4b2a" />
      {/* customer */}
      <circle cx="400" cy="262" r="20" fill="#f1b98a" /><path d="M380 258 q20 -28 40 0 q-8 -6 -20 -6 q-12 0 -20 6z" fill="#3b2a20" />
      <rect x="380" y="284" width="40" height="64" rx="14" fill="#f2c230" /><rect x="384" y="344" width="14" height="30" rx="5" fill="#33415c" /><rect x="402" y="344" width="14" height="30" rx="5" fill="#33415c" />
      {/* technician */}
      <circle cx="200" cy="232" r="24" fill="#c98a5b" /><path d="M176 226 q24 -34 48 0 q-10 -8 -24 -8 q-14 0 -24 8z" fill="#1b1b1b" />
      <path d="M170 262 h60 l10 100 h-80z" fill="#0b2a6f" /><rect x="192" y="270" width="16" height="16" rx="3" fill="#e0b050" />
      <rect x="176" y="356" width="18" height="26" rx="6" fill="#1b2133" /><rect x="206" y="356" width="18" height="26" rx="6" fill="#1b2133" />
      <path d="M232 280 L300 300" stroke="#c98a5b" strokeWidth="14" strokeLinecap="round" />
      {/* phone being repaired */}
      <g transform="rotate(-12 320 300)"><rect x="296" y="268" width="46" height="84" rx="9" fill="#10162a" /><rect x="301" y="275" width="36" height="70" rx="5" fill={`url(#${id}p)`} /><path d="M312 285 l8 20 l-6 18" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8" /></g>
      {/* toolkit */}
      <rect x="150" y="372" width="66" height="30" rx="6" fill="#e0457b" /><rect x="170" y="364" width="26" height="10" rx="4" fill="none" stroke="#9c2456" strokeWidth="4" />
      {/* floating badges */}
      <g><rect x="60" y="110" width="128" height="34" rx="17" fill="#fff" /><circle cx="80" cy="127" r="8" fill="#2f9e6b" /><text x="96" y="132" fontSize="13" fontWeight="700" fill="#0b2a6f" fontFamily="system-ui,sans-serif">Quote first</text></g>
      <g><rect x="440" y="196" width="150" height="34" rx="17" fill="#0b2a6f" /><circle cx="460" cy="213" r="8" fill="#e0b050" /><text x="476" y="218" fontSize="13" fontWeight="700" fill="#fff" fontFamily="system-ui,sans-serif">You approve it</text></g>
    </svg>
  );
}

type Kind = "phone" | "laptop" | "tablet" | "screen" | "battery" | "charge" | "camera" | "glass";

/** Colourful device/service illustration tile. */
export function DeviceArt({ kind, className = "" }: { kind: Kind; className?: string }) {
  const id = useId();
  const g: Record<string, [string, string]> = {
    phone: ["#4f9bf5", "#7c3aed"], laptop: ["#14b8a6", "#0b2a6f"], tablet: ["#f97316", "#e0457b"],
    screen: ["#1677e8", "#06b6d4"], battery: ["#22c55e", "#0e9f6e"], charge: ["#f59e0b", "#ef4444"], camera: ["#a855f7", "#ec4899"], glass: ["#0ea5e9", "#6366f1"],
  };
  const [a, b] = g[kind];
  return (
    <svg viewBox="0 0 240 180" role="img" aria-label={`Illustration: ${kind}`} className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <rect width="240" height="180" rx="20" fill={`url(#${id})`} />
      <circle cx="200" cy="30" r="46" fill="#fff" opacity="0.12" /><circle cx="30" cy="160" r="54" fill="#fff" opacity="0.1" />
      {kind === "laptop" && <g><rect x="52" y="40" width="136" height="88" rx="8" fill="#10162a" /><rect x="58" y="46" width="124" height="76" rx="4" fill="#fff" opacity="0.92" /><rect x="64" y="54" width="60" height="8" rx="4" fill={a} /><rect x="64" y="70" width="100" height="6" rx="3" fill="#cbd5e1" /><rect x="64" y="82" width="80" height="6" rx="3" fill="#cbd5e1" /><path d="M36 134 h168 l-12 14 h-144z" fill="#10162a" /></g>}
      {kind === "tablet" && <g><rect x="62" y="24" width="116" height="132" rx="14" fill="#10162a" /><rect x="68" y="30" width="104" height="120" rx="8" fill="#fff" opacity="0.92" /><circle cx="120" cy="80" r="22" fill={a} opacity="0.85" /><rect x="82" y="112" width="76" height="8" rx="4" fill="#cbd5e1" /><rect x="94" y="128" width="52" height="6" rx="3" fill="#cbd5e1" /></g>}
      {kind !== "laptop" && kind !== "tablet" && (
        <g>
          <rect x="88" y="14" width="64" height="152" rx="14" fill="#10162a" /><rect x="93" y="22" width="54" height="136" rx="9" fill="#fff" opacity="0.93" />
          {kind === "phone" && <><rect x="99" y="34" width="42" height="42" rx="10" fill={a} /><rect x="99" y="86" width="42" height="8" rx="4" fill="#cbd5e1" /><rect x="99" y="100" width="30" height="8" rx="4" fill="#cbd5e1" /></>}
          {kind === "screen" && <><path d="M128 24 L112 70 L130 92 L114 156" stroke="#475467" strokeWidth="2" fill="none" /><path d="M112 70 L98 78 M130 92 L142 100" stroke="#475467" strokeWidth="1.5" /></>}
          {kind === "battery" && <><rect x="102" y="62" width="36" height="58" rx="6" fill="none" stroke="#0e9f6e" strokeWidth="4" /><rect x="113" y="54" width="14" height="8" rx="2" fill="#0e9f6e" /><rect x="108" y="92" width="24" height="22" rx="3" fill="#22c55e" /></>}
          {kind === "charge" && <><path d="M124 48 L106 96 H122 L116 134 L138 82 H122 Z" fill="#f59e0b" /></>}
          {kind === "camera" && <><circle cx="120" cy="86" r="22" fill="#10162a" /><circle cx="120" cy="86" r="13" fill="#a855f7" /><circle cx="114" cy="80" r="4" fill="#fff" opacity="0.8" /></>}
          {kind === "glass" && <><rect x="99" y="30" width="42" height="100" rx="8" fill="#38bdf8" opacity="0.35" /><path d="M104 40 L118 120 M118 40 L132 120" stroke="#fff" strokeWidth="3" opacity="0.7" /></>}
        </g>
      )}
    </svg>
  );
}

/** Hero: technician repairing a phone for a customer in a living room (original illustration). */
export function LivingRoomScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="300 40 420 380" preserveAspectRatio="xMaxYMax meet" role="img" aria-label="Illustration: a FixSure technician repairing a phone on a coffee table while the customer reads on the sofa" className={`overflow-visible ${className}`}>
      {/* floor + wall skirting */}
      <rect x="-2000" y="330" width="4000" height="200" fill="#dfe4ee" /><rect x="-2000" y="322" width="4000" height="8" fill="#cfd5e2" />
      {/* window */}
      <rect x="430" y="40" width="150" height="190" rx="4" fill="#fff" stroke="#d7dce6" strokeWidth="4" /><path d="M505 40v190M430 135h150" stroke="#d7dce6" strokeWidth="3" />
      {/* plant left */}
      <rect x="360" y="262" width="40" height="64" rx="6" fill="#f6f7fb" stroke="#dfe3ec" /><g fill="#34a06b"><ellipse cx="372" cy="226" rx="10" ry="38" transform="rotate(-18 372 226)" /><ellipse cx="388" cy="222" rx="10" ry="40" transform="rotate(14 388 222)" /><ellipse cx="380" cy="214" rx="9" ry="36" /></g>
      {/* sofa */}
      <rect x="440" y="196" width="260" height="120" rx="26" fill="#f7f5ef" stroke="#e3dfd3" strokeWidth="2" />
      <rect x="430" y="240" width="40" height="84" rx="16" fill="#efece2" /><rect x="672" y="240" width="40" height="84" rx="16" fill="#efece2" />
      <rect x="462" y="284" width="212" height="40" rx="12" fill="#f1eee4" />
      {/* customer (reading) */}
      <circle cx="512" cy="196" r="20" fill="#e2a679" /><path d="M492 192q20-30 40 0q-4 16-8 14q-10-10-24 0q-6 4-8-14z" fill="#2a1d18" />
      <path d="M494 218h36l10 62h-54z" fill="#fff" stroke="#e3e6ee" /><rect x="498" y="276" width="14" height="52" rx="6" fill="#4b78c8" /><rect x="516" y="276" width="14" height="52" rx="6" fill="#3f6ab8" />
      <rect x="480" y="236" width="38" height="26" rx="3" fill="#f7d7a8" transform="rotate(-10 480 236)" />
      {/* technician */}
      <circle cx="625" cy="188" r="22" fill="#c98a5b" /><path d="M603 184q22-32 44 0q-8-8-22-8q-14 0-22 8z" fill="#171717" />
      <path d="M598 214h54l8 70h-70z" fill="#0b2a6f" /><rect x="618" y="224" width="14" height="14" rx="3" fill="#e0b050" />
      <rect x="596" y="282" width="22" height="46" rx="8" fill="#1b2133" /><rect x="630" y="282" width="22" height="46" rx="8" fill="#1b2133" />
      <path d="M598 236L552 282" stroke="#0b2a6f" strokeWidth="16" strokeLinecap="round" /><circle cx="548" cy="286" r="9" fill="#c98a5b" /><circle cx="548" cy="286" r="10" fill="none" stroke="#e8edf7" strokeWidth="4" />
      {/* coffee table + tools */}
      <path d="M500 296h160l-14 8H514z" fill="#6b3f2a" /><rect x="506" y="302" width="6" height="40" fill="#4a2a1b" /><rect x="650" y="302" width="6" height="40" fill="#4a2a1b" />
      <rect x="520" y="284" width="120" height="14" rx="3" fill="#2a3552" />
      <rect x="556" y="272" width="26" height="14" rx="2" fill="#10162a" /><rect x="590" y="278" width="40" height="8" rx="2" fill="#4f9bf5" /><rect x="530" y="280" width="18" height="6" rx="2" fill="#e0b050" />
      {/* dog */}
      <g transform="translate(120 -6)"><ellipse cx="260" cy="388" rx="70" ry="22" fill="#d99a52" /><circle cx="214" cy="380" r="20" fill="#e0a860" /><ellipse cx="203" cy="384" rx="9" ry="14" fill="#b87a36" transform="rotate(-20 203 384)" /><path d="M300 380q40-6 54 6q-30 6-54 4z" fill="#d99a52" /></g>
    </svg>
  );
}

export function Plants({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 190" aria-hidden="true" className={className}>
      <rect x="0" y="150" width="400" height="40" fill="#0b2a6f" opacity="0.5" />
      {[40, 130, 220, 310].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i % 2 ? 0 : 10})`}>
          <path d="M0 150q-18-60 8-110q6 60-4 110zM10 150q10-70 40-96q-10 62-30 96z" fill={i % 2 ? "#2fd18b" : "#59e6a3"} />
          <path d="M-6 150h60l-8 34H0z" fill="#e8eefb" />
        </g>
      ))}
    </svg>
  );
}

export function Telephone({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 200" aria-hidden="true" className={className}>
      <path d="M40 170q-30 10-14 24" stroke="#4a6bd6" strokeWidth="4" fill="none" />
      <path d="M70 190 56 120q-2-22 22-30l92-8q26 0 28 28l-10 80z" fill="#1b45a3" /><ellipse cx="130" cy="188" rx="76" ry="8" fill="#10162a" opacity="0.2" />
      <circle cx="130" cy="130" r="30" fill="#4f7be0" /><circle cx="130" cy="130" r="9" fill="#1b45a3" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <circle key={i} cx={130 + 21 * Math.cos((i * Math.PI) / 4)} cy={130 + 21 * Math.sin((i * Math.PI) / 4)} r="3.2" fill="#e0b050" />)}
      <path d="M62 58q10-34 60-40l40 4q20 6 22 22l-18 4q-8-10-36-10-26 2-34 22z" fill="#4f7be0" /><rect x="44" y="52" width="40" height="22" rx="10" fill="#1b45a3" transform="rotate(-28 64 63)" /><rect x="168" y="30" width="40" height="22" rx="10" fill="#1b45a3" transform="rotate(30 188 41)" />
    </svg>
  );
}

export function ShieldBadge({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 220" aria-hidden="true" className={className}>
      <path d="M100 8 182 36v70c0 50-34 84-82 104C52 190 18 156 18 106V36Z" fill="#e0b050" />
      <path d="M100 26 166 48v58c0 40-26 68-66 86-40-18-66-46-66-86V48Z" fill="#fff" opacity="0.95" />
      <path d="M100 38 154 56v50c0 32-22 56-54 72-32-16-54-40-54-72V56Z" fill="#1b45a3" />
      <path d="M72 108l20 20 38-42" stroke="#fff" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
