-- ════════════════════════════════════════════════════════════════════════════
-- SAYBA ARC: TEMPLATE SUPABASE (jalankan sekali di SQL Editor)
-- ════════════════════════════════════════════════════════════════════════════
--
-- Berkas ini adalah satu-satunya SQL yang perlu Anda jalankan. Isinya:
--   BAGIAN 1  Struktur tabel (aman dijalankan berulang)
--   BAGIAN 2  Kategori contoh untuk Layanan, Berita, Informasi
--   BAGIAN 3  Contoh layanan (2 departemen)
--   BAGIAN 4  Contoh informasi
--   BAGIAN 5  Contoh berita
--   BAGIAN 6  Contoh banner promosi
--   BAGIAN 7  Bersihkan dokumen contoh bawaan lama
--
-- Semua bagian 2 sampai 6 memakai pola "insert bila belum ada", jadi aman
-- dijalankan berulang dan TIDAK akan menimpa data yang sudah Anda buat.
--
-- Setelah menjalankan berkas ini, semua konten bisa diedit dari
-- /admin tanpa perlu menyentuh SQL lagi.
-- ════════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════════
-- BAGIAN 1: STRUKTUR TABEL
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1.1 Kategori terpusat (Layanan, Berita, Informasi) ─────────────────────
-- Satu tabel untuk tiga modul. Kolom `scope` memisahkannya, jadi Anda
-- mengelola satu daftar di admin.
create table if not exists public.kategori (
  id          uuid primary key default gen_random_uuid(),
  scope       text not null check (scope in ('layanan', 'berita', 'informasi')),
  slug        text not null,
  label       text not null,
  description text,
  color       text not null default '#5a5c62',
  sort_order  integer not null default 0,
  status      text not null default 'active' check (status in ('active', 'draft')),
  created_at  timestamptz not null default now(),
  unique (scope, slug)
);

create index if not exists kategori_scope_idx on public.kategori (scope, sort_order);

alter table public.kategori enable row level security;

drop policy if exists "kategori_public_read" on public.kategori;
create policy "kategori_public_read" on public.kategori
  for select using (status = 'active');

drop policy if exists "kategori_auth_all" on public.kategori;
create policy "kategori_auth_all" on public.kategori
  for all to authenticated using (true) with check (true);

drop policy if exists "kategori_service_all" on public.kategori;
create policy "kategori_service_all" on public.kategori
  for all to service_role using (true) with check (true);


-- ── 1.2 Informasi ──────────────────────────────────────────────────────────
create table if not exists public.informasi (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text unique not null,
  excerpt          text,
  category         text not null default 'umum',
  image_url        text,
  author           text not null default 'Tim SAYBA ARC',
  body             text,
  published_at     date not null default current_date,
  read_minutes     integer not null default 3,
  views            integer not null default 0,
  featured         boolean not null default false,
  tags             text[],
  status           text not null default 'active' check (status in ('active', 'draft', 'archived')),
  meta_title       text,
  meta_description text,
  meta_keywords    text[],
  og_image         text,
  canonical_url    text,
  created_at       timestamptz default now()
);

create index if not exists informasi_published_at_idx on public.informasi (published_at desc);
create index if not exists informasi_status_idx on public.informasi (status);

alter table public.informasi enable row level security;

drop policy if exists "informasi_public_read" on public.informasi;
create policy "informasi_public_read" on public.informasi for select using (true);

drop policy if exists "informasi_auth_write" on public.informasi;
create policy "informasi_auth_write" on public.informasi
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "informasi_auth_update" on public.informasi;
create policy "informasi_auth_update" on public.informasi
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "informasi_auth_delete" on public.informasi;
create policy "informasi_auth_delete" on public.informasi
  for delete using (auth.role() = 'authenticated');

-- Kolom SEO bila tabel sudah ada dari versi sebelumnya
alter table public.informasi add column if not exists meta_title       text;
alter table public.informasi add column if not exists meta_description text;
alter table public.informasi add column if not exists meta_keywords    text[];
alter table public.informasi add column if not exists og_image         text;
alter table public.informasi add column if not exists canonical_url    text;


