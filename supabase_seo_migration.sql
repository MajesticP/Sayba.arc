-- ============================================================
-- SAYBA ARC — SEO Fields + Media Storage Migration
-- Jalankan di: Supabase Dashboard → SQL Editor
--
-- Menambahkan kolom SEO (meta title/description/keywords, OG image,
-- canonical URL) ke tabel informasi & layanan, serta membuat bucket
-- Storage publik "media" untuk upload gambar lewat admin panel.
-- ============================================================

alter table informasi add column if not exists meta_title       text;
alter table informasi add column if not exists meta_description text;
alter table informasi add column if not exists meta_keywords    text[];
alter table informasi add column if not exists og_image         text;
alter table informasi add column if not exists canonical_url    text;

alter table layanan add column if not exists meta_title       text;
alter table layanan add column if not exists meta_description text;
alter table layanan add column if not exists meta_keywords    text[];
alter table layanan add column if not exists og_image         text;
alter table layanan add column if not exists canonical_url    text;

-- ── Storage bucket "media" ──────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Anyone may read files in this bucket (needed for public content images).
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

-- Only signed-in admin users may upload, replace, or delete files.
drop policy if exists "media_auth_write" on storage.objects;
create policy "media_auth_write" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists "media_auth_update" on storage.objects;
create policy "media_auth_update" on storage.objects
  for update using (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists "media_auth_delete" on storage.objects;
create policy "media_auth_delete" on storage.objects
  for delete using (bucket_id = 'media' and auth.role() = 'authenticated');
