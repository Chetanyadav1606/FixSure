-- FixSure core schema. Money columns are numeric(12,2) INR. All timestamps are timestamptz (UTC); display in Asia/Kolkata.
-- Apply with: supabase db push   (see docs/DEPLOYMENT.md)

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ───────────── enums ─────────────
create type app_role as enum ('customer', 'b2b', 'technician', 'staff', 'admin');
create type device_type as enum ('laptop', 'desktop', 'mobile', 'accessory');
create type product_condition as enum ('new', 'refurbished', 'oem_pulled', 'compatible_aftermarket');
create type compat_status as enum ('confirmed', 'potential', 'unverified', 'incompatible');
create type order_status as enum ('pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded');
create type payment_status as enum ('created', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded', 'cod_pending', 'cod_collected');
create type payment_method as enum ('razorpay', 'cod', 'bank_transfer', 'credit_terms');
create type refund_status as enum ('requested', 'approved', 'processed', 'rejected');
create type repair_status as enum ('requested', 'confirmed', 'device_received', 'diagnosing', 'quote_pending', 'approved', 'repairing', 'quality_check', 'ready', 'completed', 'cancelled', 'declined');
create type quote_status as enum ('draft', 'sent', 'approved', 'declined', 'expired');
create type b2b_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type coupon_kind as enum ('percent', 'fixed');
create type movement_kind as enum ('purchase', 'sale', 'return', 'adjustment', 'reservation', 'release', 'damage');
create type po_status as enum ('draft', 'ordered', 'partially_received', 'received', 'cancelled');
create type ticket_status as enum ('open', 'pending', 'resolved', 'closed');

-- ───────────── helpers ─────────────
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ───────────── identity ─────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role app_role not null default 'customer',
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();

-- Role lookups used by RLS. SECURITY DEFINER so policies on profiles do not recurse.
create or replace function current_app_role() returns app_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;
create or replace function is_staff() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('staff', 'admin') from profiles where id = auth.uid()), false)
$$;
create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false)
$$;

-- New auth users always start as 'customer'. Never trust client-supplied metadata for role.
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- Block privilege escalation: only an existing admin (or the service role / SQL editor) may change role.
create or replace function guard_profile_role() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role then
    if auth.uid() is not null and not is_admin() then
      raise exception 'Only an administrator can change roles';
    end if;
  end if;
  return new;
end $$;
create trigger trg_guard_profile_role before update on profiles for each row execute function guard_profile_role();

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  landmark text,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  gstin text check (gstin is null or gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$'),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on addresses (user_id);
create trigger trg_addresses_updated before update on addresses for each row execute function set_updated_at();

-- ───────────── catalogue ─────────────
create table brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references categories(id) on delete set null,
  slug text not null unique,
  name text not null,
  device_type device_type not null,
  description text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on categories (parent_id);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text not null unique,
  name text not null,
  brand_id uuid references brands(id),
  category_id uuid not null references categories(id),
  description text,
  condition product_condition not null default 'new',
  price numeric(12,2) not null check (price >= 0),
  mrp numeric(12,2) check (mrp is null or mrp >= price),
  hsn_code text,
  -- NULL means "not configured"; the checkout refuses to sell products without a tax rate.
  tax_rate_percent numeric(5,2) check (tax_rate_percent is null or (tax_rate_percent >= 0 and tax_rate_percent <= 100)),
  warranty_months int check (warranty_months is null or warranty_months >= 0),
  weight_grams int check (weight_grams is null or weight_grams > 0),
  oem_numbers text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  b2b_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on products (category_id);
create index on products (brand_id);
create index on products (active, featured);
create index products_name_trgm on products using gin (name gin_trgm_ops);
create index products_oem_gin on products using gin (oem_numbers);
create trigger trg_products_updated before update on products for each row execute function set_updated_at();

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt_text text not null,
  sort_order int not null default 0
);
create index on product_images (product_id, sort_order);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text not null unique,
  label text not null,
  price_delta numeric(12,2) not null default 0,
  active boolean not null default true
);
create index on product_variants (product_id);