-- ── 1.3 Layanan ────────────────────────────────────────────────────────────
-- Kolom baru untuk halaman slug: galeri, blok isi, FAQ, dan tahap proses.
-- Kolom `prices` sengaja TIDAK dibuat: layanan bersifat terpusat, tanpa paket.
create table if not exists public.layanan (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text unique not null,
  dept           text not null default 'it_konsulting',
  category       text,
  description    text,
  icon           text,
  image_url      text,
  gallery        text[],
  content_blocks jsonb,
  faqs           jsonb,
  process_steps  jsonb,
  status         text not null default 'active' check (status in ('active', 'draft', 'archived')),
  featured_order integer,
  meta_title     text,
  meta_description text,
  meta_keywords  text[],
  og_image       text,
  canonical_url  text,
  created_at     timestamptz default now()
);

create index if not exists layanan_status_idx on public.layanan (status);
create index if not exists layanan_dept_idx on public.layanan (dept);

alter table public.layanan enable row level security;

drop policy if exists "layanan_public_read" on public.layanan;
create policy "layanan_public_read" on public.layanan for select using (true);

drop policy if exists "layanan_auth_write" on public.layanan;
create policy "layanan_auth_write" on public.layanan
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "layanan_auth_update" on public.layanan;
create policy "layanan_auth_update" on public.layanan
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "layanan_auth_delete" on public.layanan;
create policy "layanan_auth_delete" on public.layanan
  for delete using (auth.role() = 'authenticated');

-- Kolom baru bila tabel sudah ada dari versi sebelumnya
alter table public.layanan add column if not exists gallery        text[];
alter table public.layanan add column if not exists content_blocks jsonb;
alter table public.layanan add column if not exists faqs           jsonb;
alter table public.layanan add column if not exists process_steps  jsonb;
alter table public.layanan add column if not exists meta_title     text;
alter table public.layanan add column if not exists meta_description text;
alter table public.layanan add column if not exists meta_keywords  text[];
alter table public.layanan add column if not exists og_image       text;
alter table public.layanan add column if not exists canonical_url  text;

-- Hapus kolom paket harga bila ada dari versi lama (layanan terpusat)
alter table public.layanan drop column if exists prices;


-- ── 1.4 Berita ─────────────────────────────────────────────────────────────
create table if not exists public.berita (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text unique not null,
  excerpt          text,
  category         text not null default 'umum',
  image_url        text,
  author           text not null default 'Tim SAYBA ARC',
  body             text,
  published_at     date not null default current_date,
  read_minutes     integer not null default 3,
  views            integer not null default 0,
  featured         boolean not null default false,
  tags             text[],
  status           text not null default 'active' check (status in ('active', 'draft', 'archived')),
  meta_title       text,
  meta_description text,
  meta_keywords    text[],
  og_image         text,
  canonical_url    text,
  created_at       timestamptz default now()
);

create index if not exists berita_published_at_idx on public.berita (published_at desc);
create index if not exists berita_status_idx on public.berita (status);

alter table public.berita enable row level security;

drop policy if exists "berita_public_read" on public.berita;
create policy "berita_public_read" on public.berita for select using (true);

drop policy if exists "berita_auth_write" on public.berita;
create policy "berita_auth_write" on public.berita
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "berita_auth_update" on public.berita;
create policy "berita_auth_update" on public.berita
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "berita_auth_delete" on public.berita;
create policy "berita_auth_delete" on public.berita
  for delete using (auth.role() = 'authenticated');

alter table public.berita add column if not exists meta_title       text;
alter table public.berita add column if not exists meta_description text;
alter table public.berita add column if not exists meta_keywords    text[];
alter table public.berita add column if not exists og_image         text;
alter table public.berita add column if not exists canonical_url    text;


