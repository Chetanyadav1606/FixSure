-- Repair booking backend: service areas, appointment slots, atomic booking, secure tracking, quote approval.
-- All three functions are SERVER-ONLY (called from Next.js with the service-role key); they are
-- revoked from anon/authenticated so browsers can never call them directly.

create table repair_service_areas (
  pincode text primary key check (pincode ~ '^[1-9][0-9]{5}$'),
  city text not null,
  state text not null default 'Maharashtra',
  doorstep boolean not null default false,
  pickup boolean not null default false,
  active boolean not null default true
);

create table repair_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  fulfilment text not null check (fulfilment in ('store_dropoff', 'doorstep', 'pickup')),
  capacity int not null check (capacity > 0),
  booked int not null default 0 check (booked >= 0 and booked <= capacity),
  active boolean not null default true
);
create index on repair_slots (starts_at) where active;

-- Display metadata for service cards. Duration/price are shown ONLY when the owner fills them in.
alter table repair_services add column category text not null default 'common' check (category in ('common', 'advanced'));
alter table repair_services add column est_duration_text text;
alter table repair_services add column icon_key text;

alter table repair_tickets add column slot_id uuid references repair_slots(id);
alter table repair_tickets add column place_type text check (place_type in ('home', 'office', 'other'));

alter table repair_service_areas enable row level security;
alter table repair_slots enable row level security;
create policy staff_all on repair_service_areas for all to authenticated using (is_staff()) with check (is_staff());
create policy staff_all on repair_slots for all to authenticated using (is_staff()) with check (is_staff());
create policy areas_public on repair_service_areas for select using (active);
create policy slots_public on repair_slots for select using (active and booked < capacity and starts_at > now());

