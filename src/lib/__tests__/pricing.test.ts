import { describe, expect, it } from "vitest";
import { allocate, priceOrder, validateCoupon, type CouponInput } from "../pricing";
import { formatINR, rupeesToPaise } from "../money";

// Tax rates below are TEST FIXTURES only; the app reads real rates from configuration.
const line = (productId: string, unit: number, quantity: number, taxRateBps = 1800) => ({
  productId,
  unitPricePaise: unit,
  quantity,
  taxRateBps,
});

const base = { pricesIncludeTax: false, intraState: true, shippingPaise: 0 };

describe("money", () => {
  it("converts rupees to paise without float drift", () => {
    expect(rupeesToPaise(19.99)).toBe(1999);
    expect(rupeesToPaise("0.1")).toBe(10);
    expect(() => rupeesToPaise("abc")).toThrow();
  });
  it("formats INR with Indian grouping", () => {
    expect(formatINR(123456700)).toContain("12,34,567");
  });
});

describe("allocate", () => {
  it("always sums exactly to the total", () => {
    const parts = allocate(100, [1, 1, 1]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(100);
  });
  it("returns zeros for no discount", () => {
    expect(allocate(0, [5, 5])).toEqual([0, 0]);
  });
});

describe("priceOrder (tax exclusive)", () => {
  it("adds tax on top and splits CGST/SGST intra-state", () => {
    const t = priceOrder([line("a", 100000, 2)], base);
    expect(t.subtotalPaise).toBe(200000);
    expect(t.taxPaise).toBe(36000);
    expect(t.cgstPaise + t.sgstPaise).toBe(36000);
    expect(t.igstPaise).toBe(0);
    expect(t.grandTotalPaise).toBe(236000);
  });
  it("uses IGST inter-state", () => {
    const t = priceOrder([line("a", 100000, 1)], { ...base, intraState: false });
    expect(t.igstPaise).toBe(18000);
    expect(t.cgstPaise).toBe(0);
  });
  it("adds shipping outside tax base", () => {
    const t = priceOrder([line("a", 100000, 1)], { ...base, shippingPaise: 5000 });
    expect(t.grandTotalPaise).toBe(100000 + 18000 + 5000);
  });
  it("supports zero-rated lines", () => {
    const t = priceOrder([line("a", 100000, 1, 0)], base);
    expect(t.taxPaise).toBe(0);
  });
});

describe("priceOrder (tax inclusive)", () => {
  it("extracts tax from the stored price so total equals sticker price", () => {
    const t = priceOrder([line("a", 118000, 1)], { ...base, pricesIncludeTax: true });
    expect(t.lines[0].taxableValuePaise).toBe(100000);
    expect(t.taxPaise).toBe(18000);
    expect(t.grandTotalPaise).toBe(118000);
  });
});

describe("coupons", () => {
  const pct: CouponInput = { code: "SAVE10", kind: "percent", value: 1000, active: true };
  it("applies percentage discount and reduces taxable value", () => {
    const t = priceOrder([line("a", 100000, 1)], { ...base, coupon: pct });
    expect(t.discountPaise).toBe(10000);
    expect(t.lines[0].taxableValuePaise).toBe(90000);
    expect(t.taxPaise).toBe(16200);
    expect(t.couponApplied).toBe("SAVE10");
  });
  it("caps discount at maxDiscount", () => {
    const t = priceOrder([line("a", 100000, 1)], { ...base, coupon: { ...pct, maxDiscountPaise: 3000 } });
    expect(t.discountPaise).toBe(3000);
  });
  it("never discounts more than the subtotal", () => {
    const t = priceOrder([line("a", 1000, 1)], { ...base, coupon: { code: "BIG", kind: "fixed", value: 999999, active: true } });
    expect(t.discountPaise).toBe(1000);
    expect(t.grandTotalPaise).toBe(0);
  });
  it("splits discount across lines so parts sum to total", () => {
    const t = priceOrder([line("a", 3333, 1), line("b", 3333, 1), line("c", 3334, 1)], {
      ...base,
      coupon: { code: "F", kind: "fixed", value: 1000, active: true },
    });
    expect(t.lines.reduce((a, l) => a + l.discountPaise, 0)).toBe(1000);
  });
  it("rejects inactive, expired, not-yet-valid, exhausted and below-minimum coupons", () => {
    const now = new Date("2026-06-01");
    expect(validateCoupon({ ...pct, active: false }, 100, now)).toMatch(/not active/);
    expect(validateCoupon({ ...pct, endsAt: new Date("2026-01-01") }, 100, now)).toMatch(/expired/);
    expect(validateCoupon({ ...pct, startsAt: new Date("2026-12-01") }, 100, now)).toMatch(/not valid yet/);
    expect(validateCoupon({ ...pct, usageLimit: 2, timesUsed: 2 }, 100, now)).toMatch(/redeemed/);
    expect(validateCoupon({ ...pct, minOrderPaise: 5000 }, 100, now)).toMatch(/minimum/);
    expect(validateCoupon(pct, 100, now)).toBeNull();
  });
  it("reports the error and applies no discount for invalid coupons", () => {
    const t = priceOrder([line("a", 100000, 1)], { ...base, coupon: { ...pct, active: false } });
    expect(t.discountPaise).toBe(0);
    expect(t.couponError).toBeTruthy();
    expect(t.couponApplied).toBeNull();
  });
});

describe("input validation", () => {
  it("rejects bad quantities, prices and rates", () => {
    expect(() => priceOrder([line("a", 100, 0)], base)).toThrow();
    expect(() => priceOrder([line("a", 100, 1.5)], base)).toThrow();
    expect(() => priceOrder([line("a", -1, 1)], base)).toThrow();
    expect(() => priceOrder([line("a", 100, 1, -5)], base)).toThrow();
  });
});