-- ── 1.5 Promo banner ───────────────────────────────────────────────────────
create table if not exists public.promo_banner (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  alt        text not null default 'Promo SAYBA ARC',
  eyebrow    text,
  title      text,
  subtitle   text,
  cta_text   text,
  cta_href   text,
  sort_order integer not null default 0,
  status     text not null default 'active' check (status in ('active', 'draft')),
  created_at timestamptz default now()
);

alter table public.promo_banner enable row level security;

drop policy if exists "promo_public_read" on public.promo_banner;
create policy "promo_public_read" on public.promo_banner for select using (true);

drop policy if exists "promo_auth_all" on public.promo_banner;
create policy "promo_auth_all" on public.promo_banner
  for all to authenticated using (true) with check (true);


-- ── 1.6 Portfolio ──────────────────────────────────────────────────────────
create table if not exists public.portfolio (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text unique not null,
  category         text,
  dept             text not null default 'it_konsulting',
  description      text,
  image_url        text,
  result_url       text,
  features         text[],
  tech_stack       text[],
  status           text not null default 'active' check (status in ('active', 'draft', 'archived')),
  meta_title       text,
  meta_description text,
  meta_keywords    text[],
  og_image         text,
  canonical_url    text,
  created_at       timestamptz default now()
);

create index if not exists portfolio_status_idx on public.portfolio (status);

alter table public.portfolio enable row level security;

drop policy if exists "portfolio_public_read" on public.portfolio;
create policy "portfolio_public_read" on public.portfolio for select using (true);

drop policy if exists "portfolio_auth_all" on public.portfolio;
create policy "portfolio_auth_all" on public.portfolio
  for all to authenticated using (true) with check (true);

-- Kolom bila tabel sudah ada dari versi sebelumnya
alter table public.portfolio add column if not exists result_url    text;
alter table public.portfolio add column if not exists features      text[];
alter table public.portfolio add column if not exists tech_stack    text[];
alter table public.portfolio add column if not exists meta_title    text;
alter table public.portfolio add column if not exists meta_description text;
alter table public.portfolio add column if not exists meta_keywords text[];
alter table public.portfolio add column if not exists og_image      text;
alter table public.portfolio add column if not exists canonical_url text;

-- Dept lama ('arcgis','it') diganti dua departemen yang berlaku sekarang.
-- Batasan check dilepas supaya data lama tidak memblokir perubahan.
alter table public.portfolio drop constraint if exists portfolio_dept_check;
alter table public.portfolio alter column dept set default 'it_konsulting';


-- ── 1.7 Tim ────────────────────────────────────────────────────────────────
create table if not exists public.tim (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role          text not null,
  bio           text,
  photo_url     text,
  github_url    text,
  linkedin_url  text,
  instagram_url text,
  dept          text,
  order_num     integer not null default 0,
  status        text not null default 'active' check (status in ('active', 'draft')),
  created_at    timestamptz not null default now()
);

alter table public.tim enable row level security;

drop policy if exists "Public can view active tim" on public.tim;
create policy "Public can view active tim" on public.tim for select using (status = 'active');

drop policy if exists "tim_auth_all" on public.tim;
create policy "tim_auth_all" on public.tim
  for all to authenticated using (true) with check (true);

-- Kolom sosial & dept bila tabel sudah ada dari versi sebelumnya
alter table public.tim add column if not exists github_url    text;
alter table public.tim add column if not exists linkedin_url  text;
alter table public.tim add column if not exists instagram_url text;
alter table public.tim add column if not exists dept          text;


-- ════════════════════════════════════════════════════════════════════════════
-- BAGIAN 2: KATEGORI CONTOH
-- ════════════════════════════════════════════════════════════════════════════
-- Silakan ubah, tambah, atau hapus lewat admin setelah ini. Warna dipakai
-- sebagai aksen tipis (garis dan tint), bukan warna teks.

