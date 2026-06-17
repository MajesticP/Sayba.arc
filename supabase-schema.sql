-- ============================================================
-- SAYBA ARC — Supabase Schema
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

-- Tabel Portfolio
create table if not exists portfolio (
  id             uuid        default gen_random_uuid() primary key,
  title          text        not null,                        -- Indonesian title
  title_en       text,                                        -- English title (null = fall back to ID)
  slug           text        unique not null,
  category       text,
  dept           text        not null default 'arcgis',       -- open string, validated against LAYANAN_DEPTS in app code
  description    text,                                        -- Indonesian description
  description_en text,                                        -- English description (null = fall back to ID)
  image_url      text,
  result_url     text,
  features       text[],
  tech_stack     text[],
  status         text        not null default 'active' check (status in ('active', 'draft', 'archived')),
  created_at     timestamptz default now()
);

-- Tabel Layanan
create table if not exists layanan (
  id             uuid        default gen_random_uuid() primary key,
  title          text        not null,                        -- Indonesian title
  title_en       text,                                        -- English title (null = fall back to ID)
  slug           text        unique not null,
  dept           text        not null default 'arcgis',       -- open string, validated against LAYANAN_DEPTS in app code
  category       text,
  description    text,                                        -- Indonesian description
  description_en text,                                        -- English description (null = fall back to ID)
  icon           text        default 'map',
  image_url      text,
  prices         jsonb,
  featured_order int,
  status         text        not null default 'active' check (status in ('active', 'draft', 'archived')),
  created_at     timestamptz default now()
);

-- Enable RLS (Row Level Security)
alter table portfolio enable row level security;
alter table layanan enable row level security;

-- ── Portfolio policies ────────────────────────────────────────────────────
-- Anyone (including anonymous visitors) may read active/published rows.
create policy "portfolio_public_read" on portfolio
  for select using (true);

-- Only signed-in admin users may insert, update, or delete rows.
create policy "portfolio_auth_write" on portfolio
  for insert
  with check (auth.role() = 'authenticated');

create policy "portfolio_auth_update" on portfolio
  for update
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "portfolio_auth_delete" on portfolio
  for delete
  using (auth.role() = 'authenticated');

-- ── Layanan policies ──────────────────────────────────────────────────────
create policy "layanan_public_read" on layanan
  for select using (true);

create policy "layanan_auth_write" on layanan
  for insert
  with check (auth.role() = 'authenticated');

create policy "layanan_auth_update" on layanan
  for update
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "layanan_auth_delete" on layanan
  for delete
  using (auth.role() = 'authenticated');

-- Seed data contoh (opsional, hapus jika tidak perlu)
insert into portfolio (title, slug, category, dept, description, status) values
  ('Sistem Pemetaan Tata Ruang Kota', 'sistem-pemetaan-tata-ruang-kota', 'ArcGIS Online', 'arcgis', 'Pengembangan sistem web GIS untuk visualisasi tata ruang kota berbasis ArcGIS Online dengan integrasi data BIG.', 'active'),
  ('Platform Monitoring Infrastruktur', 'platform-monitoring-infrastruktur', 'Web App', 'it', 'Aplikasi web full-stack untuk monitoring dan pelaporan kondisi infrastruktur jalan di Kalimantan Barat.', 'active'),
  ('Aplikasi Survey Lapangan', 'aplikasi-survey-lapangan', 'GIS Mobile', 'arcgis', 'Solusi pengumpulan data lapangan berbasis Survey123 untuk instansi pemerintah daerah.', 'active');

insert into layanan (title, slug, dept, description, icon, status) values
  ('Pengembangan ArcGIS', 'arcgis-development', 'arcgis', 'Aplikasi GIS kustom berbasis platform ArcGIS dari Esri — mulai dari Web AppBuilder, Experience Builder, hingga otomasi geoprocessing berbasis Python.', 'map', 'active'),
  ('Solusi Web GIS', 'web-gis', 'arcgis', 'Peta web interaktif, dasbor spasial, serta integrasi ArcGIS Online dan Enterprise.', 'globe', 'active'),
  ('Pengembangan Web & Mobile', 'it-development', 'it', 'Aplikasi web dan mobile full-stack menggunakan framework modern — React, Next.js, Node.js.', 'code', 'active');
