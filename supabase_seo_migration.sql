-- ============================================================
-- SAYBA ARC — SEO Fields + Media Storage Migration
-- Jalankan di: Supabase Dashboard → SQL Editor
--
-- Menambahkan kolom SEO (meta title/description/keywords, OG image,
-- canonical URL) ke tabel produk & layanan, serta membuat bucket
-- Storage publik "media" untuk upload gambar SVG lewat admin panel.
-- ============================================================

alter table produk  add column if not exists meta_title       text;
alter table produk  add column if not exists meta_description text;
alter table produk  add column if not exists meta_keywords    text[];
alter table produk  add column if not exists og_image         text;
alter table produk  add column if not exists canonical_url    text;

alter table layanan add column if not exists meta_title       text;
alter table layanan add column if not exists meta_description text;
alter table layanan add column if not exists meta_keywords    text[];
alter table layanan add column if not exists og_image         text;
alter table layanan add column if not exists canonical_url    text;

-- ── Storage bucket "media" ──────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Anyone may read files in this bucket (needed for public product/service images).
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

-- Only signed-in admin users may upload, replace, or delete files.
create policy "media_auth_write" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "media_auth_update" on storage.objects
  for update using (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "media_auth_delete" on storage.objects
  for delete using (bucket_id = 'media' and auth.role() = 'authenticated');