-- Kategori LAYANAN
insert into public.kategori (scope, slug, label, description, color, sort_order) values
  ('layanan', 'pengembangan-web',   'Pengembangan Web',        'Website, aplikasi web, dan sistem informasi berbasis browser.', '#112a46', 1),
  ('layanan', 'aplikasi-mobile',    'Aplikasi Mobile',         'Aplikasi Android dan iOS untuk operasional lapangan.',         '#1b3e6b', 2),
  ('layanan', 'sistem-informasi',   'Sistem Informasi',        'Sistem internal, dashboard, dan integrasi basis data.',        '#2a4a6e', 3),
  ('layanan', 'pemetaan-spasial',   'Pemetaan Spasial',        'Peta tematik, GIS, dan penginderaan jauh.',                    '#f07a26', 4),
  ('layanan', 'gambar-teknik',      'Gambar Teknik',           'Gambar kerja CAD dan dokumen rancang bangun.',                 '#b45610', 5),
  ('layanan', 'analisis-data',      'Analisis Data',           'Pengolahan data, pelaporan, dan model prediktif.',             '#5a5c62', 6)
on conflict (scope, slug) do nothing;

-- Kategori BERITA
insert into public.kategori (scope, slug, label, description, color, sort_order) values
  ('berita', 'proyek',        'Proyek',        'Catatan pelaksanaan proyek yang sedang dan sudah berjalan.', '#112a46', 1),
  ('berita', 'teknologi',     'Teknologi',     'Perkembangan alat, metode, dan standar teknis.',             '#1b3e6b', 2),
  ('berita', 'kegiatan',      'Kegiatan',      'Agenda, pelatihan, dan kegiatan tim.',                       '#f07a26', 3),
  ('berita', 'pengumuman',    'Pengumuman',    'Kabar resmi dari SAYBA ARC.',                               '#5a5c62', 4)
on conflict (scope, slug) do nothing;

-- Kategori INFORMASI
insert into public.kategori (scope, slug, label, description, color, sort_order) values
  ('informasi', 'panduan',      'Panduan',      'Langkah kerja dan tata cara yang kami pakai.',        '#112a46', 1),
  ('informasi', 'standar',      'Standar',      'Spesifikasi format dan mutu hasil pekerjaan.',        '#1b3e6b', 2),
  ('informasi', 'pengumuman',   'Pengumuman',   'Informasi layanan dan jam operasional.',              '#f07a26', 3),
  ('informasi', 'operasional',  'Operasional',  'Ketentuan kontrak, revisi, dan garansi.',             '#5a5c62', 4)
on conflict (scope, slug) do nothing;


-- ════════════════════════════════════════════════════════════════════════════
-- BAGIAN 3: CONTOH LAYANAN (2 departemen)
-- ════════════════════════════════════════════════════════════════════════════

