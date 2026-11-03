import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#05070d" }}>
        <svg width="150" height="150" viewBox="0 0 120 120">
          <path d="M60 4 106 20v38c0 27-19 47-46 58C33 105 14 85 14 58V20Z" fill="#ffc21a" />
          <path d="M60 12 98 26v32c0 22-16 40-38 50C38 98 22 80 22 58V26Z" fill="#05070d" />
          <path d="M60 18 92 30v28c0 19-13 34-32 43C41 92 28 77 28 58V30Z" fill="#1e6bff" />
          <path d="M36 62 50 50l10 6 10-6 14 12-8 8-8-6-8 8-8-6-8 6z" fill="#fff" />
        </svg>
      </div>
    ),
    size,
  );
}
