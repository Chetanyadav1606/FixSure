import { ImageResponse } from "next/og";

export const alt = "FixSure Professor — Doorstep Mobile Repair in Mumbai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generated OG image: shield + wordmark on the dark theme. Replace the shield with the logo file once a clean cut exists. */
export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 56, background: "radial-gradient(circle at 25% 30%, #123585 0%, #05070d 60%)", color: "#fff", fontFamily: "sans-serif" }}>
        <svg width="300" height="300" viewBox="0 0 120 120">
          <path d="M60 4 106 20v38c0 27-19 47-46 58C33 105 14 85 14 58V20Z" fill="#ffc21a" />
          <path d="M60 12 98 26v32c0 22-16 40-38 50C38 98 22 80 22 58V26Z" fill="#05070d" />
          <path d="M60 18 92 30v28c0 19-13 34-32 43C41 92 28 77 28 58V30Z" fill="#1e6bff" />
          <path d="M36 62 50 50l10 6 10-6 14 12-8 8-8-6-8 8-8-6-8 6z" fill="#fff" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 108, fontWeight: 800, fontStyle: "italic" }}><span style={{ color: "#00a3ff" }}>Fix</span><span style={{ color: "#ffc21a" }}>Sure</span></div>
          <div style={{ display: "flex", fontSize: 28, letterSpacing: 10, color: "#c9d1de" }}>PROFESSOR</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 40, fontWeight: 700 }}>Doorstep Mobile Repair in Mumbai</div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 26, letterSpacing: 6, color: "#ffc21a" }}>TRUST • REPAIR • SOLVE</div>
        </div>
      </div>
    ),
    size,
  );
}