create table product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  spec_key text not null,
  spec_value text not null,
  sort_order int not null default 0,
  unique (product_id, spec_key)
);

-- Related products (symmetry not enforced).
create table product_related (
  product_id uuid not null references products(id) on delete cascade,
  related_id uuid not null references products(id) on delete cascade,
  primary key (product_id, related_id),
  check (product_id <> related_id)
);

-- ───────────── compatibility (normalized) ─────────────
create table device_models (
  id uuid primary key default gen_random_uuid(),
  device_type device_type not null,
  manufacturer text not null,
  series text not null,
  model text not null,
  submodel text,
  identifiers text[] not null default '{}', -- manufacturer part / model numbers
  active boolean not null default true,
  unique (device_type, manufacturer, series, model, submodel)
);
create index device_models_trgm on device_models using gin ((manufacturer || ' ' || series || ' ' || model) gin_trgm_ops);
create index device_models_ids on device_models using gin (identifiers);

-- One row per (model, product). Absence of a row == not verified.
create table product_compatibility (
  device_model_id uuid not null references device_models(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  status compat_status not null,
  note text,
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  primary key (device_model_id, product_id)
);
create index on product_compatibility (product_id);

create table part_identification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  device_description text not null,
  details text,
  photo_paths text[] not null default '{}',
  status ticket_status not null default 'open',
  created_at timestamptz not null default now()
);

-- ───────────── inventory ─────────────
create table inventory (
  product_id uuid primary key references products(id) on delete cascade,
  on_hand int not null default 0 check (on_hand >= 0),
  reserved int not null default 0 check (reserved >= 0),
  reorder_level int not null default 0 check (reorder_level >= 0),
  updated_at timestamptz not null default now(),
  check (reserved <= on_hand)
);

create table inventory_movements (
  id bigint generated always as identity primary key,
  product_id uuid not null references products(id) on delete cascade,
  kind movement_kind not null,
  quantity int not null check (quantity <> 0),
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index on inventory_movements (product_id, created_at desc);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  phone text,
  email text,
  gstin text,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique,
  supplier_id uuid not null references suppliers(id),
  status po_status not null default 'draft',
  expected_on date,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_po_updated before update on purchase_orders for each row execute function set_updated_at();

create table purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null check (quantity > 0),
  received_quantity int not null default 0 check (received_quantity >= 0 and received_quantity <= quantity),
  unit_cost numeric(12,2) not null check (unit_cost >= 0)
);
create index on purchase_order_items (purchase_order_id);

-- ───────────── B2B ─────────────
create table b2b_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  business_name text not null,
  business_type text not null,
  gstin text not null check (gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$'),
  contact_phone text not null,
  address text not null,
  status b2b_status not null default 'pending',
  credit_terms_days int not null default 0 check (credit_terms_days >= 0), -- only an admin may set > 0
  credit_limit numeric(12,2) not null default 0 check (credit_limit >= 0),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create table wholesale_price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  min_quantity int not null check (min_quantity >= 1),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  unique (product_id, min_quantity)
);

create table quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  business_name text,
  contact_name text not null,
  phone text not null,
  email text not null,
  details text not null,
  po_reference text,
  status ticket_status not null default 'open',
  response_note text,
  created_at timestamptz not null default now()
);

-- ───────────── commerce ─────────────
create table carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table cart_items (
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity int not null check (quantity between 1 and 999),
  primary key (cart_id, product_id)
);

create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  kind coupon_kind not null,
  value numeric(12,2) not null check (value > 0),
  min_order numeric(12,2) not null default 0,
  max_discount numeric(12,2),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int check (usage_limit is null or usage_limit > 0),
  times_used int not null default 0,
  per_user_limit int not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create sequence invoice_seq start 1;
