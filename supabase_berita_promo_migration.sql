-- ============================================================
-- SAYBA ARC — Berita & Banner Promo (Carousel) Migration
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Aman dijalankan ulang (idempotent).
-- ============================================================


-- ============================================================
-- 1. TABEL BERITA
-- ============================================================

create table if not exists berita (
  id            uuid        default gen_random_uuid() primary key,
  title         text        not null,
  slug          text        unique not null,
  excerpt       text,                                  -- ringkasan singkat di kartu & meta description
  category      text        not null default 'gis',    -- lihat newsCategories di lib/news-data.ts
  image_url     text,                                  -- gambar utama (upload lewat admin / link Drive)
  author        text        not null default 'Redaksi SAYBA ARC',
  body          text,                                  -- isi artikel, Markdown ringan ("## " = sub-judul)
  published_at  date        not null default current_date,
  read_minutes  integer     not null default 3,
  views         integer     not null default 0,
  featured      boolean     not null default false,    -- true = tampil sebagai kartu Sorotan
  tags          text[],
  status        text        not null default 'active' check (status in ('active', 'draft', 'archived')),
  meta_title        text,
  meta_description  text,
  meta_keywords     text[],
  og_image          text,
  canonical_url     text,
  created_at    timestamptz default now()
);

-- Urutan tampil di halaman /berita
create index if not exists berita_published_at_idx on berita (published_at desc);
create index if not exists berita_status_idx       on berita (status);

alter table berita enable row level security;

-- Pengunjung anonim boleh membaca; aplikasi sendiri yang memfilter status = 'active'
-- (konvensi yang sama dengan tabel portfolio/layanan/produk).
drop policy if exists "berita_public_read" on berita;
create policy "berita_public_read" on berita
  for select using (true);

drop policy if exists "berita_auth_write" on berita;
create policy "berita_auth_write" on berita
  for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "berita_auth_update" on berita;
create policy "berita_auth_update" on berita
  for update
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "berita_auth_delete" on berita;
create policy "berita_auth_delete" on berita
  for delete
  using (auth.role() = 'authenticated');


-- ============================================================
-- 2. TABEL BANNER PROMO (carousel beranda)
-- ============================================================

create table if not exists promo_banner (
  id          uuid        default gen_random_uuid() primary key,
  image_url   text        not null,                    -- gambar slide, rasio 1600x600 px
  alt         text        not null default 'Banner promosi SAYBA ARC',
  eyebrow     text,                                    -- label kecil di atas judul
  title       text,                                    -- kosongkan semua teks jika gambar sudah memuat teks sendiri
  subtitle    text,
  cta_text    text,                                    -- teks tombol; kosong = slide tidak bisa diklik
  cta_href    text,
  sort_order  integer     not null default 1,          -- urutan tampil, kecil lebih dulu
  status      text        not null default 'active' check (status in ('active', 'draft')),
  created_at  timestamptz default now()
);

create index if not exists promo_banner_sort_idx on promo_banner (sort_order asc);

alter table promo_banner enable row level security;

drop policy if exists "promo_banner_public_read" on promo_banner;
create policy "promo_banner_public_read" on promo_banner
  for select using (true);

drop policy if exists "promo_banner_auth_write" on promo_banner;
create policy "promo_banner_auth_write" on promo_banner
  for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "promo_banner_auth_update" on promo_banner;
