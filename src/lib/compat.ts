export type CompatStatus = "confirmed" | "potential" | "unverified" | "incompatible";

export const COMPAT_LABEL: Record<CompatStatus, string> = {
  confirmed: "Confirmed compatible",
  potential: "Potential match",
  unverified: "Not verified",
  incompatible: "Incompatible",
};

export type DeviceModel = {
  id: string;
  deviceType: "laptop" | "desktop" | "mobile";
  manufacturer: string;
  series: string;
  model: string;
  submodel?: string;
  /** manufacturer part/model numbers */
  identifiers: string[];
};

export type CompatRecord = {
  modelId: string;
  productId: string;
  status: CompatStatus;
  note?: string;
};

export const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function modelLabel(m: DeviceModel): string {
  return [m.manufacturer, m.series, m.model, m.submodel].filter(Boolean).join(" ");
}

/** Rank device models for a free-text query (autocomplete). Token-AND match, identifier/prefix boosted. */
export function searchModels(models: DeviceModel[], query: string, limit = 8): DeviceModel[] {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(" ");
  const qc = compact(query);
  return models
    .map((m) => {
      const label = normalize(modelLabel(m));
      const ids = m.identifiers.map(compact);
      const hay = [label, ...m.identifiers.map(normalize)].join(" ");
      const hayCompact = compact(hay);
      if (!tokens.every((t) => hay.includes(t)) && !hayCompact.includes(qc)) return { m, score: -1 };
      let score = 1;
      if (ids.some((i) => i === qc)) score += 100;
      else if (ids.some((i) => i.includes(qc))) score += 40;
      if (label.startsWith(q)) score += 20;
      score += tokens.filter((t) => label.split(" ").includes(t)).length * 3;
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || modelLabel(a.m).localeCompare(modelLabel(b.m)))
    .slice(0, limit)
    .map((x) => x.m);
}

const RANK: Record<CompatStatus, number> = { confirmed: 0, potential: 1, unverified: 2, incompatible: 3 };

/**
 * Parts for a device model. Only admin-maintained records are returned — compatibility
 * is never inferred from names. Incompatible records are kept so the UI can warn.
 */
export function partsForModel<P extends { id: string }>(
  modelId: string,
  records: CompatRecord[],
  products: P[],
): { product: P; status: CompatStatus; note?: string }[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  return records
    .filter((r) => r.modelId === modelId && byId.has(r.productId))
    .map((r) => ({ product: byId.get(r.productId)!, status: r.status, note: r.note }))
    .sort((a, b) => RANK[a.status] - RANK[b.status]);
}

/** Absence of a record is "unverified" — never "compatible". */
export function statusFor(modelId: string, productId: string, records: CompatRecord[]): CompatStatus {
  return records.find((r) => r.modelId === modelId && r.productId === productId)?.status ?? "unverified";
}

/** Lookup by exact (punctuation-insensitive) SKU / OEM / part number. */
export function lookupByPartNumber<P extends { sku: string; oemNumbers: string[] }>(products: P[], query: string): P[] {
  const qc = compact(query);
  if (qc.length < 3) return [];
  return products.filter((p) => compact(p.sku) === qc || p.oemNumbers.some((o) => compact(o) === qc));
}
