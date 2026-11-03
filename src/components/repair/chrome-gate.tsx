"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Repair routes use their own header/footer (the repair experience), the booking flow uses its own
 * compact top bar and no footer, and everything else keeps the storefront chrome.
 */
export function ChromeGate({ shop, repair }: { shop: ReactNode; repair: ReactNode }) {
  const path = usePathname() ?? "";
  if (path.startsWith("/repair/book")) return null;
  if (path.startsWith("/repair")) return <div className="repair-ui contents">{repair}</div>;
  return <>{shop}</>;
}