create policy "promo_banner_auth_update" on promo_banner
  for update
  using  (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "promo_banner_auth_delete" on promo_banner;
create policy "promo_banner_auth_delete" on promo_banner
  for delete
  using (auth.role() = 'authenticated');


-- ============================================================
-- 3. SEED — banner promo awal (gambar placeholder di /public/promo)
--    Hapus/ubah lewat admin dashboard kapan saja.
-- ============================================================

insert into promo_banner (image_url, alt, eyebrow, title, subtitle, cta_text, cta_href, sort_order, status)
select * from (values
  ('/promo/promo-1-1600x600.png', 'Promo layanan GIS & pemetaan SAYBA ARC', 'GIS & Pemetaan',
   'Pemetaan & Analisis Spasial',
   'Survei, pengolahan data spasial, sampai peta siap cetak — dikerjakan satu tim.',
   'Lihat Layanan', '/services', 1, 'active'),
  ('/promo/promo-2-1600x600.png', 'Promo pengembangan web dan aplikasi SAYBA ARC', 'Web & Aplikasi',
   'Website & Aplikasi Custom',
   'Dari company profile sampai sistem internal, dibangun cepat dan rapi.',
   'Konsultasi Gratis', '/contact', 2, 'active'),
  ('/promo/promo-3-1600x600.png', 'Promo dokumen dan produk siap pakai SAYBA ARC', 'Dokumen Siap Pakai',
   'Produk & Deliverable Instan',
   'Template dan dokumen teknis yang bisa langsung dipakai tanpa antre pengerjaan.',
   'Lihat Produk', '/products', 3, 'active')
) as seed(image_url, alt, eyebrow, title, subtitle, cta_text, cta_href, sort_order, status)
where not exists (select 1 from promo_banner);


-- ============================================================
-- 4. SEED — artikel berita awal
--    Hapus/ubah lewat admin dashboard kapan saja.
-- ============================================================

insert into berita (title, slug, excerpt, category, image_url, author, body, published_at, read_minutes, views, featured, tags, status)
select * from (values
  (
    'Pemetaan Partisipatif Desa di Kalimantan Barat: Dari Sketsa Warga ke Peta Digital',
    'pemetaan-partisipatif-desa-kalbar',
    'Bagaimana data lapangan yang dikumpulkan bersama warga desa diubah menjadi basis data spasial yang siap dipakai untuk perencanaan tata ruang.',
    'gis',
    '/berita/berita-featured-1200x675.png',
    'Tim GIS SAYBA ARC',
    E'Pemetaan partisipatif menempatkan warga sebagai sumber data utama. Alih-alih memulai dari citra satelit, tim kami memulai dari sketsa dan cerita warga tentang batas kebun, jalur sungai, dan area rawan banjir.\n\n## Kenapa data warga penting\n\nCitra satelit memberi geometri, tetapi tidak memberi konteks. Batas administratif di lapangan sering berbeda dengan dokumen, dan hanya warga yang tahu riwayatnya. Menggabungkan keduanya menghasilkan peta yang tidak sekadar akurat secara koordinat, tetapi juga diterima secara sosial.\n\n## Alur kerja yang kami pakai\n\nSketsa warga difoto dan digeoreferensi, lalu titik-titik penting diverifikasi dengan GPS genggam. Hasilnya masuk ke geodatabase dengan skema atribut yang konsisten sehingga bisa dipakai lintas dinas tanpa konversi ulang.\n\nTahap terakhir adalah kartografi: simbologi disederhanakan agar peta tetap terbaca saat dicetak A3 hitam-putih di kantor desa — kondisi nyata yang sering dilupakan saat mendesain peta di layar.\n\n## Yang kami pelajari\n\nValidasi berulang di lapangan lebih murah daripada memperbaiki peta setelah dipakai untuk pengambilan keputusan. Sisihkan waktu untuk satu putaran verifikasi tambahan sebelum peta difinalisasi.',
    date '2026-09-05', 6, 412, true,
    array['ArcGIS', 'Survei Lapangan', 'Tata Ruang'], 'active'
  ),
  (
    'Membangun WebGIS yang Ringan untuk Instansi dengan Koneksi Terbatas',
    'webgis-ringan-untuk-instansi',
    'Teknik memangkas ukuran layer, caching tile, dan penyederhanaan geometri agar WebGIS tetap responsif di jaringan lambat.',
    'teknologi',
    '/berita/berita-1-800x500.png',
    'Tim Web SAYBA ARC',
    E'Banyak WebGIS gagal dipakai bukan karena datanya salah, tetapi karena terlalu berat dibuka dari kantor kecamatan. Optimasi harus jadi bagian desain, bukan tambalan di akhir.\n\n## Sederhanakan geometri lebih dulu\n\nPoligon hasil digitasi skala besar sering menyimpan ribuan vertex yang tidak terlihat pada skala tampil. Penyederhanaan bertingkat sesuai level zoom memangkas ukuran payload secara drastis tanpa perubahan visual.\n\n## Pisahkan data statis dan dinamis\n\nLayer dasar yang jarang berubah sebaiknya disajikan sebagai tile yang bisa di-cache lama. Hanya layer yang benar-benar berubah yang diambil langsung dari database.\n\n## Ukur dengan kondisi nyata\n\nUji aplikasi dengan pembatasan jaringan, bukan di kantor dengan fiber. Target yang kami pakai: peta pertama tampil di bawah tiga detik pada koneksi 3G.',
    date '2026-08-28', 5, 288, false,
    array['WebGIS', 'Performa', 'Leaflet'], 'active'
  ),
  (
    'Standar Penamaan Layer yang Menyelamatkan Proyek Geodatabase Anda',
    'standar-penamaan-layer-geodatabase',
    'Konvensi penamaan yang konsisten membuat serah terima proyek jauh lebih mudah dan mengurangi risiko salah pakai data.',
    'gis',
    '/berita/berita-2-800x500.png',
    'Tim GIS SAYBA ARC',
    E'Nama layer seperti final_fix_2_revisi adalah tanda bahaya. Saat proyek berpindah tangan, penamaan yang tidak konsisten menjadi sumber kesalahan paling mahal.\n\n## Pola yang kami pakai\n\nKami memakai pola tema_wilayah_tahun_skala, seluruhnya huruf kecil tanpa spasi. Pola ini bisa diurutkan, bisa dicari, dan langsung menjelaskan isi tanpa membuka atribut.\n\n## Versi disimpan di metadata, bukan di nama\n\nRiwayat revisi masuk ke metadata dan catatan perubahan. Nama file tetap stabil sehingga tautan di peta, skrip, dan dokumen tidak putus setiap kali ada revisi.',
    date '2026-08-20', 4, 197, false,
    array['Geodatabase', 'Standar Data'], 'active'
  ),
  (
    'Cerita Proyek: Dashboard Monitoring Aset dalam Tiga Minggu',
    'cerita-proyek-dashboard-monitoring',
    'Dari kebutuhan yang belum jelas sampai dashboard yang dipakai harian — catatan proses, kompromi, dan hasilnya.',
    'proyek',
    '/berita/berita-3-800x500.png',
    'Tim SAYBA ARC',
    E'Klien datang dengan permintaan singkat: ingin melihat kondisi aset di lapangan tanpa harus membuka file Excel satu per satu. Kebutuhan detailnya belum terdefinisi.\n\n## Minggu pertama: menyamakan definisi\n\nSebagian besar waktu habis untuk menyepakati arti satu kata: aktif. Setelah definisi disepakati, sisa pekerjaan menjadi jauh lebih cepat.\n\n## Minggu kedua: prototipe yang bisa diklik\n\nKami membangun prototipe dengan data contoh agar klien bisa mencoba alurnya lebih awal. Dua permintaan besar berubah di tahap ini — jauh lebih murah daripada berubah setelah sistem jadi.\n\n## Minggu ketiga: integrasi dan serah terima\n\nData asli masuk, hak akses diatur per unit kerja, dan tim klien dilatih setengah hari. Dashboard dipakai rutin sejak minggu pertama setelah serah terima.',
    date '2026-08-12', 7, 356, false,
    array['Dashboard', 'Studi Kasus'], 'active'
  ),
  (
    'Checklist Sebelum Mengirim Gambar Teknik ke Klien',
    'checklist-gambar-teknik',
    'Sepuluh pemeriksaan cepat yang mencegah revisi berulang: layer, skala, dimensi, dan konsistensi kop gambar.',
    'engineering',
    '/berita/berita-4-800x500.png',
    'Tim Engineering SAYBA ARC',
    E'Sebagian besar revisi gambar teknik bukan soal desain, melainkan soal kerapian penyajian. Checklist singkat sebelum kirim menghemat berhari-hari bolak-balik.\n\n## Pemeriksaan wajib\n\nPastikan seluruh objek berada di layer yang benar, tidak ada objek di layer 0. Periksa skala viewport, ketebalan garis saat plot, dan bahwa seluruh dimensi terhubung ke geometri (associative), bukan teks manual.\n\n## Kop gambar dan revisi\n\nNomor gambar, tanggal, dan kode revisi harus konsisten di semua lembar. Satu lembar dengan revisi tertinggal cukup untuk membuat seluruh paket dipertanyakan.\n\n## Kirim PDF beserta file sumber\n\nPDF memastikan tampilan yang Anda maksud, file sumber memastikan klien bisa melanjutkan. Kirim keduanya, selalu.',
    date '2026-08-04', 4, 163, false,
    array['AutoCAD', 'QA', 'Drafting'], 'active'
  ),
  (
    'SAYBA ARC Membuka Layanan Analitik Data & Machine Learning',
    'sayba-arc-buka-layanan-machine-learning',
    'Lini layanan baru untuk klasifikasi citra, prediksi berbasis data spasial, dan otomasi pengolahan data rutin.',
    'perusahaan',
    '/berita/berita-5-800x500.png',
    'Redaksi SAYBA ARC',
    E'Mulai kuartal ini SAYBA ARC resmi menawarkan layanan analitik data dan machine learning sebagai lini tersendiri, melengkapi layanan GIS, pengembangan web, dan rancang teknik.\n\n## Cakupan layanan\n\nKlasifikasi tutupan lahan dari citra, deteksi perubahan antarwaktu, model prediktif berbasis data spasial, serta otomasi pengolahan data yang selama ini dikerjakan manual.\n\n## Cara memulai\n\nKami menyediakan sesi konsultasi awal untuk menilai kesiapan data sebelum proyek dimulai. Hubungi kami melalui halaman kontak untuk menjadwalkan.',
    date '2026-07-25', 3, 521, false,
    array['Pengumuman', 'Machine Learning'], 'active'
  ),
  (
    'Memilih Sistem Koordinat yang Tepat untuk Proyek di Indonesia',
    'memilih-sistem-koordinat-indonesia',
    'Panduan praktis memilih antara WGS 84, UTM zona yang sesuai, dan DGN95 agar perhitungan luas tetap akurat.',
    'gis',
    '/berita/berita-6-800x500.png',
    'Tim GIS SAYBA ARC',
    E'Salah memilih sistem koordinat adalah kesalahan yang sunyi: peta tetap tampak benar, tetapi angka luas dan jaraknya keliru.\n\n## Geografis untuk penyimpanan, proyeksi untuk pengukuran\n\nSimpan data dalam koordinat geografis agar mudah dipertukarkan, lalu proyeksikan ke UTM zona yang sesuai saat menghitung luas atau jarak.\n\n## Perhatikan batas zona\n\nWilayah Indonesia melintasi banyak zona UTM. Untuk area yang melewati batas zona, gunakan proyeksi setara-luas nasional agar hasil perhitungan konsisten.\n\n## Catat di metadata\n\nSelalu tuliskan sistem koordinat dan datum di metadata. Ini pemeriksaan pertama yang dilakukan siapa pun yang menerima data Anda.',
    date '2026-07-15', 5, 274, false,
    array['Sistem Koordinat', 'UTM', 'Kartografi'], 'active'
  )
) as seed(title, slug, excerpt, category, image_url, author, body, published_at, read_minutes, views, featured, tags, status)
where not exists (select 1 from berita);