insert into public.layanan (
  title, slug, dept, category, description, featured_order, status,
  content_blocks, faqs, process_steps
) values
(
  'Pengembangan Sistem Informasi',
  'pengembangan-sistem-informasi',
  'it_konsulting',
  'sistem-informasi',
  'Kami bangun sistem informasi yang mengikuti alur kerja Anda, bukan sebaliknya. Dimulai dari pemetaan proses, perancangan basis data, sampai pelatihan pengguna dan pemeliharaan.',
  1,
  'active',
  '[
    {"type": "heading", "text": "Yang kami kerjakan"},
    {"type": "paragraph", "text": "Setiap sistem dimulai dari pemetaan proses yang berjalan sekarang. Kami catat siapa mengerjakan apa, data apa yang berpindah, dan di mana waktu paling banyak terbuang. Dari situ rancangan sistem disusun bersama tim Anda."},
    {"type": "list", "text": "Pemetaan alur kerja dan kebutuhan pengguna\nPerancangan basis data dan struktur akses\nPengembangan antarmuka web yang responsif\nIntegrasi dengan sistem yang sudah dipakai\nPelatihan pengguna dan dokumentasi teknis"},
    {"type": "heading", "text": "Yang Anda terima"},
    {"type": "list", "text": "Akses penuh ke repositori kode sumber\nDokumentasi teknis dan panduan pengguna\nMasa pendampingan setelah sistem berjalan\nPemeliharaan berkala sesuai kesepakatan"}
  ]'::jsonb,
  '[
    {"question": "Berapa lama pembangunan satu sistem informasi?", "answer": "Bergantung jumlah fitur dan jumlah pengguna. Sistem sederhana umumnya 4 sampai 8 minggu kerja. Estimasi tertulis kami susun per milestone di Kerangka Acuan Kerja sebelum pekerjaan dimulai."},
    {"question": "Apakah sistem bisa dipasang di server kami sendiri?", "answer": "Bisa. Kami mendukung pemasangan di server instansi maupun di layanan cloud. Pilihan ditentukan saat penyusunan KAK karena memengaruhi kebutuhan infrastruktur dan biaya operasional."},
    {"question": "Bagaimana kalau ada penambahan fitur di tengah jalan?", "answer": "Penambahan yang masih dalam lingkup KAK dikerjakan tanpa biaya tambahan. Yang berada di luar lingkup dibahas sebagai adendum terpisah supaya biaya dan jadwal tetap jelas bagi kedua pihak."},
    {"question": "Apakah kode sumbernya jadi milik kami?", "answer": "Ya. Setelah pelunasan, kode sumber dan hak pakainya menjadi milik Anda sepenuhnya. Kami serahkan akses repositori beserta dokumentasinya."}
  ]'::jsonb,
  '[
    {"title": "Konsultasi", "description": "Diskusi kebutuhan, kendala yang ada, dan target yang ingin dicapai."},
    {"title": "SPK", "description": "Kerangka Acuan Kerja disepakati, lalu Surat Perintah Kerja ditandatangani."},
    {"title": "Invoice DP", "description": "Uang muka ditagihkan sesuai kesepakatan sebagai dasar pelaksanaan."},
    {"title": "Review", "description": "Draf sistem diuji bersama; catatan perbaikan dicatat dan dikerjakan."},
    {"title": "Invoice Pelunasan", "description": "Sisa pembayaran ditagihkan setelah hasil pekerjaan disetujui."},
    {"title": "Serah Terima", "description": "Akses kode, dokumentasi, dan pelatihan pengguna diserahkan."}
  ]'::jsonb
),
(
  'Pemetaan Spasial dan Analisis Wilayah',
  'pemetaan-spasial-analisis-wilayah',
  'engineering_konsulting',
  'pemetaan-spasial',
  'Pemetaan tematik untuk perencanaan, perizinan, dan kajian wilayah. Dikerjakan dari pengumpulan data lapangan sampai peta siap cetak dan basis data spasial yang bisa diperbarui.',
  2,
  'active',
  '[
    {"type": "heading", "text": "Pendekatan kerja"},
    {"type": "paragraph", "text": "Kualitas peta ditentukan oleh kualitas data di belakangnya. Karena itu kami mulai dari memastikan sumber data, sistem koordinat, dan tingkat ketelitian yang dibutuhkan. Baru setelah itu penggambaran dikerjakan."},
    {"type": "list", "text": "Pengumpulan dan verifikasi data lapangan\nPengolahan citra dan data spasial\nAnalisis kesesuaian dan tumpang susun\nPenyusunan peta tematik siap cetak\nPembuatan basis data spasial yang bisa diperbarui"},
    {"type": "heading", "text": "Format penyerahan"},
    {"type": "list", "text": "Shapefile atau File Geodatabase dengan atribut lengkap\nPeta PDF resolusi tinggi dengan skala terkalibrasi\nLaporan teknis metode dan hasil analisis\nMetadata sesuai standar ISO 19115"}
  ]'::jsonb,
  '[
    {"question": "Data apa saja yang perlu kami siapkan?", "answer": "Idealnya batas wilayah, data existing, dan dokumen perencanaan yang sudah ada. Kalau belum tersedia, kami bisa mulai dari pengumpulan data lapangan. Kebutuhannya kami rinci di KAK."},
    {"question": "Apakah survei lapangan termasuk dalam pekerjaan?", "answer": "Bisa termasuk, bisa tidak, tergantung kebutuhan. Kalau diperlukan, tim lapangan kami bekerja sesuai standar keselamatan dan regulasi instansi terkait. Biaya survei dihitung terpisah sesuai luas area."},
    {"question": "Sistem koordinat apa yang dipakai?", "answer": "Standar nasional: WGS 1984 atau SRGI 2013 dengan proyeksi UTM zona yang sesuai, atau TM-3 derajat bila pekerjaan bersifat kadastral. Sistem koordinat disepakati di awal supaya hasilnya langsung bisa dipakai instansi."},
    {"question": "Berapa lama pengerjaan pemetaan?", "answer": "Pemetaan standar umumnya 5 sampai 14 hari kerja bergantung luas area dan jumlah tema. Untuk wilayah besar, pekerjaan dibagi per tahap supaya hasilnya bisa ditinjau bertahap."}
  ]'::jsonb,
  '[
    {"title": "Konsultasi", "description": "Diskusi lingkup wilayah, tema peta, dan tingkat ketelitian yang dibutuhkan."},
    {"title": "SPK", "description": "Lingkup, biaya, dan jadwal disepakati dalam Surat Perintah Kerja."},
    {"title": "Invoice DP", "description": "Uang muka ditagihkan sebelum pengumpulan data dimulai."},
    {"title": "Review", "description": "Draf peta dan hasil analisis ditinjau bersama sebelum finalisasi."},
    {"title": "Invoice Pelunasan", "description": "Sisa pembayaran ditagihkan setelah hasil disetujui."},
    {"title": "Serah Terima", "description": "Berkas sumber, peta cetak, dan laporan teknis diserahkan."}
  ]'::jsonb
)
on conflict (slug) do nothing;


