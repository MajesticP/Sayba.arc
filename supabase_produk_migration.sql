-- ============================================================
-- SAYBA ARC — Produk (Product / Dokumen) Table Migration
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists produk (
  id          uuid        default gen_random_uuid() primary key,
  title       text        not null,
  slug        text        unique not null,
  dept        text        not null default 'arcgis',
  category    text,
  description text,
  image_url   text,        -- gambar preview/thumbnail (link Google Drive didukung)
  file_url    text,        -- link file/dokumen asli yang diterima customer
  price       numeric      not null default 0,
  status      text        not null default 'active' check (status in ('active', 'draft', 'archived')),
  created_at  timestamptz default now()
);

-- Enable Row Level Security
alter table produk enable row level security;

-- Anyone (including anonymous visitors) may read rows — the app filters
-- status = 'active' itself, same convention as the portfolio/layanan tables.
create policy "produk_public_read" on produk
  for select using (true);

-- Only signed-in admin users may insert, update, or delete rows.
create policy "produk_auth_write" on produk
  for insert
  with check (auth.role() = 'authenticated');

create policy "produk_auth_update" on produk
  for update
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "produk_auth_delete" on produk
  for delete
  using (auth.role() = 'authenticated');

-- Seed data contoh (opsional, hapus jika tidak perlu)
insert into produk (title, slug, dept, category, description, price, status) values
  ('Paket Gambar Teknis Kapal (AutoCAD)', 'paket-gambar-teknis-kapal-autocad', 'kelautan', 'Desain Kapal',
   'Dokumen gambar teknis kapal siap pakai — general arrangement, lines plan, dan konstruksi dasar dalam format AutoCAD.',
   1500000, 'active');
