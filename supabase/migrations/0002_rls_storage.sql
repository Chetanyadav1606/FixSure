-- Row Level Security. Principle: deny by default; customers see only their own rows;
-- all writes that move money or stock go through server code using the service-role key.

do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- ───────── staff/admin blanket access (every table) ─────────
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
           and tablename not in ('audit_logs', 'store_settings', 'payment_webhook_events') loop
    execute format('create policy staff_all on public.%I for all to authenticated using (is_staff()) with check (is_staff())', t);
  end loop;
end $$;

-- audit_logs: admins read only; inserts are server-side (service role bypasses RLS). Nobody updates/deletes.
create policy audit_admin_read on audit_logs for select to authenticated using (is_admin());
-- store_settings: staff read, admin write. payment_webhook_events: service role only (no policies).
create policy settings_staff_read on store_settings for select to authenticated using (is_staff());
create policy settings_admin_write on store_settings for all to authenticated using (is_admin()) with check (is_admin());

-- ───────── public catalogue (anon + authenticated) ─────────
create policy brands_public on brands for select using (active);
create policy categories_public on categories for select using (active);
create policy products_public on products for select using (active and (not b2b_only or current_app_role() in ('b2b', 'staff', 'admin')));
create policy product_images_public on product_images for select using (exists (select 1 from products p where p.id = product_id and p.active));
create policy product_specs_public on product_specifications for select using (exists (select 1 from products p where p.id = product_id and p.active));
create policy product_variants_public on product_variants for select using (active);
create policy product_related_public on product_related for select using (true);
create policy device_models_public on device_models for select using (active);
create policy compat_public on product_compatibility for select using (true);
create policy repair_services_public on repair_services for select using (active);
create policy repair_locations_public on repair_locations for select using (active);
create policy shipping_methods_public on shipping_methods for select using (active);
create policy pincodes_public on serviceable_pincodes for select using (active);
create policy content_public on content_blocks for select using (true);
create policy reviews_public on reviews for select using (approved);

-- Stock: raw counts are private; the public gets only a capped availability figure.
create or replace view product_availability as
  select product_id, (on_hand - reserved) > 0 as in_stock, least(greatest(on_hand - reserved, 0), 10) as available_capped
  from inventory;
grant select on product_availability to anon, authenticated;

-- ───────── wholesale pricing: approved business accounts only ─────────
create policy wholesale_tiers_b2b on wholesale_price_tiers for select to authenticated
  using (exists (select 1 from b2b_applications a where a.user_id = auth.uid() and a.status = 'approved'));

-- ───────── own-data policies ─────────
create policy profiles_self_read on profiles for select to authenticated using (id = auth.uid());
create policy profiles_self_update on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- (role changes are additionally blocked by trg_guard_profile_role)

create policy addresses_own on addresses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy carts_own on carts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cart_items_own on cart_items for all to authenticated
  using (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()));
create policy wishlists_own on wishlists for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_own_read on notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_own_update on notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy orders_own_read on orders for select to authenticated using (user_id = auth.uid());
create policy order_items_own_read on order_items for select to authenticated
  using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy payments_own_read on payments for select to authenticated
  using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy refunds_own_read on refunds for select to authenticated
  using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy shipments_own_read on shipments for select to authenticated
  using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy returns_own on return_requests for all to authenticated using (user_id = auth.uid())
  with check (user_id = auth.uid() and exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));

-- Verified purchase only.
create policy reviews_insert_verified on reviews for insert to authenticated with check (
  user_id = auth.uid() and approved = false and exists (
    select 1 from order_items oi join orders o on o.id = oi.order_id
    where oi.id = order_item_id and o.user_id = auth.uid() and oi.product_id = reviews.product_id and o.status = 'delivered')
);
create policy reviews_own_read on reviews for select to authenticated using (user_id = auth.uid());

create policy repair_tickets_own_read on repair_tickets for select to authenticated using (user_id = auth.uid());
create policy repair_tickets_tech_read on repair_tickets for select to authenticated
  using (exists (select 1 from technicians t where t.profile_id = auth.uid() and t.id = technician_id));
create policy repair_history_own_read on repair_status_history for select to authenticated
  using (customer_visible and exists (select 1 from repair_tickets r where r.id = ticket_id and r.user_id = auth.uid()));
create policy repair_quotes_own_read on repair_quotes for select to authenticated
  using (status <> 'draft' and exists (select 1 from repair_tickets r where r.id = ticket_id and r.user_id = auth.uid()));

create policy b2b_own_read on b2b_applications for select to authenticated using (user_id = auth.uid());
create policy b2b_own_insert on b2b_applications for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and credit_terms_days = 0 and credit_limit = 0);
create policy quotes_own_read on quote_requests for select to authenticated using (user_id = auth.uid());
create policy support_own_read on support_tickets for select to authenticated using (user_id = auth.uid());
create policy part_id_own_read on part_identification_requests for select to authenticated using (user_id = auth.uid());

-- Anonymous form submissions (support, quotes, part-ID, newsletter) are accepted by server routes
-- that validate + rate-limit and then insert with the service role; no anon INSERT policies exist.

-- ───────── storage ─────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('repair-photos', 'repair-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('part-photos', 'part-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy product_images_read on storage.objects for select using (bucket_id = 'product-images');
create policy product_images_staff_write on storage.objects for all to authenticated
  using (bucket_id = 'product-images' and is_staff()) with check (bucket_id = 'product-images' and is_staff());
create policy private_photos_staff on storage.objects for all to authenticated
  using (bucket_id in ('repair-photos', 'part-photos') and is_staff())
  with check (bucket_id in ('repair-photos', 'part-photos') and is_staff());
create policy private_photos_owner_read on storage.objects for select to authenticated
  using (bucket_id in ('repair-photos', 'part-photos') and (storage.foldername(name))[1] = auth.uid()::text);
-- Guest uploads go through a server route (validates type/size, writes with the service role).
