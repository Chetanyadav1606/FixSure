// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const mig = (f: string) => readFileSync(path.resolve(__dirname, "../../../supabase/migrations", f), "utf8");
const STUBS = `
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.sub', true), '')::uuid $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text, owner uuid);
  create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name, '/') $$;
  alter table storage.objects enable row level security;
`;
const SVC_ON = "40000000-0000-0000-0000-000000000001";
const SVC_OFF = "40000000-0000-0000-0000-000000000002";
const SVC_NODOOR = "40000000-0000-0000-0000-000000000003";
let db: PGlite;

const booking = (over: Record<string, unknown> = {}) => ({
  service_id: SVC_ON, device_type: "mobile", manufacturer: "Samsung", model: "Galaxy A", issue_summary: "Cracked screen",
  contact_name: "Asha", contact_phone: "+91 98200 11111", fulfilment: "doorstep", place_type: "home",
  address: { line1: "12 Test Rd", pincode: "400001", city: "Mumbai" }, ...over,
});
const book = async (p: object) => (await db.query<{ r: Record<string, string> }>("select create_repair_booking($1::jsonb) r", [JSON.stringify(p)])).rows[0].r;
const track = async (t: string, s: string) => (await db.query<{ r: Record<string, unknown> | null }>("select track_repair($1, $2) r", [t, s])).rows[0].r;

beforeAll(async () => {
  db = new PGlite({ extensions: { pg_trgm, pgcrypto } });
  await db.exec(STUBS);
  for (const f of ["0001_schema.sql", "0002_rls_storage.sql", "0003_repair_booking.sql"]) await db.exec(mig(f));
  await db.exec(`
    grant usage on schema public, auth to anon, authenticated;
    grant all on all tables in schema public to anon, authenticated;
    insert into repair_services (id, slug, device_type, name, active, doorstep_available, diagnostic_fee) values
      ('${SVC_ON}', 'screen', 'mobile', 'Screen replacement', true, true, 199),
      ('${SVC_OFF}', 'camera', 'mobile', 'Camera repair', false, true, 0),
      ('${SVC_NODOOR}', 'mobo', 'mobile', 'Board repair', true, false, 0);
    insert into repair_service_areas (pincode, city, doorstep, pickup) values ('400001', 'Mumbai', true, false), ('400002', 'Mumbai', false, true);
    insert into repair_slots (id, starts_at, ends_at, fulfilment, capacity) values
      ('50000000-0000-0000-0000-000000000001', now() + interval '1 day', now() + interval '1 day 2 hours', 'doorstep', 1),
      ('50000000-0000-0000-0000-000000000002', now() - interval '1 day', now() - interval '1 day' + interval '2 hours', 'doorstep', 5);
  `);
}, 60000);
afterAll(async () => { await db?.close(); });

