-- ============================================================
-- SAYBA ARC — Layanan: galeri, blok isi, FAQ, dan tahap proses
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Aman dijalankan berulang (idempotent).
-- ============================================================

-- ── Kolom baru pada tabel `layanan` ──────────────────────────────────────

-- Foto tambahan di halaman slug (array URL). Gambar utama tetap image_url.
alter table layanan
  add column if not exists gallery text[] default '{}';

-- Isi halaman yang disusun bebas dari admin.
-- Format: [{"type":"heading","text":"..."},
--          {"type":"paragraph","text":"..."},
--          {"type":"list","text":"butir 1\nbutir 2"},
--          {"type":"image","image_url":"...","caption":"..."}]
alter table layanan
  add column if not exists content_blocks jsonb default '[]'::jsonb;

-- FAQ per layanan. Format: [{"question":"...","answer":"..."}]
alter table layanan
  add column if not exists faqs jsonb default '[]'::jsonb;

-- Tahap proses kerja untuk diagram alir.
-- Format: [{"title":"Konsultasi","description":"..."}, ...]
-- Kosongkan untuk memakai 6 tahap bawaan.
alter table layanan
  add column if not exists process_steps jsonb default '[]'::jsonb;

-- ── Verifikasi ───────────────────────────────────────────────────────────
-- select id, title, dept,
--        coalesce(array_length(gallery,1),0)      as jml_foto,
--        coalesce(jsonb_array_length(content_blocks),0) as jml_blok,
--        coalesce(jsonb_array_length(faqs),0)     as jml_faq,
--        coalesce(jsonb_array_length(process_steps),0)  as jml_tahap
-- from layanan order by created_at desc;

-- ============================================================
-- Tabel kategori informasi (dapat dikelola dari admin)
-- ============================================================
create table if not exists informasi_kategori (
  id          uuid        default gen_random_uuid() primary key,
  slug        text        unique not null,
  label       text        not null,
  description text,
  color       text        not null default '#5e6572',
  sort_order  integer     not null default 0,
  status      text        not null default 'active' check (status in ('active', 'draft')),
  created_at  timestamptz default now()
);

create index if not exists informasi_kategori_sort_idx on informasi_kategori (sort_order asc);

alter table informasi_kategori enable row level security;

drop policy if exists "informasi_kategori_public_read" on informasi_kategori;
create policy "informasi_kategori_public_read" on informasi_kategori
  for select using (true);

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

-- ── Isi awal 5 kategori (warna dari palet, semua lolos WCAG AA) ─────────
insert into informasi_kategori (slug, label, description, color, sort_order, status) values
  ('pengumuman',  'Pengumuman',          'Kabar resmi dan pemberitahuan layanan',            '#1c2321', 1, 'active'),
  ('panduan',     'Panduan',             'Langkah kerja dan alur layanan',                   '#5e6572', 2, 'active'),
  ('standar',     'Standar & Regulasi',  'Acuan teknis, format berkas, dan kepatuhan',       '#5e7a85', 3, 'active'),
  ('dokumentasi', 'Dokumentasi',         'Catatan rilis dan spesifikasi teknis',             '#7d98a1', 4, 'active'),
  ('operasional', 'Operasional',         'Jadwal, kontak, dan informasi operasional',        '#4a5a63', 5, 'active')
on conflict (slug) do nothing;

-- ============================================================
-- Penghitung tampilan (dipakai halaman informasi & berita)
-- ============================================================
-- Fungsi ini menaikkan kolom `views` sebanyak 1 setiap dipanggil.
-- Dipanggil dari server saat halaman dibuka/di-refresh.
-- SECURITY DEFINER supaya pengunjung anonim boleh menaikkan hitungan
-- tanpa diberi izin UPDATE penuh pada tabel.
create or replace function increment_views(p_table text, p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_table = 'informasi' then
    update informasi set views = views + 1 where slug = p_slug and status = 'active';
  elsif p_table = 'berita' then
    update berita set views = views + 1 where slug = p_slug and status = 'active';
  end if;
end;
$$;

grant execute on function increment_views(text, text) to anon, authenticated;
