import type { Metadata, Viewport } from "next";
import { DM_Sans, Exo_2, Figtree, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChromeGate } from "@/components/repair/chrome-gate";
import { RepairFooter, RepairHeader } from "@/components/repair/chrome";
import { site } from "@/lib/site";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });
const exo = Exo_2({ subsets: ["latin"], weight: ["700", "800"], style: ["italic", "normal"], variable: "--font-exo", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "FixSure Professor | Doorstep Mobile Repair in Mumbai", template: "%s | FixSure Professor" },
  description:
    "Laptop spare parts, desktop components, mobile parts and repair services in Mumbai, Navi Mumbai and Thane. FixSure — your reliable fix.",
  openGraph: { siteName: "FixSure Professor", title: "FixSure Professor | Doorstep Mobile Repair in Mumbai", locale: "en_IN", type: "website" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#05070d", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${manrope.variable} ${dmSans.variable} ${figtree.variable} ${exo.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-lg">
          Skip to content
        </a>
        <ChromeGate shop={<Header />} repair={<RepairHeader />} />
        <main id="main" className="flex-1">{children}</main>
        <ChromeGate shop={<Footer />} repair={<RepairFooter />} />
      </body>
    </html>
  );
}
