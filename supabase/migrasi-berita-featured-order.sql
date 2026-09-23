-- ════════════════════════════════════════════════════════════════════════════
-- SAYBA ARC: MIGRASI — Sorotan Berita Bernomor (1, 2, 3)
-- ════════════════════════════════════════════════════════════════════════════
--
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- Aman dijalankan berulang kali (semua pernyataan memakai IF NOT EXISTS).
--
-- LATAR BELAKANG
-- Tabel `berita` sudah punya kolom `featured` (true/false), tapi kolom itu
-- tidak menyimpan URUTAN. Akibatnya admin tidak bisa menentukan berita mana
-- yang jadi sorotan pertama, kedua, dan ketiga: urutannya jatuh ke tanggal
-- terbit, bukan ke pilihan admin.
--
-- Kolom `featured_order` menyimpan nomor sorotan:
--   1, 2, 3 = tampil sebagai sorotan, angka kecil tampil lebih dulu
--   NULL    = berita biasa (tidak disorot)
--
-- Kolom `featured` yang lama TIDAK dihapus: masih dipakai sebagai cadangan
-- bila `featured_order` kosong, jadi berita yang sudah ditandai sorotan
-- sebelum migrasi ini tetap tampil sebagai sorotan.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.berita
  add column if not exists featured_order integer;

comment on column public.berita.featured_order is
  'Nomor sorotan di beranda dan halaman berita: 1, 2, 3 = disorot (kecil lebih dulu), NULL = berita biasa.';

-- Indeks untuk pengurutan sorotan. Sebagian besar baris NULL, jadi indeks
-- parsial jauh lebih kecil dan tetap cepat.
create index if not exists berita_featured_order_idx
  on public.berita (featured_order)
  where featured_order is not null;

-- ── Pindahkan penanda `featured` lama ke `featured_order` ──
-- Berita yang sudah ditandai sorotan sebelum migrasi diberi nomor berurutan
-- sesuai tanggal terbit (yang terbaru jadi sorotan pertama). Setelah ini
-- admin bisa mengubah nomornya dari Admin Dashboard.
with lama as (
  select id, row_number() over (order by published_at desc) as urut
  from public.berita
  where featured = true
    and featured_order is null
)
update public.berita b
set featured_order = lama.urut
from lama
where b.id = lama.id
  and lama.urut <= 3;

-- ── Verifikasi ──
-- Harus menampilkan kolom featured_order dan daftar sorotan yang terisi.
select
  (select count(*) from information_schema.columns
   where table_schema = 'public' and table_name = 'berita'
     and column_name = 'featured_order')            as kolom_baru_ada,
  (select count(*) from public.berita
   where featured_order is not null)                as jumlah_sorotan,
  (select string_agg(title || ' (#' || featured_order || ')', ', '
                     order by featured_order)
   from public.berita where featured_order is not null) as daftar_sorotan;
