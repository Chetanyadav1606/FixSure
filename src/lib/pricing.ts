import type { Paise } from "./money";

/**
 * Server-authoritative order pricing. The browser only ever sends product ids
 * and quantities; every figure below is recomputed on the server from DB rows.
 * Tax rates are NEVER hardcoded here — they come from product/tax configuration.
 */
export type PricedLineInput = {
  productId: string;
  unitPricePaise: Paise; // as stored (tax-inclusive or exclusive per pricesIncludeTax)
  quantity: number;
  taxRateBps: number; // basis points: 1800 = 18.00%. Supplied by configuration.
};

export type CouponInput = {
  code: string;
  kind: "percent" | "fixed";
  /** percent: basis points (1000 = 10%). fixed: paise. */
  value: number;
  minOrderPaise?: Paise;
  maxDiscountPaise?: Paise;
  startsAt?: Date | null;
  endsAt?: Date | null;
  active: boolean;
  usageLimit?: number | null;
  timesUsed?: number;
};

export type PricedLine = PricedLineInput & {
  lineSubtotalPaise: Paise; // before discount, as stored
  discountPaise: Paise;
  taxableValuePaise: Paise; // after discount, excluding tax
  taxPaise: Paise;
  cgstPaise: Paise;
  sgstPaise: Paise;
  igstPaise: Paise;
  lineTotalPaise: Paise; // taxable + tax
};

export type OrderTotals = {
  lines: PricedLine[];
  subtotalPaise: Paise;
  discountPaise: Paise;
  shippingPaise: Paise;
  taxPaise: Paise;
  cgstPaise: Paise;
  sgstPaise: Paise;
  igstPaise: Paise;
  grandTotalPaise: Paise;
  couponApplied: string | null;
  couponError: string | null;
};

export type PricingOptions = {
  pricesIncludeTax: boolean;
  /** true => split into CGST+SGST; false => IGST. Decided from seller/buyer state. */
  intraState: boolean;
  shippingPaise: Paise;
  coupon?: CouponInput | null;
  now?: Date;
};

export function validateCoupon(c: CouponInput, subtotalPaise: Paise, now: Date): string | null {
  if (!c.active) return "This coupon is not active.";
  if (c.startsAt && now < c.startsAt) return "This coupon is not valid yet.";
  if (c.endsAt && now > c.endsAt) return "This coupon has expired.";
  if (c.usageLimit != null && (c.timesUsed ?? 0) >= c.usageLimit) return "This coupon has been fully redeemed.";
  if (c.minOrderPaise && subtotalPaise < c.minOrderPaise) return "Order value is below this coupon's minimum.";
  return null;
}

/** Distribute `total` across weights using largest-remainder so the parts sum exactly. */
export function allocate(total: Paise, weights: number[]): Paise[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (total <= 0 || sum <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => (total * w) / sum);
  const floors = raw.map(Math.floor);
  let remainder = total - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - floors[i] })).sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (remainder <= 0) break;
    floors[i] += 1;
    remainder -= 1;
  }
  return floors;
}

export function priceOrder(inputs: PricedLineInput[], opts: PricingOptions): OrderTotals {
  const now = opts.now ?? new Date();
  for (const l of inputs) {
    if (!Number.isInteger(l.quantity) || l.quantity < 1) throw new Error("Quantity must be a positive integer");
    if (!Number.isInteger(l.unitPricePaise) || l.unitPricePaise < 0) throw new Error("Invalid unit price");
    if (!Number.isInteger(l.taxRateBps) || l.taxRateBps < 0) throw new Error("Invalid tax rate");
  }

  const subtotals = inputs.map((l) => l.unitPricePaise * l.quantity);
  const subtotal = subtotals.reduce((a, b) => a + b, 0);

  let discount = 0;
  let couponApplied: string | null = null;
  let couponError: string | null = null;
  if (opts.coupon) {
    couponError = validateCoupon(opts.coupon, subtotal, now);
    if (!couponError) {
      const c = opts.coupon;
      discount = c.kind === "percent" ? Math.round((subtotal * c.value) / 10000) : c.value;
      if (c.maxDiscountPaise != null) discount = Math.min(discount, c.maxDiscountPaise);
      discount = Math.max(0, Math.min(discount, subtotal));
      couponApplied = discount > 0 ? c.code : null;
    }
  }

  const discounts = allocate(discount, subtotals);

  const lines: PricedLine[] = inputs.map((l, i) => {
    const afterDiscount = subtotals[i] - discounts[i];
    let taxable: Paise;
    let tax: Paise;
    if (opts.pricesIncludeTax) {
      taxable = Math.round((afterDiscount * 10000) / (10000 + l.taxRateBps));
      tax = afterDiscount - taxable;
    } else {
      taxable = afterDiscount;
      tax = Math.round((afterDiscount * l.taxRateBps) / 10000);
    }
    const cgst = opts.intraState ? Math.floor(tax / 2) : 0;
    const sgst = opts.intraState ? tax - cgst : 0;
    const igst = opts.intraState ? 0 : tax;
    return {
      ...l,
      lineSubtotalPaise: subtotals[i],
      discountPaise: discounts[i],
      taxableValuePaise: taxable,
      taxPaise: tax,
      cgstPaise: cgst,
      sgstPaise: sgst,
      igstPaise: igst,
      lineTotalPaise: taxable + tax,
    };
  });

  const sum = (f: (l: PricedLine) => number) => lines.reduce((a, l) => a + f(l), 0);
  const tax = sum((l) => l.taxPaise);
  const taxable = sum((l) => l.taxableValuePaise);
  return {
    lines,
    subtotalPaise: subtotal,
    discountPaise: discount,
    shippingPaise: opts.shippingPaise,
    taxPaise: tax,
    cgstPaise: sum((l) => l.cgstPaise),
    sgstPaise: sum((l) => l.sgstPaise),
    igstPaise: sum((l) => l.igstPaise),
    grandTotalPaise: taxable + tax + opts.shippingPaise,
    couponApplied,
    couponError,
  };
}
