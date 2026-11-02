/** All money in the app is integer paise. DB columns are numeric(12,2) rupees. */
export type Paise = number;

export function rupeesToPaise(rupees: number | string): Paise {
  const n = typeof rupees === "string" ? Number(rupees) : rupees;
  if (!Number.isFinite(n)) throw new Error("Invalid amount");
  return Math.round(n * 100);
}

export function paiseToRupees(p: Paise): number {
  return p / 100;
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const inrWhole = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatINR(p: Paise): string {
  return p % 100 === 0 ? inrWhole.format(p / 100) : inr.format(p / 100);
}