-- ════════════════════════════════════════════════════════════════════════════
-- BAGIAN 4: CONTOH INFORMASI
-- ════════════════════════════════════════════════════════════════════════════

insert into public.informasi (title, slug, excerpt, category, author, body, read_minutes, featured, tags, status) values
(
  'Alur Kerja Proyek di SAYBA ARC',
  'alur-kerja-proyek',
  'Enam tahap yang kami lalui bersama klien, dari konsultasi awal sampai serah terima berkas. Ditulis supaya Anda tahu apa yang terjadi di setiap tahap.',
  'panduan',
  'Tim SAYBA ARC',
  E'## 1. Konsultasi\nKlien menyampaikan kebutuhan lewat WhatsApp atau email. Kami pelajari ruang lingkupnya, data apa yang sudah tersedia, dan target waktunya. Tahap ini tidak dipungut biaya.\n\n## 2. Penyusunan KAK dan Penawaran\nKami susun Kerangka Acuan Kerja berisi lingkup pekerjaan, rincian biaya, dan jadwal per tahap. Dokumen ini jadi acuan resmi kedua pihak, jadi tidak ada biaya yang muncul mendadak di tengah jalan.\n\n## 3. SPK dan Uang Muka\nSetelah KAK disetujui, Surat Perintah Kerja ditandatangani dan uang muka ditagihkan sesuai kesepakatan. Pekerjaan mulai berjalan setelah keduanya selesai.\n\n## 4. Pelaksanaan dan Review\nPengerjaan dilakukan langsung oleh tim kami, tanpa perantara. Di titik tertentu kami hentikan pekerjaan untuk review bersama, supaya koreksi terjadi lebih awal dan tidak menumpuk di akhir.\n\n## 5. Pelunasan\nSetelah hasil pekerjaan disetujui, sisa pembayaran ditagihkan.\n\n## 6. Serah Terima\nBerkas sumber, dokumentasi, dan akses diserahkan lengkap. Masa pendampingan setelah serah terima diatur di KAK.',
  5, true, ARRAY['alur kerja', 'prosedur', 'kontrak'], 'active'
),
(
  'Standar Format Berkas yang Kami Serahkan',
  'standar-format-berkas',
  'Spesifikasi teknis berkas hasil pekerjaan: sistem koordinat, struktur layer, format gambar, dan metadata. Berguna sebagai acuan saat berkas kami masuk ke sistem Anda.',
  'standar',
  'Tim SAYBA ARC',
  E'## Sistem Koordinat\nSeluruh pekerjaan geospasial memakai datum WGS 1984 atau SRGI 2013, dengan proyeksi UTM pada zona yang sesuai atau TM-3 derajat untuk pekerjaan kadastral.\n\n## Gambar Teknik\nGambar kerja diserahkan dalam format DWG yang kompatibel dengan AutoCAD 2018 sampai 2024, ditambah PDF resolusi tinggi dengan skala terkalibrasi. Struktur layer dipisahkan antara elemen gambar, anotasi, dan dimensi.\n\n## Data Spasial\nData vektor diserahkan sebagai Shapefile atau File Geodatabase dengan atribut terisi lengkap, topologi bebas tumpang tindih, dan metadata sesuai standar ISO 19115.\n\n## Kode Sumber\nUntuk pekerjaan perangkat lunak, kami serahkan akses repositori beserta dokumentasi teknis dan panduan pemasangan.',
  4, false, ARRAY['standar', 'format berkas', 'CAD', 'GIS'], 'active'
),
(
  'Ketentuan Revisi dan Masa Garansi',
  'ketentuan-revisi-garansi',
  'Berapa kali revisi yang Anda dapat, apa yang termasuk, dan berapa lama masa pendampingan setelah serah terima.',
  'operasional',
  'Tim SAYBA ARC',
  E'## Revisi dalam Lingkup\nJumlah siklus revisi tertulis di Kerangka Acuan Kerja sejak awal. Umumnya dua sampai tiga kali untuk pekerjaan gambar dan peta, dan mencakup perbaikan atribut, tata letak, atau dimensi yang menyesuaikan masukan Anda.\n\n## Pengujian Perangkat Lunak\nUntuk pekerjaan perangkat lunak, masa pengujian bersama (user acceptance testing) berjalan 14 sampai 30 hari kerja sebelum dinyatakan selesai.\n\n## Masa Garansi\nSetelah serah terima, Anda berhak atas masa garansi perbaikan galat selama 30 sampai 90 hari, tergantung jenis kontrak. Garansi mencakup kesalahan perhitungan, ketidaksesuaian data, dan galat fungsi pada aplikasi.\n\n## Di Luar Lingkup\nPenambahan fitur atau perubahan rancangan yang berada di luar KAK dibahas sebagai adendum terpisah. Tujuannya supaya biaya dan jadwal tetap jelas untuk kedua pihak.',
  4, false, ARRAY['garansi', 'revisi', 'kontrak'], 'active'
)
on conflict (slug) do nothing;