describe("create_repair_booking", () => {
  it("creates a ticket with a number, secret token and first history row", async () => {
    const r = await book(booking());
    expect(r.ticket_number).toMatch(/^FSR-\d+$/);
    expect(r.tracking_token).toHaveLength(24);
    expect(r.status).toBe("requested");
    const h = await db.query("select 1 from repair_status_history h join repair_tickets t on t.id = h.ticket_id where t.ticket_number = $1", [r.ticket_number]);
    expect(h.rows).toHaveLength(1);
  });
  it("copies the configured diagnostic fee from the service", async () => {
    const r = await book(booking());
    const t = await db.query<{ diagnostic_fee: string }>("select diagnostic_fee from repair_tickets where ticket_number = $1", [r.ticket_number]);
    expect(Number(t.rows[0].diagnostic_fee)).toBe(199);
  });
  it("rejects services that are not enabled", async () => {
    await expect(book(booking({ service_id: SVC_OFF }))).rejects.toThrow(/SERVICE_UNAVAILABLE/);
  });
  it("rejects doorstep for a service that does not offer it", async () => {
    await expect(book(booking({ service_id: SVC_NODOOR }))).rejects.toThrow(/DOORSTEP_UNAVAILABLE/);
  });
  it("rejects pincodes that are not configured, or not served for that fulfilment", async () => {
    await expect(book(booking({ address: { pincode: "110001" } }))).rejects.toThrow(/AREA_NOT_SERVED/);
    await expect(book(booking({ address: { pincode: "400002" } }))).rejects.toThrow(/AREA_NOT_SERVED/); // pickup-only area, doorstep requested
  });
  it("allows a service-centre visit without any service-area check", async () => {
    const r = await book(booking({ fulfilment: "store_dropoff", address: null }));
    expect(r.status).toBe("requested");
  });
  it("never lets a slot exceed capacity", async () => {
    const slot = "50000000-0000-0000-0000-000000000001";
    const r = await book(booking({ slot_id: slot }));
    expect(r.ticket_number).toBeTruthy();
    await expect(book(booking({ slot_id: slot }))).rejects.toThrow(/SLOT_UNAVAILABLE/);
    const s = await db.query<{ booked: number }>("select booked from repair_slots where id = $1", [slot]);
    expect(s.rows[0].booked).toBe(1);
  });
  it("rejects past slots and a slot with the wrong fulfilment type", async () => {
    await expect(book(booking({ slot_id: "50000000-0000-0000-0000-000000000002" }))).rejects.toThrow(/SLOT_UNAVAILABLE/);
    await expect(book(booking({ slot_id: "50000000-0000-0000-0000-000000000001", fulfilment: "store_dropoff", address: null }))).rejects.toThrow(/SLOT_UNAVAILABLE/);
  });
  it("a failed booking does not consume slot capacity (atomic)", async () => {
    await db.exec("insert into repair_slots (id, starts_at, ends_at, fulfilment, capacity) values ('50000000-0000-0000-0000-000000000003', now() + interval '2 days', now() + interval '2 days 1 hour', 'doorstep', 2)");
    await expect(book(booking({ slot_id: "50000000-0000-0000-0000-000000000003", photo_paths: ["../../etc/passwd"] }))).rejects.toThrow(/INVALID_PHOTO/);
    const s = await db.query<{ booked: number }>("select booked from repair_slots where id = '50000000-0000-0000-0000-000000000003'");
    expect(s.rows[0].booked).toBe(0);
  });
  it("accepts only guest-folder photo paths and at most 3", async () => {
    const ok = "guest/123e4567-e89b-12d3-a456-426614174000.jpg";
    expect((await book(booking({ photo_paths: [ok] }))).ticket_number).toBeTruthy();
    await expect(book(booking({ photo_paths: [ok, ok, ok, ok] }))).rejects.toThrow(/TOO_MANY_PHOTOS/);
  });
  it("cannot be called by browser roles", async () => {
    await db.exec("set role anon");
    try { await expect(db.query("select create_repair_booking('{}'::jsonb)")).rejects.toThrow(); }
    finally { await db.exec("reset role"); }
  });
});

describe("seed file", () => {
  it("loads the 10 mobile services inactive and unpriced", async () => {
    const seed = readFileSync(path.resolve(__dirname, "../../../supabase/seed/repair_services.sql"), "utf8");
    await db.exec(seed);
    const r = await db.query<{ n: number; active: number; priced: number }>(
      "select count(*)::int n, count(*) filter (where active)::int active, count(*) filter (where starting_price is not null)::int priced from repair_services where slug in ('screen-replacement','battery-replacement','charging-port-repair','back-glass-replacement','software-troubleshooting','camera-repair','speaker-mic-repair','water-damage-diagnosis','power-motherboard','other-hardware')");
    expect(r.rows[0]).toEqual({ n: 10, active: 0, priced: 0 });
  });
});