-- ───────── create booking (atomic) ─────────
create or replace function create_repair_booking(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  svc repair_services%rowtype;
  area repair_service_areas%rowtype;
  slot repair_slots%rowtype;
  t repair_tickets%rowtype;
  v_fulfil text := p->>'fulfilment';
  v_pin text := p->'address'->>'pincode';
  v_photos text[] := coalesce(array(select jsonb_array_elements_text(coalesce(p->'photo_paths', '[]'::jsonb))), '{}');
  v_photo text;
begin
  if v_fulfil not in ('store_dropoff', 'doorstep', 'pickup') then raise exception 'INVALID_FULFILMENT' using errcode = 'P0001'; end if;

  if p->>'service_id' is not null then
    select * into svc from repair_services where id = (p->>'service_id')::uuid;
    if not found or not svc.active then raise exception 'SERVICE_UNAVAILABLE' using errcode = 'P0001'; end if;
    if v_fulfil = 'doorstep' and not svc.doorstep_available then raise exception 'DOORSTEP_UNAVAILABLE' using errcode = 'P0001'; end if;
  end if;

  if v_fulfil in ('doorstep', 'pickup') then
    select * into area from repair_service_areas where pincode = v_pin and active;
    if not found or (v_fulfil = 'doorstep' and not area.doorstep) or (v_fulfil = 'pickup' and not area.pickup) then
      raise exception 'AREA_NOT_SERVED' using errcode = 'P0001';
    end if;
  end if;

  if coalesce(array_length(v_photos, 1), 0) > 3 then raise exception 'TOO_MANY_PHOTOS' using errcode = 'P0001'; end if;
  foreach v_photo in array v_photos loop
    if v_photo !~ '^guest/[0-9a-f-]{36}\.(jpg|png|webp)$' then raise exception 'INVALID_PHOTO' using errcode = 'P0001'; end if;
  end loop;

  if p->>'slot_id' is not null then
    select * into slot from repair_slots where id = (p->>'slot_id')::uuid for update; -- row lock: capacity can't be exceeded
    if not found or not slot.active or slot.starts_at <= now() or slot.booked >= slot.capacity or slot.fulfilment <> v_fulfil then
      raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
    end if;
    update repair_slots set booked = booked + 1 where id = slot.id;
  end if;

  insert into repair_tickets (
    ticket_number, user_id, service_id, device_type, manufacturer, model, issue_summary, issue_details, photo_paths,
    contact_name, contact_phone, contact_email, fulfilment, address, place_type, preferred_slot, slot_id, diagnostic_fee
  ) values (
    'FSR-' || nextval('repair_seq'), nullif(p->>'user_id', '')::uuid, svc.id, (p->>'device_type')::device_type,
    p->>'manufacturer', p->>'model', p->>'issue_summary', p->>'issue_details', v_photos,
    p->>'contact_name', p->>'contact_phone', nullif(p->>'contact_email', ''), v_fulfil, p->'address', p->>'place_type',
    case when slot.id is not null then slot.starts_at end, slot.id, coalesce(svc.diagnostic_fee, 0)
  ) returning * into t;

  insert into repair_status_history (ticket_id, status, note) values (t.id, 'requested', 'Booking received');
  return jsonb_build_object('ticket_number', t.ticket_number, 'tracking_token', t.tracking_token, 'status', t.status);
end $$;

-- ───────── shared access check for tracking ─────────
-- A caller must know the ticket number AND either the tracking token or the phone number on the booking.
create or replace function _repair_ticket_for(p_ticket text, p_secret text) returns repair_tickets
language plpgsql stable security definer set search_path = public as $$
declare t repair_tickets%rowtype; d text := regexp_replace(coalesce(p_secret, ''), '\D', '', 'g');
begin
  if length(coalesce(p_secret, '')) < 6 then return null; end if;
  select * into t from repair_tickets where ticket_number = upper(trim(p_ticket));
  if not found then return null; end if;
  if t.tracking_token = trim(p_secret) or (length(d) >= 10 and right(regexp_replace(t.contact_phone, '\D', '', 'g'), 10) = right(d, 10)) then
    return t;
  end if;
  return null;
end $$;

create or replace function track_repair(p_ticket text, p_secret text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t repair_tickets := _repair_ticket_for(p_ticket, p_secret); q repair_quotes%rowtype; tech text;
begin
  if t.id is null then return null; end if;
  select * into q from repair_quotes where ticket_id = t.id and status <> 'draft' order by created_at desc limit 1;
  select split_part(name, ' ', 1) into tech from technicians where id = t.technician_id; -- first name only
  return jsonb_build_object(
    'ticket_number', t.ticket_number, 'status', t.status, 'device', t.manufacturer || ' ' || t.model,
    'issue', t.issue_summary, 'fulfilment', t.fulfilment, 'appointment', t.preferred_slot, 'created_at', t.created_at,
    'technician_first_name', tech,
    'history', coalesce((select jsonb_agg(jsonb_build_object('status', h.status, 'note', h.note, 'at', h.created_at) order by h.created_at)
                         from repair_status_history h where h.ticket_id = t.id and h.customer_visible), '[]'::jsonb),
    'quote', case when q.id is null then null else jsonb_build_object('id', q.id, 'status', q.status, 'parts_total', q.parts_total,
              'labour_total', q.labour_total, 'tax_total', q.tax_total, 'total', q.total, 'valid_until', q.valid_until, 'notes', q.notes) end
  );
end $$;

-- ───────── customer approves / declines a quote ─────────
create or replace function decide_repair_quote(p_ticket text, p_secret text, p_quote_id uuid, p_approve boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t repair_tickets := _repair_ticket_for(p_ticket, p_secret); q repair_quotes%rowtype;
begin
  if t.id is null then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  select * into q from repair_quotes where id = p_quote_id and ticket_id = t.id for update;
  if not found or q.status <> 'sent' then raise exception 'QUOTE_NOT_PENDING' using errcode = 'P0001'; end if;
  if q.valid_until is not null and q.valid_until < current_date then
    update repair_quotes set status = 'expired' where id = q.id;
    raise exception 'QUOTE_EXPIRED' using errcode = 'P0001';
  end if;
  update repair_quotes set status = case when p_approve then 'approved' else 'declined' end::quote_status, decided_at = now() where id = q.id;
  update repair_tickets set status = case when p_approve then 'approved' else 'declined' end::repair_status where id = t.id;
  insert into repair_status_history (ticket_id, status, note)
    values (t.id, case when p_approve then 'approved' else 'declined' end::repair_status,
            case when p_approve then 'Customer approved the quotation' else 'Customer declined the quotation' end);
  return jsonb_build_object('ticket_number', t.ticket_number, 'status', case when p_approve then 'approved' else 'declined' end);
end $$;

revoke all on function create_repair_booking(jsonb), _repair_ticket_for(text, text), track_repair(text, text),
  decide_repair_quote(text, text, uuid, boolean) from public, anon, authenticated;
