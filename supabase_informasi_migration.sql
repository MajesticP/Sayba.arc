-- ============================================================
-- SAYBA ARC — Informasi (Pusat Dokumen) Table Migration
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Aman dijalankan berulang (idempotent).
-- ============================================================

create table if not exists informasi (
  id               uuid        default gen_random_uuid() primary key,
  title            text        not null,
  slug             text        unique not null,
  excerpt          text,                                -- ringkasan di kartu & meta description
  category         text        not null default 'umum', -- lihat informasiCategories di lib/informasi-data.ts
  image_url        text,                                -- gambar utama (upload admin / link Drive)
  author           text        not null default 'Tim SAYBA ARC',
  body             text,                                -- isi dokumen, Markdown ringan ("## " = sub-judul)
  published_at     date        not null default current_date,
  read_minutes     integer     not null default 3,
  views            integer     not null default 0,
  featured         boolean     not null default false,  -- true = tampil sebagai kartu Sorotan
  tags             text[],
  status           text        not null default 'active' check (status in ('active', 'draft', 'archived')),
  meta_title       text,
  meta_description text,
  meta_keywords    text[],
  og_image         text,
  canonical_url    text,
  created_at       timestamptz default now()
);

create index if not exists informasi_published_at_idx on informasi (published_at desc);
create index if not exists informasi_status_idx       on informasi (status);

alter table informasi enable row level security;

-- Pengunjung anonim boleh membaca; aplikasi sendiri yang memfilter status = 'active'
-- (konvensi yang sama dengan tabel portfolio/layanan/berita).
drop policy if exists "informasi_public_read" on informasi;
create policy "informasi_public_read" on informasi
  for select using (true);

drop policy if exists "informasi_auth_write" on informasi;
create policy "informasi_auth_write" on informasi
  for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "informasi_auth_update" on informasi;
create policy "informasi_auth_update" on informasi
  for update
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "informasi_auth_delete" on informasi;
create policy "informasi_auth_delete" on informasi
  for delete
  using (auth.role() = 'authenticated');

-- ── Kolom SEO (aman dijalankan ulang pada tabel yang sudah ada) ──────────
alter table informasi add column if not exists meta_title       text;
alter table informasi add column if not exists meta_description text;
alter table informasi add column if not exists meta_keywords    text[];
alter table informasi add column if not exists og_image         text;
alter table informasi add column if not exists canonical_url    text;

-- ── Migrasi dari tabel lama `produk` (bila masih ada) ────────────────────
-- Salin baris lama sebagai draf agar bisa ditinjau di Admin Dashboard,
-- lalu hapus tabel produk setelah yakin tidak diperlukan lagi.
-- do $$
-- begin
--   if exists (select 1 from information_schema.tables where table_name = 'produk') then
--     insert into informasi (title, slug, excerpt, category, image_url, author, body, status)
--     select p.title, p.slug, p.description, 'panduan', p.image_url, 'Tim SAYBA ARC',
--            coalesce(p.description, ''), 'draft'
--     from produk p
--     on conflict (slug) do nothing;
--   end if;
-- end $$;

-- drop table if exists produk cascade;

-- ── Seed contoh (opsional, hapus jika tidak perlu) ───────────────────────
insert into informasi (title, slug, excerpt, category, author, body, published_at, read_minutes, featured, tags, status)
select * from (values
  (
    'Prosedur & Alur Kerja Konsultasi Teknis',
    'prosedur-alur-kerja-konsultasi-teknis',
    'Tahapan pengajuan proyek, pengumpulan data lapangan, asistensi berkala, hingga serah terima berkas teknis di SAYBA ARC.',
    'panduan',
    'Tim Teknis SAYBA ARC',
    E'## 1. Tahap Inisiasi\nKlien menghubungi tim SAYBA ARC melalui portal kontak resmi atau WhatsApp. Kami mengidentifikasi ruang lingkup pekerjaan dan kebutuhan data awal.\n\n## 2. Penyusunan KAK & Penawaran\nTim engineer menyusun Kerangka Acuan Kerja beserta estimasi biaya dan jadwal milestone pengerjaan.\n\n## 3. Eksekusi Teknis & Supervisi\nPengerjaan dilakukan langsung oleh tim spesialis kami tanpa perantara pihak ketiga.',
    current_date, 4, true, ARRAY['SOP','Konsultasi','Alur Kerja'], 'active'
  ),
  (
    'Standar Format Deliverable CAD & Geospasial',
    'standar-format-deliverable-cad-gis',
    'Spesifikasi struktur layer AutoCAD, sistem proyeksi koordinat (UTM/TM-3°), dan format basis data geospasial resmi.',
    'standar',
    'Departemen GIS & Perkapalan',
    E'## Standar Sistem Koordinat\nDatum WGS 1984 / SRGI 2013 dengan proyeksi UTM Zona 49S/50N atau TM-3°.\n\n## Standar Layering AutoCAD\nSatuan milimeter untuk perkapalan, meter untuk tata letak dan kontur. Format DWG 2018–2024 dan PDF terkalibrasi.\n\n## Integritas Geodatabase\nData vektor disimpan sebagai Shapefile (.shp) atau File Geodatabase (.gdb) dengan metadata ISO 19115.',
    current_date, 3, false, ARRAY['AutoCAD','GIS','Standar Teknis'], 'active'
  )
) as seed(title, slug, excerpt, category, author, body, published_at, read_minutes, featured, tags, status)
where not exists (select 1 from informasi);
