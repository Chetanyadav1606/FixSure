import { describe, expect, it } from "vitest";
import { lookupByPartNumber, partsForModel, searchModels, statusFor, type CompatRecord, type DeviceModel } from "../compat";

const models: DeviceModel[] = [
  { id: "m1", deviceType: "laptop", manufacturer: "TestCo", series: "Alpha", model: "A15", identifiers: ["A15-X1"] },
  { id: "m2", deviceType: "laptop", manufacturer: "TestCo", series: "Alpha", model: "A14", identifiers: ["A14-X1"] },
  { id: "m3", deviceType: "laptop", manufacturer: "OtherCo", series: "Beta", model: "B15", identifiers: [] },
];
const products = [
  { id: "p1", sku: "BAT-1", oemNumbers: ["OEM-100"] },
  { id: "p2", sku: "KB-2", oemNumbers: [] },
];
const records: CompatRecord[] = [
  { modelId: "m1", productId: "p1", status: "potential" },
  { modelId: "m1", productId: "p2", status: "confirmed" },
];

describe("searchModels", () => {
  it("matches tokens in any order", () => {
    expect(searchModels(models, "alpha a15").map((m) => m.id)).toEqual(["m1"]);
  });
  it("ranks exact identifier first and ignores punctuation", () => {
    expect(searchModels(models, "a15x1")[0].id).toBe("m1");
  });
  it("returns nothing for empty / unmatched queries", () => {
    expect(searchModels(models, "")).toEqual([]);
    expect(searchModels(models, "zzz")).toEqual([]);
  });
});

describe("partsForModel / statusFor", () => {
  it("sorts confirmed before potential", () => {
    expect(partsForModel("m1", records, products).map((r) => r.status)).toEqual(["confirmed", "potential"]);
  });
  it("never reports compatibility without a record", () => {
    expect(partsForModel("m2", records, products)).toEqual([]);
    expect(statusFor("m2", "p1", records)).toBe("unverified");
  });
});

describe("lookupByPartNumber", () => {
  it("finds by SKU or OEM ignoring punctuation/case", () => {
    expect(lookupByPartNumber(products, "oem100")[0].id).toBe("p1");
    expect(lookupByPartNumber(products, "bat-1")[0].id).toBe("p1");
  });
  it("ignores very short queries", () => {
    expect(lookupByPartNumber(products, "b")).toEqual([]);
  });
});
