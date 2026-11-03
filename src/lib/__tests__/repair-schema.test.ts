import { describe, expect, it, beforeEach } from "vitest";
import { bookingSchema, trackSchema } from "../repair/schema";
import { _resetRateLimits, rateLimit } from "../rate-limit";

const base = {
  manufacturer: "Samsung", model: "Galaxy A14", issueSummary: "Cracked screen", fulfilment: "doorstep" as const,
  address: { line1: "12 Test Road", pincode: "400001", city: "Mumbai" }, contactName: "Asha", contactPhone: "98200 11111", consent: true as const,
};

describe("bookingSchema", () => {
  it("accepts a valid doorstep booking and normalises the phone", () => {
    const r = bookingSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.contactPhone).toBe("9820011111");
  });
  it("accepts +91 and 0 prefixes, rejects invalid numbers", () => {
    expect(bookingSchema.safeParse({ ...base, contactPhone: "+91 98200-11111" }).success).toBe(true);
    for (const bad of ["12345", "5820011111", "98200111", "abcdefghij"]) expect(bookingSchema.safeParse({ ...base, contactPhone: bad }).success).toBe(false);
  });
  it("requires an address for doorstep/pickup but not for service-centre visits", () => {
    expect(bookingSchema.safeParse({ ...base, address: undefined }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...base, fulfilment: "store_dropoff", address: undefined }).success).toBe(true);
  });
  it("rejects bad PIN codes, missing consent, path-traversal photos and >3 photos", () => {
    expect(bookingSchema.safeParse({ ...base, address: { ...base.address, pincode: "012345" } }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...base, consent: false }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...base, photoPaths: ["../../x.jpg"] }).success).toBe(false);
    const p = "guest/123e4567-e89b-12d3-a456-426614174000.jpg";
    expect(bookingSchema.safeParse({ ...base, photoPaths: [p, p, p, p] }).success).toBe(false);
    expect(bookingSchema.safeParse({ ...base, photoPaths: [p] }).success).toBe(true);
  });
});

describe("trackSchema", () => {
  it("normalises ticket case and requires a secret", () => {
    expect(trackSchema.parse({ ticket: " fsr-1001 ", secret: "9820011111" }).ticket).toBe("FSR-1001");
    expect(trackSchema.safeParse({ ticket: "FSR-1001", secret: "12" }).success).toBe(false);
    expect(trackSchema.safeParse({ ticket: "ORDER-1", secret: "9820011111" }).success).toBe(false);
  });
});

describe("rateLimit", () => {
  beforeEach(() => _resetRateLimits());
  it("blocks after the limit and recovers after the window", () => {
    for (let i = 0; i < 3; i++) expect(rateLimit("k", 3, 1000, 0).ok).toBe(true);
    expect(rateLimit("k", 3, 1000, 10).ok).toBe(false);
    expect(rateLimit("k", 3, 1000, 2000).ok).toBe(true);
  });
  it("tracks keys independently", () => {
    rateLimit("a", 1, 1000, 0);
    expect(rateLimit("a", 1, 1000, 1).ok).toBe(false);
    expect(rateLimit("b", 1, 1000, 1).ok).toBe(true);
  });
});