-- ════════════════════════════════════════════════════════════════════════════
-- BAGIAN 5: CONTOH BERITA
-- ════════════════════════════════════════════════════════════════════════════

insert into public.berita (title, slug, excerpt, category, author, body, read_minutes, featured, tags, status) values
(
  'Cara Kami Memastikan Data Lapangan Layak Pakai',
  'memastikan-data-lapangan-layak-pakai',
  'Data lapangan yang buruk menghasilkan peta yang buruk, sekalipun digambar dengan rapi. Ini urutan pemeriksaan yang kami jalankan sebelum data diolah.',
  'teknologi',
  'Tim SAYBA ARC',
  E'## Masalahnya bukan alat\nKesalahan yang paling sering kami temui bukan pada alat ukur, melainkan pada pencatatan. Titik terukur tapi tidak diberi keterangan. Foto diambil tapi tidak tercatat koordinatnya. Akibatnya data harus diambil ulang.\n\n## Empat pemeriksaan\nSebelum data masuk tahap pengolahan, kami periksa empat hal: kelengkapan atribut, konsistensi sistem koordinat, sebaran titik, dan kecocokan dengan citra acuan.\n\n## Kenapa ini penting\nPemeriksaan ini memakan waktu satu sampai dua hari. Mengambil ulang data lapangan memakan waktu jauh lebih lama dan biaya lebih besar. Memeriksa di awal selalu lebih murah.',
  4, true, ARRAY['data lapangan', 'survei', 'kualitas data'], 'active'
),
(
  'Kenapa Kami Tidak Menjual Paket Layanan',
  'kenapa-tidak-ada-paket-layanan',
  'Kami sengaja tidak menyediakan paket harga tetap. Ini alasannya, dan apa yang kami lakukan sebagai gantinya.',
  'pengumuman',
  'Tim SAYBA ARC',
  E'## Paket menyembunyikan pekerjaan sebenarnya\nPaket harga biasanya disusun dari asumsi. Ketika kebutuhan klien ternyata berbeda, isi paket jadi tidak cocok: ada pekerjaan yang tidak dibutuhkan, dan ada yang tidak tercakup tapi tetap harus dikerjakan.\n\n## Yang kami lakukan\nSetiap pekerjaan dimulai dari penyusunan Kerangka Acuan Kerja. Di situ tertulis lingkup, rincian biaya, dan jadwal per tahap. Anda melihat persis apa yang dibayar dan apa yang dikerjakan.\n\n## Hasilnya\nTidak ada biaya kejutan. Kalau lingkup berubah, perubahan itu dibahas terbuka lewat adendum, bukan ditutupi dengan istilah paket.',
  3, false, ARRAY['layanan', 'kontrak', 'biaya'], 'active'
)
on conflict (slug) do nothing;


