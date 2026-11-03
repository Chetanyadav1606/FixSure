import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024;

/** Identify the real type from magic bytes — never trust the client-supplied MIME type or filename. */
function sniff(b: Uint8Array): { ext: "jpg" | "png" | "webp"; mime: string } | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: "png", mime: "image/png" };
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { ext: "webp", mime: "image/webp" };
  return null;
}

export async function POST(req: Request) {
  const db = getAdminClient();
  if (!db) return NextResponse.json({ error: "Uploads are not enabled yet." }, { status: 503 });

  const ip = req.headers.get("x-nf-client-connection-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`upload:${ip}`, 12, 10 * 60_000).ok) return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });

  let file: FormDataEntryValue | null;
  try { file = (await req.formData()).get("file"); } catch { return NextResponse.json({ error: "Invalid upload." }, { status: 400 }); }
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (file.size === 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "Photos must be under 5 MB." }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniff(bytes);
  if (!type) return NextResponse.json({ error: "Only JPG, PNG or WebP images are accepted." }, { status: 415 });

  const path = `guest/${randomUUID()}.${type.ext}`;
  const { error } = await db.storage.from("repair-photos").upload(path, bytes, { contentType: type.mime, upsert: false });
  if (error) { console.error("repair photo upload failed", error.message); return NextResponse.json({ error: "Upload failed." }, { status: 500 }); }
  return NextResponse.json({ path });
}
