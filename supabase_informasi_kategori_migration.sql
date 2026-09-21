-- ============================================================
-- SAYBA ARC — Tabel Kategori Informasi
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Aman dijalankan berulang (idempotent).
--
-- Tabel ini membuat kategori Pusat Informasi dapat dikelola dari
-- Admin Dashboard, sehingga halaman publik /informasi membaca daftar
-- kategori langsung dari database (bukan lagi dari konstanta di kode).
--
-- Catatan kompatibilitas: bila `supabase_layanan_konten_migration.sql`
-- sudah lebih dulu membuat tabel ini, blok CREATE di bawah menjadi no-op
-- dan hanya seed + policy yang dijalankan ulang dengan aman.
-- ============================================================

create table if not exists informasi_kategori (
  id          uuid        default gen_random_uuid() primary key,
  slug        text        unique not null,
  label       text        not null,
  color       text        not null default '#5e6572',
  sort_order  integer     not null default 0,
  status      text        not null default 'active',
  created_at  timestamptz default now()
);

-- Kolom deskripsi opsional — hanya ditambah bila belum ada, supaya
-- migrasi ini tetap kompatibel dengan skema tabel yang sudah terlanjur
-- dibuat oleh migrasi lain.
alter table informasi_kategori add column if not exists description text;

create index if not exists informasi_kategori_sort_idx on informasi_kategori (sort_order asc);

-- ── Row Level Security ───────────────────────────────────────────────────
alter table informasi_kategori enable row level security;

-- Pengunjung anonim hanya boleh membaca kategori yang aktif.
drop policy if exists "informasi_kategori_public_read" on informasi_kategori;
create policy "informasi_kategori_public_read" on informasi_kategori
  for select using (status = 'active');

-- Admin (lewat API server yang memakai service_role) yang menulis; policy
-- berikut memberi jalur bila kelak ditulis langsung dari sesi terautentikasi.
drop policy if exists "informasi_kategori_auth_write" on informasi_kategori;
create policy "informasi_kategori_auth_write" on informasi_kategori
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "informasi_kategori_auth_update" on informasi_kategori;
create policy "informasi_kategori_auth_update" on informasi_kategori
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "informasi_kategori_auth_delete" on informasi_kategori;
create policy "informasi_kategori_auth_delete" on informasi_kategori
  for delete using (auth.role() = 'authenticated');

-- ── Isi awal 4 kategori (warna netral steel, lolos WCAG AA) ─────────────
insert into informasi_kategori (slug, label, color, sort_order, status) values
  ('pengumuman',  'Pengumuman',  '#5e6572', 1, 'active'),
  ('panduan',     'Panduan',     '#5e6572', 2, 'active'),
  ('standar',     'Standar',     '#5e6572', 3, 'active'),
  ('operasional', 'Operasional', '#5e6572', 4, 'active')
on conflict (slug) do nothing;
