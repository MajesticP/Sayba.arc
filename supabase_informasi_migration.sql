-- ============================================================
-- SAYBA ARC — Informasi (Pusat Dokumen) Table Migration
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Aman dijalankan berulang (idempotent).
--
-- CATATAN: migrasi ini TIDAK mengisi data contoh apa pun.
-- Tabel dibuat kosong; isi dokumen lewat Admin Dashboard →
-- tab Informasi. Dengan begitu halaman publik tidak pernah
-- menampilkan template yang belum Anda buat sendiri.
-- ============================================================

create table if not exists informasi (
  id               uuid        default gen_random_uuid() primary key,
  title            text        not null,
  slug             text        unique not null,
  excerpt          text,                                -- ringkasan di kartu & meta description
  category         text        not null default 'umum', -- slug dari tabel informasi_kategori
  image_url        text,                                -- gambar utama (upload admin / link Drive)
  author           text        not null default 'Tim SAYBA ARC',
  body             text,                                -- isi dokumen, Markdown ringan ("## " = sub-judul)
  published_at     date        not null default current_date,
  read_minutes     integer     not null default 3,
  views            integer     not null default 0,      -- dihitung saat halaman dibuka/di-refresh
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
