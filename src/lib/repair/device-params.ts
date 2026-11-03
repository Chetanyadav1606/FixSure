/** Reads and sanitises the device chosen on booking step 1 from the URL. Values are untrusted input. */
const OTHER = "__other__";
const clean = (v: string | string[] | undefined, max: number) => (Array.isArray(v) ? v[0] : v)?.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max) ?? "";

export function readDevice(sp: Record<string, string | string[] | undefined>) {
  const brand = clean(sp.brand, 60); const model = clean(sp.model, 80);
  if (!brand || !model) return null;
  const cb = clean(sp.cb, 40); const cm = clean(sp.cm, 60);
  if (brand === OTHER && (cb.length < 2 || cm.length < 2)) return null;
  const q = new URLSearchParams({ brand, model });
  if (brand === OTHER) { q.set("cb", cb); q.set("cm", cm); }
  return { brand, model, cb, cm, brandName: brand === OTHER ? cb : brand, modelName: brand === OTHER ? cm : model, query: q.toString() };
}
