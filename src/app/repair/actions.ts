"use server";

import { headers } from "next/headers";
import { getAdminClient, getPublicClient, isBackendConfigured } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { bookingSchema, trackSchema } from "@/lib/repair/schema";

async function clientKey(scope: string) {
  const h = await headers();
  const ip = h.get("x-nf-client-connection-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${scope}:${ip}`;
}

const DB_ERRORS: Record<string, string> = {
  SERVICE_UNAVAILABLE: "That service isn’t available for booking right now. Please pick another or contact us.",
  DOORSTEP_UNAVAILABLE: "Doorstep repair isn’t available for this service. You can choose pickup or a service-centre visit.",
  AREA_NOT_SERVED: "We don’t currently serve this PIN code for that service type. Try another option or contact us.",
  SLOT_UNAVAILABLE: "That appointment slot was just taken or is no longer available. Please choose another.",
  INVALID_PHOTO: "One of the photos couldn’t be accepted. Please re-upload it.",
  TOO_MANY_PHOTOS: "You can attach up to 3 photos.",
};

export type BookingResult =
  | { ok: true; ticketNumber: string; trackingToken: string }
  | { ok: false; code: "not_configured" | "validation" | "rate_limited" | "rejected" | "error"; message: string; fieldErrors?: Record<string, string> };

export async function submitRepairBooking(input: unknown): Promise<BookingResult> {
  const db = getAdminClient();
  if (!db) return { ok: false, code: "not_configured", message: "Online booking isn’t switched on yet. Send your details to us on WhatsApp instead." };

  const rl = rateLimit(await clientKey("book"), 5, 10 * 60_000);
  if (!rl.ok) return { ok: false, code: "rate_limited", message: `Too many attempts. Please try again in ${Math.ceil(rl.retryAfterSec / 60)} minute(s).` };

  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[i.path.join(".")] ||= i.message;
    return { ok: false, code: "validation", message: "Please check the highlighted details.", fieldErrors };
  }
  const v = parsed.data;

  const { data, error } = await db.rpc("create_repair_booking", {
    p: {
      service_id: v.serviceId || null,
      device_type: "mobile",
      manufacturer: v.manufacturer,
      model: v.model,
      issue_summary: v.issueSummary,
      issue_details: v.issueDetails || null,
      photo_paths: v.photoPaths,
      contact_name: v.contactName,
      contact_phone: v.contactPhone,
      contact_email: v.contactEmail || null,
      fulfilment: v.fulfilment,
      place_type: v.fulfilment === "store_dropoff" ? null : (v.placeType ?? "home"),
      address: v.fulfilment === "store_dropoff" ? null : v.address,
      slot_id: v.slotId || null,
    },
  });

  if (error) {
    const code = Object.keys(DB_ERRORS).find((c) => error.message.includes(c));
    if (code) return { ok: false, code: "rejected", message: DB_ERRORS[code] };
    console.error("create_repair_booking failed", error.code); // never log customer details
    return { ok: false, code: "error", message: "We couldn’t create your booking. Please try again or contact us." };
  }
  return { ok: true, ticketNumber: data.ticket_number, trackingToken: data.tracking_token };
}

export type PincodeResult = { status: "unconfigured" | "invalid" | "not_served" | "served"; city?: string; doorstep?: boolean; pickup?: boolean };

export async function checkPincode(pin: string): Promise<PincodeResult> {
  if (!/^[1-9]\d{5}$/.test(pin)) return { status: "invalid" };
  const db = getPublicClient();
  if (!db || !isBackendConfigured()) return { status: "unconfigured" };
  if (!rateLimit(await clientKey("pin"), 60, 60_000).ok) return { status: "not_served" };
  const { data } = await db.from("repair_service_areas").select("city, doorstep, pickup").eq("pincode", pin).eq("active", true).maybeSingle();
  return data ? { status: "served", city: data.city, doorstep: data.doorstep, pickup: data.pickup } : { status: "not_served" };
}

// ───────── tracking ─────────
export type TrackedRepair = {
  ticket_number: string; status: string; device: string; issue: string; fulfilment: string; appointment: string | null; created_at: string;
  technician_first_name: string | null;
  history: { status: string; note: string | null; at: string }[];
  quote: { id: string; status: string; parts_total: number; labour_total: number; tax_total: number; total: number; valid_until: string | null; notes: string | null } | null;
};
export type TrackState = { kind: "idle" } | { kind: "error"; message: string } | { kind: "found"; repair: TrackedRepair; ticket: string; secret: string; notice?: string };

async function fetchTracked(ticket: string, secret: string): Promise<TrackedRepair | null> {
  const db = getAdminClient()!;
  const { data, error } = await db.rpc("track_repair", { p_ticket: ticket, p_secret: secret });
  if (error) { console.error("track_repair failed", error.code); return null; }
  return data as TrackedRepair | null;
}

export async function trackRepair(_prev: TrackState, formData: FormData): Promise<TrackState> {
  if (!isBackendConfigured()) return { kind: "error", message: "Online tracking isn’t switched on yet. Please contact us with your ticket number." };
  if (!rateLimit(await clientKey("track"), 10, 10 * 60_000).ok) return { kind: "error", message: "Too many lookups. Please wait a few minutes and try again." };
  const parsed = trackSchema.safeParse({ ticket: formData.get("ticket"), secret: formData.get("secret") });
  if (!parsed.success) return { kind: "error", message: parsed.error.issues[0].message };
  const repair = await fetchTracked(parsed.data.ticket, parsed.data.secret);
  // Same message for "no such ticket" and "wrong secret": don't reveal which tickets exist.
  if (!repair) return { kind: "error", message: "We couldn’t find a repair with those details. Check the ticket number and phone number or tracking key." };
  return { kind: "found", repair, ticket: parsed.data.ticket, secret: parsed.data.secret };
}

export async function decideQuote(_prev: TrackState, formData: FormData): Promise<TrackState> {
  const db = getAdminClient();
  if (!db) return { kind: "error", message: "Online tracking isn’t switched on yet." };
  if (!rateLimit(await clientKey("decide"), 10, 10 * 60_000).ok) return { kind: "error", message: "Too many attempts. Please wait a few minutes." };
  const parsed = trackSchema.safeParse({ ticket: formData.get("ticket"), secret: formData.get("secret") });
  const quoteId = String(formData.get("quoteId") ?? "");
  const approve = formData.get("decision") === "approve";
  if (!parsed.success || !/^[0-9a-f-]{36}$/.test(quoteId)) return { kind: "error", message: "Invalid request." };

  const { error } = await db.rpc("decide_repair_quote", { p_ticket: parsed.data.ticket, p_secret: parsed.data.secret, p_quote_id: quoteId, p_approve: approve });
  if (error) {
    const msg = error.message.includes("QUOTE_EXPIRED") ? "This quotation has expired. Please contact us for an updated one."
      : error.message.includes("QUOTE_NOT_PENDING") ? "This quotation has already been decided." : "We couldn’t record your decision. Please contact us.";
    return { kind: "error", message: msg };
  }
  const repair = await fetchTracked(parsed.data.ticket, parsed.data.secret);
  if (!repair) return { kind: "error", message: "Recorded, but we couldn’t reload your repair. Please search again." };
  return { kind: "found", repair, ticket: parsed.data.ticket, secret: parsed.data.secret, notice: approve ? "Thank you — your approval has been recorded." : "Your decision has been recorded. We’ll be in touch." };
}