create sequence order_seq start 1000;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references profiles(id) on delete set null,
  guest_email text,
  -- Idempotency: one order per (user, key). Retried checkouts return the same order.
  idempotency_key text,
  status order_status not null default 'pending_payment',
  is_b2b boolean not null default false,
  po_reference text,
  shipping_address jsonb not null,
  billing_address jsonb,
  buyer_gstin text,
  subtotal numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null,
  cgst numeric(12,2) not null default 0,
  sgst numeric(12,2) not null default 0,
  igst numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null check (grand_total >= 0),
  coupon_code text,
  invoice_number text unique,
  invoiced_at timestamptz,
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index on orders (user_id, placed_at desc);
create index on orders (status);
create trigger trg_orders_updated before update on orders for each row execute function set_updated_at();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  sku text not null,
  name text not null, -- snapshot
  hsn_code text,
  quantity int not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  taxable_value numeric(12,2) not null,
  tax_rate_percent numeric(5,2) not null,
  tax_amount numeric(12,2) not null,
  line_total numeric(12,2) not null
);
create index on order_items (order_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  method payment_method not null,
  status payment_status not null default 'created',
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'INR',
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on payments (order_id);
create trigger trg_payments_updated before update on payments for each row execute function set_updated_at();

-- Webhook de-duplication: the unique event id makes handling idempotent.
create table payment_webhook_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  payment_id uuid references payments(id),
  amount numeric(12,2) not null check (amount > 0),
  reason text,
  status refund_status not null default 'requested',
  razorpay_refund_id text unique,
  requested_by uuid references profiles(id),
  processed_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_refunds_updated before update on refunds for each row execute function set_updated_at();

create table shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  courier text,
  tracking_number text,
  status text not null default 'pending',
  shiprocket_order_id text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
create index on shipments (order_id);

create table serviceable_pincodes (
  pincode text primary key check (pincode ~ '^[1-9][0-9]{5}$'),
  city text,
  state text,
  cod_available boolean not null default false,
  active boolean not null default true
);

create table shipping_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  base_charge numeric(12,2) not null default 0,
  free_above numeric(12,2),
  eta_text text,
  active boolean not null default true
);

create table coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons(id),
  order_id uuid not null references orders(id) on delete cascade,
  user_id uuid references profiles(id),
  amount numeric(12,2) not null,
  created_at timestamptz not null default now(),
  unique (coupon_id, order_id)
);

create table wishlists (
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  reason text not null,
  status ticket_status not null default 'open',
  created_at timestamptz not null default now()
);

-- Verified-purchase reviews only (order_item_id required).
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  order_item_id uuid not null references order_items(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, order_item_id)
);
create index on reviews (product_id) where approved;

-- ───────────── repairs ─────────────
create table technicians (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references profiles(id) on delete set null,
  name text not null,
  phone text,
  skills text[] not null default '{}',
  active boolean not null default true
);

create table repair_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  kind text not null check (kind in ('store_dropoff', 'doorstep', 'pickup')),
  active boolean not null default true
);

create table repair_services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  device_type device_type not null,
  name text not null,
  description text,
  diagnostic_fee numeric(12,2) not null default 0,
  starting_price numeric(12,2), -- null => "quote after diagnosis"
  active boolean not null default false, -- offerings are off until the owner enables them
  doorstep_available boolean not null default false,
  sort_order int not null default 0
);

create sequence repair_seq start 1000;

create table repair_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  tracking_token text not null unique default encode(gen_random_bytes(12), 'hex'),
  user_id uuid references profiles(id) on delete set null,
  service_id uuid references repair_services(id),
  device_type device_type not null,
  manufacturer text not null,
  model text not null,
  issue_summary text not null,
  issue_details text,
  photo_paths text[] not null default '{}',
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  fulfilment text not null check (fulfilment in ('store_dropoff', 'doorstep', 'pickup')),
  location_id uuid references repair_locations(id),
  address jsonb,
  preferred_slot timestamptz,
  status repair_status not null default 'requested',
  technician_id uuid references technicians(id),
  diagnostic_fee numeric(12,2) not null default 0,
  labour_cost numeric(12,2) not null default 0,
  internal_notes text,
  warranty_until date,
  invoice_number text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on repair_tickets (user_id, created_at desc);
create index on repair_tickets (status);
create trigger trg_repair_tickets_updated before update on repair_tickets for each row execute function set_updated_at();

