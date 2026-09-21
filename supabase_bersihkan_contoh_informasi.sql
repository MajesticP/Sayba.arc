-- ============================================================
-- SAYBA ARC — Bersihkan dokumen contoh dari tabel `informasi`
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================
--
-- LATAR BELAKANG
-- Migrasi informasi versi pertama menyertakan dua dokumen contoh sebagai
-- seed. Dokumen itu sekarang muncul di halaman /informasi seolah-olah
-- Anda yang membuatnya. Kode aplikasi sudah tidak lagi memuat data contoh
-- apa pun — yang tampil murni berasal dari tabel ini.
--
-- Skrip ini menghapus HANYA dua dokumen seed bawaan tersebut. Dokumen yang
-- Anda buat sendiri tidak tersentuh.
--
-- Tips: jalankan blok LANGKAH 1 lebih dulu untuk melihat apa yang akan
-- dihapus. Kalau daftarnya sudah benar, jalankan LANGKAH 2.

-- ── LANGKAH 1: lihat dulu (tidak mengubah apa pun) ──────────────────────
select id, title, slug, status, created_at
from informasi
where slug in (
  'prosedur-alur-kerja-konsultasi-teknis',
  'standar-format-deliverable-cad-gis'
)
order by slug;


-- ── LANGKAH 2: hapus dokumen contoh ─────────────────────────────────────
delete from informasi
where slug in (
  'prosedur-alur-kerja-konsultasi-teknis',
  'standar-format-deliverable-cad-gis'
);

-- Hasil yang diharapkan: "DELETE 2" (atau 0 bila sudah pernah dihapus).


-- ── LANGKAH 3: periksa sisa isi tabel ───────────────────────────────────
-- Kalau hasilnya kosong, halaman /informasi akan menampilkan ajakan
-- "Belum ada dokumen" sampai Anda menambahkan dokumen pertama.
select id, title, slug, category, status, published_at
from informasi
order by published_at desc;
