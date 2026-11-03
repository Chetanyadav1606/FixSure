// @vitest-environment node
/**
 * Executes the real migrations on PGlite (WASM Postgres) with minimal stand-ins for Supabase's
 * `auth` and `storage` schemas, then checks RLS, role-escalation and stock-safety behaviour.
 */
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
const GRANTS = `
  grant usage on schema public, auth to anon, authenticated;
  grant all on all tables in schema public to anon, authenticated;
  grant all on all sequences in schema public to anon, authenticated;
  grant execute on all functions in schema public to anon, authenticated;
  revoke all on function reserve_stock(uuid, jsonb), commit_stock(uuid), release_stock(uuid), next_invoice_number() from public, anon, authenticated;
`;

const ADMIN = "00000000-0000-0000-0000-0000000000a1";
const ALICE = "00000000-0000-0000-0000-0000000000b1";
const BOB = "00000000-0000-0000-0000-0000000000b2";

let db: PGlite;

/** Run a callback as a given role/user (mirrors Supabase's request context). */
async function as<T>(role: "anon" | "authenticated" | "postgres", sub: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${role}; select set_config('request.jwt.sub', '${sub ?? ""}', false);`);
  try { return await fn(); } finally { await db.exec("reset role;"); }
}

beforeAll(async () => {
  db = new PGlite({ extensions: { pg_trgm, pgcrypto } });
  await db.exec(STUBS);
  await db.exec(mig("0001_schema.sql"));
  await db.exec(mig("0002_rls_storage.sql"));
  await db.exec(GRANTS);

  for (const [id, name] of [[ADMIN, "Admin"], [ALICE, "Alice"], [BOB, "Bob"]]) {
    await db.exec(`insert into auth.users (id, raw_user_meta_data) values ('${id}', '{"full_name":"${name}"}')`);
  }
  await db.exec(`update profiles set role = 'admin' where id = '${ADMIN}'`);
  await db.exec(`
    insert into categories (id, slug, name, device_type) values ('10000000-0000-0000-0000-000000000001', 'c', 'C', 'laptop');
    insert into products (id, slug, sku, name, category_id, price) values
      ('20000000-0000-0000-0000-000000000001', 'p1', 'DEMO-1', 'P1', '10000000-0000-0000-0000-000000000001', 100),
      ('20000000-0000-0000-0000-000000000002', 'p2', 'DEMO-2', 'P2', '10000000-0000-0000-0000-000000000001', 100);
    update products set active = true;
    insert into inventory (product_id, on_hand) values ('20000000-0000-0000-0000-000000000001', 5);
    insert into wholesale_price_tiers (product_id, min_quantity, unit_price) values ('20000000-0000-0000-0000-000000000001', 10, 80);
    insert into orders (id, order_number, user_id, shipping_address, subtotal, tax_total, grand_total) values
      ('30000000-0000-0000-0000-000000000001', 'FS-1', '${ALICE}', '{}', 100, 0, 100),
      ('30000000-0000-0000-0000-000000000002', 'FS-2', '${BOB}', '{}', 100, 0, 100);
  `);
}, 60000);

afterAll(async () => { await db?.close(); });

describe("migrations apply", () => {
  it("creates the core tables and auto-provisions a customer profile", async () => {
    // Spec tables. "roles" is modelled as the profiles.role enum (see PROJECT_STATUS decisions).
    const required = ["profiles", "addresses", "brands", "categories", "products", "product_images", "product_variants", "product_compatibility",
      "product_specifications", "inventory", "inventory_movements", "suppliers", "purchase_orders", "purchase_order_items", "carts", "cart_items",
      "orders", "order_items", "payments", "refunds", "shipments", "coupons", "coupon_redemptions", "reviews", "repair_services", "repair_tickets",
      "repair_status_history", "repair_quotes", "repair_parts_used", "technicians", "b2b_applications", "wholesale_price_tiers", "quote_requests",
      "notifications", "support_tickets", "store_settings", "audit_logs"];
    const t = await db.query<{ table_name: string }>("select table_name from information_schema.tables where table_schema='public'");
    const have = new Set(t.rows.map((r) => r.table_name));
    expect(required.filter((r) => !have.has(r))).toEqual([]);
    const p = await db.query<{ role: string }>(`select role from profiles where id='${ALICE}'`);
    expect(p.rows[0].role).toBe("customer");
  });
});

describe("RLS: customer data isolation", () => {
  it("a customer sees only their own orders", async () => {
    const rows = await as("authenticated", ALICE, async () => (await db.query<{ order_number: string }>("select order_number from orders")).rows);
    expect(rows.map((r) => r.order_number)).toEqual(["FS-1"]);
  });
  it("anonymous users see no orders", async () => {
    const rows = await as("anon", null, async () => (await db.query("select 1 from orders")).rows);
    expect(rows).toHaveLength(0);
  });
  it("a customer cannot insert an order directly (server-only)", async () => {
    await expect(as("authenticated", ALICE, () =>
      db.exec(`insert into orders (order_number, user_id, shipping_address, subtotal, tax_total, grand_total) values ('X', '${ALICE}', '{}', 1, 0, 1)`))).rejects.toThrow();
  });
  it("a customer cannot read another customer's profile", async () => {
    const rows = await as("authenticated", ALICE, async () => (await db.query(`select 1 from profiles where id='${BOB}'`)).rows);
    expect(rows).toHaveLength(0);
  });
});

describe("RLS: privilege escalation", () => {
  it("a customer cannot promote themselves to admin", async () => {
    await expect(as("authenticated", ALICE, () => db.exec(`update profiles set role = 'admin' where id = '${ALICE}'`))).rejects.toThrow(/administrator/i);
    const r = await db.query<{ role: string }>(`select role from profiles where id='${ALICE}'`);
    expect(r.rows[0].role).toBe("customer");
  });
  it("a customer cannot modify another user's profile", async () => {
    await as("authenticated", ALICE, () => db.exec(`update profiles set full_name = 'hacked' where id = '${BOB}'`));
    const r = await db.query<{ full_name: string }>(`select full_name from profiles where id='${BOB}'`);
    expect(r.rows[0].full_name).toBe("Bob");
  });
  it("an admin can change roles", async () => {
    await as("authenticated", ADMIN, () => db.exec(`update profiles set role = 'staff' where id = '${BOB}'`));
    expect((await db.query<{ role: string }>(`select role from profiles where id='${BOB}'`)).rows[0].role).toBe("staff");
    await db.exec(`update profiles set role = 'customer' where id = '${BOB}'`);
  });
  it("staff-only tables reject customers (audit logs)", async () => {
    await db.exec(`insert into audit_logs (action, entity) values ('t', 't')`);
    const rows = await as("authenticated", ALICE, async () => (await db.query("select 1 from audit_logs")).rows);
    expect(rows).toHaveLength(0);
  });
});

describe("RLS: catalogue and wholesale pricing", () => {
  it("anon can read active products", async () => {
    const rows = await as("anon", null, async () => (await db.query("select sku from products order by sku")).rows);
    expect(rows).toHaveLength(2);
  });
  it("anon and non-approved customers cannot read wholesale tiers", async () => {
    expect(await as("anon", null, async () => (await db.query("select 1 from wholesale_price_tiers")).rows)).toHaveLength(0);
    expect(await as("authenticated", ALICE, async () => (await db.query("select 1 from wholesale_price_tiers")).rows)).toHaveLength(0);
  });
  it("an approved business account can read wholesale tiers; pending cannot", async () => {
    await db.exec(`insert into b2b_applications (user_id, business_name, business_type, gstin, contact_phone, address, status)
      values ('${ALICE}', 'Shop', 'repair', '27ABCDE1234F1Z5', '9999999999', 'x', 'pending')`);
    expect(await as("authenticated", ALICE, async () => (await db.query("select 1 from wholesale_price_tiers")).rows)).toHaveLength(0);
    await db.exec(`update b2b_applications set status='approved' where user_id='${ALICE}'`);
    expect(await as("authenticated", ALICE, async () => (await db.query("select 1 from wholesale_price_tiers")).rows)).toHaveLength(1);
  });
  it("customers cannot self-approve or self-grant credit terms on B2B application", async () => {
    await expect(as("authenticated", BOB, () => db.exec(
      `insert into b2b_applications (user_id, business_name, business_type, gstin, contact_phone, address, status, credit_terms_days)
       values ('${BOB}', 'S', 'r', '27ABCDE1234F1Z5', '9', 'x', 'approved', 30)`))).rejects.toThrow();
  });
  it("raw inventory counts are not readable by the public, but availability view is", async () => {
    expect(await as("anon", null, async () => (await db.query("select 1 from inventory")).rows)).toHaveLength(0);
    const v = await as("anon", null, async () => (await db.query<{ in_stock: boolean }>("select in_stock from product_availability")).rows);
    expect(v[0].in_stock).toBe(true);
  });
});

describe("transaction-safe stock", () => {
  const P1 = "20000000-0000-0000-0000-000000000001";
  it("reserves, refuses oversell, and releases", async () => {
    await db.exec(`select reserve_stock('30000000-0000-0000-0000-000000000001', '[{"product_id":"${P1}","quantity":3}]'::jsonb)`);
    await expect(db.exec(`select reserve_stock('30000000-0000-0000-0000-000000000002', '[{"product_id":"${P1}","quantity":3}]'::jsonb)`)).rejects.toThrow(/INSUFFICIENT_STOCK/);
    const inv = await db.query<{ reserved: number }>(`select reserved from inventory where product_id='${P1}'`);
    expect(inv.rows[0].reserved).toBe(3);
    await db.exec(`insert into order_items (order_id, product_id, sku, name, quantity, unit_price, taxable_value, tax_rate_percent, tax_amount, line_total)
      values ('30000000-0000-0000-0000-000000000001', '${P1}', 'DEMO-1', 'P1', 3, 100, 300, 0, 0, 300)`);
    await db.exec(`select release_stock('30000000-0000-0000-0000-000000000001')`);
    expect((await db.query<{ reserved: number }>(`select reserved from inventory where product_id='${P1}'`)).rows[0].reserved).toBe(0);
  });
  it("commit_stock decrements on-hand and logs a sale movement", async () => {
    await db.exec(`select reserve_stock('30000000-0000-0000-0000-000000000001', '[{"product_id":"${P1}","quantity":3}]'::jsonb)`);
    await db.exec(`select commit_stock('30000000-0000-0000-0000-000000000001')`);
    const r = await db.query<{ on_hand: number; reserved: number }>(`select on_hand, reserved from inventory where product_id='${P1}'`);
    expect(r.rows[0]).toEqual({ on_hand: 2, reserved: 0 });
    const m = await db.query(`select 1 from inventory_movements where kind='sale'`);
    expect(m.rows.length).toBe(1);
  });
  it("stock functions are not callable by customers", async () => {
    await expect(as("authenticated", ALICE, () => db.exec(`select reserve_stock('30000000-0000-0000-0000-000000000001', '[]'::jsonb)`))).rejects.toThrow();
  });
});

describe("constraints", () => {
  it("rejects invalid pincode, negative stock, and duplicate webhook event ids", async () => {
    await expect(db.exec(`insert into serviceable_pincodes (pincode) values ('012345')`)).rejects.toThrow();
    await expect(db.exec(`update inventory set on_hand = -1`)).rejects.toThrow();
    await db.exec(`insert into payment_webhook_events (event_id, event_type) values ('evt_1', 'payment.captured')`);
    await expect(db.exec(`insert into payment_webhook_events (event_id, event_type) values ('evt_1', 'payment.captured')`)).rejects.toThrow();
  });
  it("generates India-FY invoice numbers", async () => {
    const r = await db.query<{ n: string }>("select next_invoice_number() n");
    expect(r.rows[0].n).toMatch(/^FS\/\d{4}-\d{2}\/\d{6}$/);
  });
});