create table repair_status_history (
  id bigint generated always as identity primary key,
  ticket_id uuid not null references repair_tickets(id) on delete cascade,
  status repair_status not null,
  note text,
  customer_visible boolean not null default true,
  changed_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
create index on repair_status_history (ticket_id, created_at);

create table repair_quotes (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references repair_tickets(id) on delete cascade,
  status quote_status not null default 'draft',
  parts_total numeric(12,2) not null default 0,
  labour_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  valid_until date,
  notes text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index on repair_quotes (ticket_id);

create table repair_parts_used (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references repair_tickets(id) on delete cascade,
  product_id uuid references products(id),
  description text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0)
);

-- ───────────── support / content / settings / audit ─────────────
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on notifications (user_id, created_at desc);

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  order_id uuid references orders(id) on delete set null,
  status ticket_status not null default 'open',
  created_at timestamptz not null default now()
);

create table content_blocks (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id)
);

create table newsletter_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

create table store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  ip text,
  created_at timestamptz not null default now()
);
create index on audit_logs (entity, entity_id);
create index on audit_logs (created_at desc);

-- ───────────── transaction-safe stock functions ─────────────
-- Reserve stock for an order. Row-locks each inventory row, so concurrent checkouts cannot oversell.
create or replace function reserve_stock(p_order_id uuid, p_items jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare it record; inv inventory%rowtype;
begin
  for it in select (x->>'product_id')::uuid as product_id, (x->>'quantity')::int as qty
            from jsonb_array_elements(p_items) x order by 1 -- consistent lock order prevents deadlocks
  loop
    select * into inv from inventory where product_id = it.product_id for update;
    if not found or (inv.on_hand - inv.reserved) < it.qty then
      raise exception 'INSUFFICIENT_STOCK:%', it.product_id using errcode = 'P0001';
    end if;
    update inventory set reserved = reserved + it.qty, updated_at = now() where product_id = it.product_id;
    insert into inventory_movements (product_id, kind, quantity, reference_type, reference_id)
    values (it.product_id, 'reservation', it.qty, 'order', p_order_id);
  end loop;
end $$;

-- Commit reserved stock after captured payment (or confirmed COD).
create or replace function commit_stock(p_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare it record;
begin
  for it in select product_id, quantity from order_items where order_id = p_order_id and product_id is not null order by product_id
  loop
    update inventory set on_hand = on_hand - it.quantity, reserved = greatest(reserved - it.quantity, 0), updated_at = now()
      where product_id = it.product_id;
    insert into inventory_movements (product_id, kind, quantity, reference_type, reference_id)
    values (it.product_id, 'sale', -it.quantity, 'order', p_order_id);
  end loop;
end $$;

-- Release a reservation (payment failed / order cancelled before commit).
create or replace function release_stock(p_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare it record;
begin
  for it in select product_id, quantity from order_items where order_id = p_order_id and product_id is not null order by product_id
  loop
    update inventory set reserved = greatest(reserved - it.quantity, 0), updated_at = now() where product_id = it.product_id;
    insert into inventory_movements (product_id, kind, quantity, reference_type, reference_id)
    values (it.product_id, 'release', -it.quantity, 'order', p_order_id);
  end loop;
end $$;

-- Stock functions are server-only.
revoke all on function reserve_stock(uuid, jsonb), commit_stock(uuid), release_stock(uuid) from public, anon, authenticated;

-- Gapless-enough invoice numbers, e.g. FS/2026-27/000123 (financial year Apr–Mar). Verify format with your CA.
create or replace function next_invoice_number() returns text language plpgsql security definer set search_path = public as $$
declare ist timestamp := (now() at time zone 'Asia/Kolkata'); fy_start int;
begin
  fy_start := case when extract(month from ist) >= 4 then extract(year from ist)::int else extract(year from ist)::int - 1 end;
  return 'FS/' || fy_start || '-' || lpad(((fy_start + 1) % 100)::text, 2, '0') || '/' || lpad(nextval('invoice_seq')::text, 6, '0');
end $$;
revoke all on function next_invoice_number() from public, anon, authenticated;