describe("track_repair", () => {
  it("returns data for ticket + token, and for ticket + phone (any formatting)", async () => {
    const r = await book(booking());
    expect((await track(r.ticket_number, r.tracking_token))?.status).toBe("requested");
    expect((await track(r.ticket_number.toLowerCase(), "98200-11111"))?.device).toBe("Samsung Galaxy A");
  });
  it("returns nothing for a wrong secret, wrong phone, short secret or unknown ticket", async () => {
    const r = await book(booking());
    expect(await track(r.ticket_number, "wrongtoken-wrongtoken")).toBeNull();
    expect(await track(r.ticket_number, "9999999999")).toBeNull();
    expect(await track(r.ticket_number, "123")).toBeNull();
    expect(await track("FSR-0", r.tracking_token)).toBeNull();
  });
  it("never leaks internal notes, address or contact details", async () => {
    const r = await book(booking());
    await db.exec(`update repair_tickets set internal_notes = 'SECRET-NOTE' where ticket_number = '${r.ticket_number}'`);
    const json = JSON.stringify(await track(r.ticket_number, r.tracking_token));
    expect(json).not.toContain("SECRET-NOTE");
    expect(json).not.toContain("12 Test Rd");
    expect(json).not.toContain("98200");
  });
  it("hides staff-only history and draft quotes, shows only first name of technician", async () => {
    const r = await book(booking());
    const id = (await db.query<{ id: string }>(`select id from repair_tickets where ticket_number = '${r.ticket_number}'`)).rows[0].id;
    await db.exec(`
      insert into technicians (id, name) values ('60000000-0000-0000-0000-000000000001', 'Ravi Kumar Sharma');
      update repair_tickets set technician_id = '60000000-0000-0000-0000-000000000001' where id = '${id}';
      insert into repair_status_history (ticket_id, status, note, customer_visible) values ('${id}', 'diagnosing', 'internal only', false);
      insert into repair_quotes (ticket_id, status, total) values ('${id}', 'draft', 999);`);
    const t = (await track(r.ticket_number, r.tracking_token))!;
    expect(t.technician_first_name).toBe("Ravi");
    expect(JSON.stringify(t)).not.toContain("internal only");
    expect(t.quote).toBeNull();
  });
});

describe("decide_repair_quote", () => {
  const setup = async () => {
    const r = await book(booking());
    const id = (await db.query<{ id: string }>(`select id from repair_tickets where ticket_number = '${r.ticket_number}'`)).rows[0].id;
    const q = (await db.query<{ id: string }>(`insert into repair_quotes (ticket_id, status, total, valid_until) values ('${id}', 'sent', 1500, current_date + 3) returning id`)).rows[0].id;
    return { r, id, q };
  };
  const decide = (t: string, s: string, q: string, a: boolean) => db.query("select decide_repair_quote($1, $2, $3::uuid, $4)", [t, s, q, a]);

  it("records approval on the quote, the ticket and the history", async () => {
    const { r, q } = await setup();
    await decide(r.ticket_number, r.tracking_token, q, true);
    const t = (await track(r.ticket_number, r.tracking_token))!;
    expect(t.status).toBe("approved");
    expect((t.quote as { status: string }).status).toBe("approved");
    expect(JSON.stringify(t.history)).toContain("Customer approved");
  });
  it("records a decline", async () => {
    const { r, q } = await setup();
    await decide(r.ticket_number, r.tracking_token, q, false);
    expect((await track(r.ticket_number, r.tracking_token))!.status).toBe("declined");
  });
  it("cannot decide twice, with a wrong secret, or for another ticket's quote", async () => {
    const a = await setup();
    const b = await setup();
    await decide(a.r.ticket_number, a.r.tracking_token, a.q, true);
    await expect(decide(a.r.ticket_number, a.r.tracking_token, a.q, false)).rejects.toThrow(/QUOTE_NOT_PENDING/);
    await expect(decide(b.r.ticket_number, "wrongsecret-wrongsecret", b.q, true)).rejects.toThrow(/NOT_FOUND/);
    await expect(decide(b.r.ticket_number, b.r.tracking_token, a.q, true)).rejects.toThrow(/QUOTE_NOT_PENDING/);
  });
  it("refuses expired quotes", async () => {
    const { r, id, q } = await setup();
    await db.exec(`update repair_quotes set valid_until = current_date - 1 where ticket_id = '${id}'`);
    await expect(decide(r.ticket_number, r.tracking_token, q, true)).rejects.toThrow(/QUOTE_EXPIRED/);
  });
});