-- ════════════════════════════════════════════════════════════════════════════
-- BAGIAN 6: CONTOH BANNER PROMOSI
-- ════════════════════════════════════════════════════════════════════════════
-- Ganti image_url dengan gambar Anda (unggah lewat admin supaya otomatis
-- dikonversi ke WebP). Teks boleh dikosongkan bila gambar sudah memuat teks.

insert into public.promo_banner (image_url, alt, eyebrow, title, subtitle, cta_text, cta_href, sort_order, status)
select * from (values
  ('/banners/services-1920x600.webp', 'Promo layanan SAYBA ARC', 'Layanan',
   'Konsultasi Teknis Tanpa Biaya',
   'Ceritakan kebutuhan Anda. Kami susun Kerangka Acuan Kerja berisi lingkup, biaya, dan jadwal.',
   'Mulai konsultasi', '/contact', 1, 'active'),
  ('/banners/gis-1920x600.webp', 'Promo pemetaan spasial SAYBA ARC', 'Pemetaan',
   'Peta Tematik Siap Pakai',
   'Dikerjakan dari data lapangan sampai basis data spasial yang bisa diperbarui.',
   'Lihat layanan pemetaan', '/services', 2, 'active')
) as seed(image_url, alt, eyebrow, title, subtitle, cta_text, cta_href, sort_order, status)
where not exists (select 1 from public.promo_banner);


-- ════════════════════════════════════════════════════════════════════════════
-- BAGIAN 7: BERSIHKAN DOKUMEN CONTOH BAWAAN LAMA
-- ════════════════════════════════════════════════════════════════════════════
-- Dua dokumen ini ikut tersimpan saat migrasi versi pertama dijalankan,
-- sehingga tampil di halaman publik seolah-olah Anda yang membuatnya.

delete from public.informasi
where slug in (
  'prosedur-alur-kerja-konsultasi-teknis',
  'standar-format-deliverable-cad-gis'
);


-- ════════════════════════════════════════════════════════════════════════════
-- SELESAI. Periksa hasilnya:
-- ════════════════════════════════════════════════════════════════════════════
select 'kategori' as tabel, scope, count(*) as jumlah
from public.kategori group by scope
union all select 'layanan', dept, count(*) from public.layanan group by dept
union all select 'informasi', category, count(*) from public.informasi group by category
union all select 'berita', category, count(*) from public.berita group by category
union all select 'promo_banner', status, count(*) from public.promo_banner group by status
order by tabel, scope;
