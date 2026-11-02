import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { site } from "@/lib/site";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "FixSure — Computer Parts, Components & Repairs | Mumbai", template: "%s | FixSure" },
  description:
    "Laptop spare parts, desktop components, mobile parts and repair services in Mumbai, Navi Mumbai and Thane. FixSure — your reliable fix.",
  openGraph: { siteName: "FixSure", locale: "en_IN", type: "website" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#0b2a6f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={manrope.variable}>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
