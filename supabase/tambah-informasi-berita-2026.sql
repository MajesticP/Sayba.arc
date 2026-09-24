-- ════════════════════════════════════════════════════════════════════════════
-- SAYBA ARC: TAMBAH INFORMASI & BERITA BARU
-- ════════════════════════════════════════════════════════════════════════════
--
-- Jalankan SEKALI di Supabase Dashboard > SQL Editor.
-- AMAN DIJALANKAN BERULANG KALI dan TIDAK MENGHAPUS APA PUN.
--
-- Cara kerjanya:
--   * Tiap baris memakai `on conflict (slug) do nothing`. Kalau slug-nya sudah
--     ada (mis. Anda pernah menjalankan berkas ini), baris itu dilewati.
--     Jadi data lama Anda tidak tersentuh, dan menjalankan dua kali tidak
--     menggandakan apa pun.
--   * Kalau Anda pernah MENGUBAH salah satu tulisan di bawah ini lewat admin,
--     perubahan Anda TIDAK akan ditimpa saat berkas ini dijalankan lagi.
--
-- Yang ditambahkan:
--   5 DOKUMEN INFORMASI (panduan teknis, penuh istilah yang dicari klien)
--   6 BERITA (tren 2026 + kabar industri, masing-masing dengan sumber)
--
-- CATATAN PENTING soal tanggal:
--   Kolom `published_at` memakai tanggal, dan berkas ini TIDAK mengisinya,
--   jadi otomatis terisi tanggal hari Anda menjalankannya. Sesudah itu, silakan
--   ubah tanggalnya lewat Admin Dashboard bila perlu.
--
-- CATATAN soal `featured_order`:
--   Berita pertama diberi sorotan #1, kedua #2, ketiga #3 — TAPI hanya kalau
--   kolom `featured_order` sudah ada. Kalau Anda belum menjalankan
--   `migrasi-berita-featured-order.sql`, bagian itu otomatis dilewati dan
--   berita tetap tampil normal (hanya tanpa urutan sorotan).
--
-- CATATAN soal gambar:
--   Tulisan di bawah sengaja tidak memakai gambar. Halaman akan menampilkan
--   bidang rapi berisi inisial judul — bukan foto contoh yang menyesatkan.
--   Silakan unggah gambar sendiri lewat Admin Dashboard kapan saja.
-- ════════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════════
-- BAGIAN 1: DOKUMEN INFORMASI
-- ════════════════════════════════════════════════════════════════════════════
-- Nada tulisan: panduan teknis yang bisa dipakai siapa pun. Istilah teknis
-- ditulis apa adanya (AutoCAD, ArcGIS, DWG, shapefile, UTM, SRGI) karena
-- itulah kata yang benar-benar diketik orang saat mencari.

insert into public.informasi
  (title, slug, excerpt, category, author, body, read_minutes, featured, tags, status)
values

-- ── 1 ────────────────────────────────────────────────────────────────────────
(
  'Menyiapkan Data Spasial Sebelum Kirim ke ArcGIS',
  'menyiapkan-data-spasial-untuk-arcgis',
  'Data spasial yang rapi menghemat berhari-hari kerja di tahap analisis. Ini urutan pemeriksaan yang kami lakukan sebelum data masuk ke ArcGIS: sistem koordinat, topologi, atribut, dan metadata.',
  'standar',
  'Tim SAYBA ARC',
  E'# Data spasial yang belum diperiksa hampir selalu menimbulkan masalah di tengah pekerjaan. Perbaikannya jauh lebih mahal setelah peta tematik tersusun, karena satu kesalahan koordinat bisa membuat seluruh analisis harus diulang dari awal.\n\nUrutan pemeriksaan di bawah ini kami pakai untuk setiap pekerjaan yang masuk ke ArcGIS, baik ArcGIS Pro maupun ArcGIS Online.\n\n## Sistem koordinat dan datum\nIni pemeriksaan pertama dan paling sering terlewat. Data dari lapangan sering datang dalam koordinat geografis (derajat), sedangkan pekerjaan perencanaan butuh koordinat terproyeksi (meter) supaya luas dan jarak bisa dihitung.\n\nYang kami pastikan:\n- Datum memakai WGS 1984 atau SRGI 2013. Keduanya saling terhubung, dan SRGI 2013 adalah acuan resmi nasional.\n- Proyeksi memakai UTM pada zona yang sesuai, atau TM-3 derajat untuk pekerjaan yang butuh ketelitian tinggi.\n- Berkas pendamping (.prj untuk shapefile) selalu ikut terkirim. Tanpa itu, penerima harus menebak sendiri.\n\nCara memeriksa cepat di ArcGIS Pro: buka Properties layer, lihat bagian Source. Kalau tertulis GCS dan bukan PCS, berarti datanya belum terproyeksi.\n\n## Topologi: tidak boleh ada tumpang tindih dan celah\nUntuk data bidang seperti batas administrasi, persil, atau zona perencanaan, dua kesalahan ini paling sering muncul:\n- **Tumpang tindih (overlap)** — dua bidang menempati area yang sama. Akibatnya luas total menjadi lebih besar dari yang sebenarnya.\n- **Celah (gap)** — ada ruang kosong di antara bidang yang seharusnya bersebelahan.\n\nKeduanya bisa ditemukan lewat Topology pada File Geodatabase. Untuk shapefile yang tidak mendukung topologi, kami memeriksanya memakai alat Geometry atau memindahkannya dulu ke geodatabase.\n\n## Atribut: satu kolom, satu arti\nKesalahan atribut yang paling merepotkan bukan yang kosong, melainkan yang isinya bercampur. Contohnya kolom `KECAMATAN` yang di sebagian baris berisi nama kecamatan dan di baris lain berisi kode angka. Begitu data itu dipakai untuk penggabungan tabel, hasilnya kosong tanpa pesan kesalahan.\n\nYang kami rapikan:\n- Setiap kolom hanya berisi satu jenis keterangan.\n- Nama kolom tanpa spasi dan tanpa huruf besar-kecil bercampur, karena sebagian sistem warisan gagal membaca keduanya.\n- Nilai kosong ditulis konsisten: dikosongkan, bukan diisi "0", "-", atau "N/A".\n\n## Metadata dan riwayat pengambilan data\nMetadata bukan pelengkap. Untuk pekerjaan instansi, metadata sering menjadi syarat serah terima, dan formatnya mengikuti standar ISO 19115.\n\nMinimal yang kami catat: sumber data, tanggal pengambilan, alat yang dipakai, dan siapa yang mengolah. Catatan ini yang menyelamatkan pekerjaan saat data yang sama perlu diperbarui dua tahun kemudian.\n\n## Daftar periksa ringkas\n- Sistem koordinat dan datum sudah tertulis, berkas .prj ikut terkirim\n- Tidak ada tumpang tindih dan celah pada data bidang\n- Setiap kolom berisi satu jenis keterangan saja\n- Nilai kosong dikosongkan, bukan diisi tanda\n- Metadata terisi: sumber, tanggal, alat, pengolah\n- Sudah dibuka ulang di ArcGIS Pro dan tampil di posisi yang benar\n\n## Kenapa urutan ini penting\nSemua pemeriksaan di atas dikerjakan SEBELUM analisis dimulai, bukan sesudah. Alasannya sederhana: memperbaiki koordinat pada satu lapisan di awal pekerjaan memakan beberapa menit, sedangkan memperbaikinya setelah lima peta tematik tersusun memakan beberapa hari.',
  7, true, ARRAY['ArcGIS', 'GIS', 'data spasial', 'sistem koordinat', 'topologi'], 'active'
),

-- ── 2 ────────────────────────────────────────────────────────────────────────
(
  'Standar Layer dan Skala Gambar Kerja AutoCAD',
  'standar-layer-gambar-kerja-autocad',
  'Gambar kerja yang layernya rapi bisa dibuka, diedit, dan dicetak oleh siapa pun tanpa penjelasan tambahan. Ini aturan penamaan layer, skala, dan penataan layout yang kami pakai.',
  'standar',
  'Tim SAYBA ARC',
  E'# Gambar kerja bukan hanya untuk dicetak, tetapi juga untuk dilanjutkan orang lain. Gambar yang layernya bernama "Layer1", "Layer2", dan "Layer3" akan memaksa penerima membuka setiap objek satu per satu untuk tahu isinya.\n\nAturan di bawah ini kami pakai untuk semua pekerjaan DWG.\n\n## Penamaan layer: awalan kelompok, lalu keterangan\nNama layer disusun dari kelompok besar, lalu keterangan yang lebih khusus. Pemisahnya tanda hubung, bukan spasi.\n\n| Awalan | Isi | Contoh |\n| --- | --- | --- |\n| A- | Arsitektur | A-DINDING, A-PINTU, A-ATAP |\n| S- | Struktur | S-PONDASI, S-KOLOM, S-BALOK |\n| M- | Mekanikal | M-PIPA-AIR, M-DUCTING |\n| E- | Elektrikal | E-TITIK-LAMPU, E-PANEL |\n| U- | Utilitas | U-DRAINASE, U-JALAN |\n| X- | Referensi | X-GRID, X-BATAS, X-UKUR |\n\nYang penting: kelompok gambar dan anotasi dipisah. Dimensi, teks, dan garis ukur punya layernya sendiri, sehingga bisa dimatikan sekaligus saat gambar dipakai sebagai referensi.\n\n## Warna dan ketebalan garis\nWarna layer dipakai untuk membedakan kelompok, dan ketebalan garis diatur lewat Lineweight, bukan lewat warna.\n\nKesalahan yang sering kami temui: ketebalan garis diatur dengan memilih warna tertentu, karena kebetulan warna itu tercetak tebal. Cara ini membuat gambar tidak bisa dicetak hitam-putih dengan benar, dan tidak bisa dipindah ke standar lain tanpa mengubah semua warna.\n\n## Skala: gambar digambar 1:1, skalanya di layout\nIni aturan yang paling sering dilanggar. Objek di ruang model SELALU digambar dalam ukuran sebenarnya, satu unit sama dengan satu milimeter atau satu meter sesuai kesepakatan awal.\n\nPenskalaan terjadi di layout:\n- Viewport diberi skala standar: 1:100, 1:200, 1:500, 1:1000.\n- Skala ditulis di bawah setiap gambar, bukan hanya di keterangan berkas.\n- Untuk pekerjaan yang butuh skala presisi, tambahkan skala batang (bar scale), karena skala angka ikut berubah kalau gambar diperbesar.\n\n## Layout dan cetak\n- Satu layout untuk satu lembar, dengan ukuran kertas yang sudah ditetapkan.\n- Viewport diberi nama sesuai gambar yang ditampilkan, bukan "Viewport1".\n- Plot Style dipakai untuk mengatur ketebalan cetak, sehingga hasil di kertas sesuai dengan yang terlihat di layar.\n\n## Serah terima berkas\nYang kami serahkan bersamaan:\n- Berkas DWG asli beserta seluruh Xref-nya.\n- PDF resolusi tinggi dengan skala terkalibrasi.\n- Catatan struktur layer, supaya penerima tidak perlu menebak.\n\nVersi DWG yang kami pakai kompatibel dengan AutoCAD 2018 sampai 2024, jadi bisa dibuka di sebagian besar komputer tanpa perlu diperbarui.\n\n## Daftar periksa ringkas\n- Nama layer memakai awalan kelompok, tanpa spasi\n- Gambar dan anotasi berada di layer terpisah\n- Ketebalan garis diatur lewat Lineweight, bukan warna\n- Objek digambar 1:1, penskalaan hanya di viewport\n- Setiap layout berisi satu lembar dengan ukuran kertas pasti\n- Xref ikut terkirim dan jalurnya relatif, bukan absolut',
  8, false, ARRAY['AutoCAD', 'gambar teknik', 'layer', 'DWG', 'standar'], 'active'
),

-- ── 3 ────────────────────────────────────────────────────────────────────────
(
  'Cara Memilih Format Berkas Data Spasial yang Tepat',
  'memilih-format-berkas-data-spasial',
  'Shapefile, GeoJSON, GeoPackage, atau File Geodatabase? Masing-masing punya batas yang perlu diketahui sebelum data dikirim, supaya tidak berakhir dengan berkas yang tidak bisa dibuka.',
  'panduan',
  'Tim SAYBA ARC',
  E'# Pertanyaan yang paling sering muncul saat serah terima data bukan "datanya lengkap?", melainkan "formatnya apa?". Salah memilih format membuat data harus dikonversi ulang, dan konversi selalu berisiko kehilangan sesuatu.\n\n## Ringkasan cepat\n\n| Format | Paling cocok untuk | Batas yang perlu diketahui |\n| --- | --- | --- |\n| Shapefile | Pertukaran data antar instansi | Nama kolom maksimal 10 karakter, satu berkas hanya satu jenis geometri |\n| GeoJSON | Aplikasi web dan peta daring | Ukurannya membengkak untuk data besar |\n| GeoPackage | Arsip data lengkap | Perlu perangkat lunak yang mendukung |\n| File Geodatabase | Pekerjaan ArcGIS | Terikat ekosistem Esri |\n| DWG dan DXF | Gambar teknik | Bukan penyimpan data atribut |\n| GeoTIFF | Citra dan data raster | Ukuran berkas besar |\n\n## Shapefile: masih yang paling aman untuk dikirim\nShapefile tetap dipakai karena hampir semua perangkat lunak bisa membukanya. Tapi ada dua batas yang harus diketahui sebelum mengirim:\n\n- **Satu shapefile hanya berisi satu jenis geometri.** Titik, garis, dan bidang harus jadi berkas terpisah.\n- **Nama kolom dibatasi 10 karakter.** Kolom `KECAMATAN` akan terpotong menjadi `KECAMATAN_` atau bahkan `KECAMATA`. Ini terjadi otomatis dan sering tidak disadari.\n\nSatu hal yang sering terlewat: shapefile sebenarnya terdiri dari beberapa berkas yang harus ikut bersama. Yang wajib: `.shp`, `.shx`, `.dbf`, dan `.prj`. Kalau `.prj` tertinggal, penerima harus menebak sistem koordinatnya.\n\n## GeoJSON: untuk yang tampil di browser\nGeoJSON adalah format berbasis teks yang langsung bisa dibaca aplikasi web. Cocok untuk peta interaktif dan data yang jumlahnya tidak terlalu besar.\n\nBatasnya: karena berbasis teks, ukurannya bisa 3 sampai 5 kali lipat shapefile dengan isi yang sama. Untuk data tingkat kabupaten, ini masih wajar. Untuk data tingkat nasional, berkasnya bisa membuat browser tersendat.\n\n## GeoPackage: satu berkas untuk banyak lapisan\nGeoPackage adalah format modern yang bisa memuat banyak lapisan dalam satu berkas, termasuk data vektor dan raster sekaligus. Ini yang kami pakai untuk pengarsipan jangka panjang.\n\nKeunggulannya: nama kolom tidak dibatasi, satu berkas bisa memuat banyak lapisan, dan formatnya terbuka sehingga tidak terikat satu perangkat lunak.\n\n## File Geodatabase: untuk pekerjaan ArcGIS\nKalau seluruh pekerjaan berjalan di ArcGIS, File Geodatabase adalah pilihan terbaik. Format ini mendukung topologi, domain nilai, subtype, dan aturan validasi yang tidak bisa ditampung shapefile.\n\n## Berkas gambar teknik\nDWG adalah format asli AutoCAD, sedangkan DXF adalah versi pertukarannya. DXF lebih mudah dibuka perangkat lain, tapi ukurannya lebih besar dan tidak selalu memuat seluruh pengaturan cetak.\n\nPerlu diingat: DWG dan DXF menyimpan gambar, bukan data atribut. Kalau data harus bisa disaring dan dihitung, simpan di format spasial, bukan di gambar.\n\n## Saran praktis\n- Kirim data ke instansi: shapefile, lengkap dengan `.prj`.\n- Tampilkan di peta web: GeoJSON.\n- Simpan untuk jangka panjang: GeoPackage.\n- Kerjakan di ArcGIS: File Geodatabase.\n- Serahkan gambar kerja: DWG beserta PDF-nya.\n\nKalau ragu, kirim dua format sekaligus. Berkas tambahan jauh lebih murah daripada pekerjaan yang harus diulang.',
  6, false, ARRAY['shapefile', 'GeoJSON', 'GeoPackage', 'format data', 'GIS'], 'active'
),

-- ── 4 ────────────────────────────────────────────────────────────────────────
(
  'Membedakan Peta Dua Dimensi dan Tiga Dimensi untuk Kebutuhan Proyek',
  'peta-2d-dan-3d-untuk-proyek',
  'Peta 2D dan 3D bukan soal mana yang lebih canggih, melainkan mana yang menjawab pertanyaan proyek. Ini panduan memilih, lengkap dengan perkiraan kebutuhan datanya.',
  'panduan',
  'Tim SAYBA ARC',
  E'# Pertanyaan yang menentukan bukan "mau 2D atau 3D?", melainkan "apa yang perlu dilihat dari data ini?". Peta 2D menjawab pertanyaan tentang sebaran dan luas. Peta 3D menjawab pertanyaan tentang ketinggian, ruang, dan apa yang saling menghalangi.\n\n## Kapan peta 2D sudah cukup\nSebagian besar pekerjaan perencanaan dan administrasi diselesaikan dengan peta 2D:\n- Peta batas administrasi, persil, dan zona perencanaan\n- Peta tematik: kepadatan, tutupan lahan, sebaran fasilitas\n- Perhitungan luas, jarak, dan panjang jaringan\n- Peta kerja lapangan yang dicetak dan dibawa ke lokasi\n\nAlasannya bukan karena 2D lebih murah, tetapi karena pertanyaannya memang datar: "berapa luasnya" dan "di mana letaknya" tidak butuh ketinggian.\n\n## Kapan peta 3D memberi jawaban yang tidak bisa diberikan 2D\nAda empat pertanyaan yang hanya bisa dijawab 3D:\n- **Apa yang menghalangi pandangan?** Untuk penempatan menara, kamera, atau panel, 2D tidak bisa menunjukkan bangunan mana yang menutupi.\n- **Berapa besar galian dan timbunan?** Perhitungan volume membutuhkan permukaan, bukan bidang datar.\n- **Apakah ada tabrakan antar jaringan?** Pipa air, kabel, dan saluran yang saling bersilangan hanya bisa diperiksa di ruang 3D.\n- **Bagaimana bangunan menyatu dengan konturnya?** Untuk kawasan berkontur, 3D menunjukkan bagian mana yang harus dipotong dan ditimbun.\n\n## Kebutuhan data berbeda\n\n| Keperluan | Data 2D | Data 3D |\n| --- | --- | --- |\n| Peta tematik | Batas bidang, atribut | - |\n| Volume galian | - | Permukaan tanah (DEM atau hasil ukur) |\n| Pemeriksaan tabrakan | - | Model jaringan lengkap dengan ketinggian |\n| Visualisasi kawasan | Batas dan tata guna lahan | Model bangunan dan permukaan |\n\nYang perlu diketahui: pekerjaan 3D hampir selalu membutuhkan data 2D yang sudah benar lebih dulu. Membangun 3D di atas data 2D yang koordinatnya belum rapi hanya memperbesar kesalahannya.\n\n## Urutan yang kami sarankan\n1. Rapikan data 2D: sistem koordinat, topologi, atribut.\n2. Tentukan pertanyaan yang butuh 3D. Kalau tidak ada, berhenti di tahap ini.\n3. Kumpulkan data ketinggian yang sesuai ketelitian yang dibutuhkan.\n4. Bangun model 3D di atas dasar 2D yang sudah benar.\n\n## Soal biaya dan waktu\nPekerjaan 3D bukan sekadar versi lebih berat dari 2D. Kebutuhan datanya berbeda, dan data ketinggian sering harus diambil sendiri karena belum tersedia. Karena itu, pertanyaan yang tepat diajukan sejak awal adalah "keputusan apa yang akan diambil dari model ini?", bukan "bisakah dibuat 3D?".\n\nKalau jawabannya tidak menyebut keputusan yang bergantung pada ketinggian atau ruang, peta 2D yang rapi sudah cukup.',
  6, false, ARRAY['3D', '2D', 'pemetaan', 'DEM', 'analisis spasial'], 'active'
),

-- ── 5 ────────────────────────────────────────────────────────────────────────
(
  'Ukuran Berkas dan Kecepatan Peta Web di HP',
  'ukuran-berkas-dan-kecepatan-peta-web',
  'Peta yang lambat dibuka di HP bukan masalah jaringan, melainkan masalah ukuran data. Ini batas praktis dan cara menekannya tanpa mengorbankan ketelitian.',
  'panduan',
  'Tim SAYBA ARC',
  E'# Peta web yang lambat hampir selalu disebabkan ukuran data yang terlalu besar, bukan koneksi yang buruk. Petugas lapangan sering membuka peta di lokasi yang sinyalnya lemah, jadi ukuran berkas menjadi penentu apakah peta itu terpakai atau tidak.\n\n## Ukuran yang masih nyaman\nAngka di bawah ini dari pengalaman lapangan, bukan dari spesifikasi teknis:\n\n| Ukuran data | Pengalaman pemakaian |\n| --- | --- |\n| Di bawah 1 MB | Terbuka cepat bahkan di sinyal lemah |\n| 1 sampai 5 MB | Masih nyaman, perlu jeda singkat |\n| 5 sampai 20 MB | Terasa berat di HP, terutama saat pertama dibuka |\n| Di atas 20 MB | Sering gagal terbuka di lapangan |\n\n## Cara menekan ukuran tanpa mengorbankan ketelitian\n\n### 1. Buang kolom yang tidak dipakai\nIni cara paling cepat dan paling sering terlupakan. Data dari instansi biasanya datang dengan puluhan kolom, sedangkan yang benar-benar ditampilkan di peta mungkin hanya lima. Menghapus sisanya bisa memotong ukuran hingga setengah tanpa mengubah sedikit pun bentuk petanya.\n\n### 2. Sederhanakan bentuk geometri\nGaris pantai atau batas yang digambar dari citra resolusi tinggi bisa punya ribuan titik, padahal pada skala tampil di HP hanya butuh sebagian kecilnya. Penyederhanaan dengan toleransi yang tepat bisa memotong ukuran hingga 70 persen, dan perbedaannya tidak terlihat di layar.\n\nYang perlu dijaga: pekerjaan penyederhanaan harus disimpan sebagai salinan. Berkas asli tetap utuh untuk keperluan cetak dan analisis presisi.\n\n### 3. Bagi data berdasarkan wilayah atau tingkat zoom\nMemuat seluruh data kabupaten sekaligus tidak efisien kalau pengguna hanya melihat satu kecamatan. Data bisa dipecah per wilayah, dan hanya bagian yang sedang dilihat yang dimuat.\n\n### 4. Pakai format yang sesuai\nGeoJSON nyaman dibaca tetapi boros ukuran. Untuk data yang besar, format biner seperti FlatGeobuf atau ubin vektor jauh lebih ringan. Untuk data yang jarang berubah, ubin yang sudah jadi bisa disiapkan lebih dulu.\n\n## Yang TIDAK boleh dilakukan\n- Menurunkan ketelitian koordinat sampai bentuk bidangnya berubah. Data yang sudah disederhanakan terlalu jauh tidak bisa dikembalikan.\n- Menghapus atribut penting hanya demi mengejar ukuran. Kolom yang tampak tidak perlu sering dibutuhkan untuk penyaringan.\n- Memuat semua lapisan sekaligus di awal. Nyalakan lapisan sesuai kebutuhan.\n\n## Cara memeriksa\nSebelum diserahkan, peta kami uji di HP dengan sambungan lambat, bukan hanya di komputer kantor. Yang diperiksa: berapa lama sampai peta tampil, apakah bisa digeser dengan lancar, dan apakah masih terbuka saat sinyal turun ke tingkat paling lemah.\n\n## Ringkasnya\nPeta web yang baik diukur dari apakah ia bisa dipakai di lapangan, bukan dari seberapa lengkap isinya. Data yang lengkap tapi tidak pernah berhasil dibuka tidak memberi manfaat apa pun.',
  5, false, ARRAY['peta web', 'WebGIS', 'optimasi', 'GeoJSON', 'mobile'], 'active'
)

on conflict (slug) do nothing;


-- ════════════════════════════════════════════════════════════════════════════
-- BAGIAN 2: BERITA
-- ════════════════════════════════════════════════════════════════════════════
-- Setiap tulisan menyebutkan sumbernya dengan tautan, karena kabar teknis
-- tanpa sumber tidak bisa diverifikasi pembaca.
--
-- Tiga tulisan pertama mengangkat tren yang sedang dibicarakan (peta 3D,
-- standar data nasional, dan otomatisasi peta). Tiga sisanya membahas
-- kebiasaan kerja yang langsung terasa di proyek.

insert into public.berita
  (title, slug, excerpt, category, author, body, read_minutes, featured, tags, status, meta_title, meta_description)
values

-- ── 1: TREN UTAMA — peta 3D ──────────────────────────────────────────────────
(
  'Peta 3D Bukan Lagi Barang Mewah: Standar Baru Pekerjaan Spasial 2026',
  'peta-3d-standar-baru-2026',
  'Sepanjang 2026, permintaan peta 3D dan digital twin naik tajam. Perangkat lunaknya kini bisa menggabungkan data desain bangunan langsung ke dalam sistem informasi geografis. Apa artinya bagi pekerjaan pemetaan di daerah?',
  'teknologi',
  'Tim SAYBA ARC',
  E'# Selama bertahun-tahun, peta tiga dimensi dianggap pekerjaan tambahan yang hanya dikerjakan kalau anggarannya tersisa. Sepanjang 2026, anggapan itu berubah. Peta 3D bergeser dari pelengkap presentasi menjadi bagian dari cara instansi memeriksa rencana pembangunan sebelum dibangun.\n\n## Perangkat lunaknya sudah menyusul\nPemicu utamanya sederhana: perangkat lunaknya akhirnya bisa bekerja dengan data yang sudah dimiliki instansi, tanpa harus menggambar ulang semuanya.\n\nRilis ArcGIS Pro 3.7 membawa perubahan yang paling terasa di bagian ini. Data dari Autodesk Civil 3D dan berkas IFC kini bisa langsung dibaca, dan permukaan tanah hasil desain bisa diubah menjadi data ketinggian tanpa langkah konversi berlapis. Pipa dari Revit pun bisa dibaca sebagai jalur tiga dimensi yang bisa ditelusuri.\n\nArtinya, model bangunan yang sudah dibuat tim perencana tidak lagi berhenti sebagai gambar. Model itu bisa masuk ke sistem pemetaan, digabungkan dengan batas wilayah dan tata guna lahan, lalu dipakai untuk memeriksa apakah rencananya berbenturan dengan kondisi lapangan.\n\n> Sumber: [What is New for BIM and CAD in the May 2026 release of ArcGIS Pro](https://www.esri.com/arcgis-blog/products/arcgis-pro/announcements/whats-new-for-bim-and-cad-in-the-may-2026-release-of-arcgis-pro) dan [What is New and Improved in ArcGIS Pro (May 2026)](https://www.esri.com/arcgis-blog/products/announcements/announcements/whats-new-and-improved-in-arcgis-pro-may-2026)\n\n## Yang paling sering diminta sekarang\nDari pekerjaan yang masuk ke kami, permintaan yang naik paling banyak ada tiga:\n\n- **Pemeriksaan tabrakan jaringan.** Pipa air, kabel, dan saluran drainase yang saling bersilangan tidak bisa diperiksa dengan gambar datar.\n- **Perhitungan galian dan timbunan.** Perencana butuh tahu berapa kubik tanah yang harus dipindahkan, dan itu butuh permukaan, bukan bidang datar.\n- **Pemeriksaan pandangan.** Untuk penempatan menara atau kamera, pertanyaannya adalah bangunan mana yang menghalangi.\n\nKetiganya punya satu kesamaan: pertanyaannya tidak bisa dijawab dengan gambar datar, sekeras apa pun dicoba.\n\n## Data yang harus disiapkan lebih dulu\nIni bagian yang paling sering menimbulkan kejutan. Pekerjaan 3D hampir selalu membutuhkan data 2D yang sudah benar lebih dulu.\n\nUrutan yang kami pakai:\n1. Rapikan batas bidang: sistem koordinat, tumpang tindih, dan celah.\n2. Tentukan pertanyaan yang butuh 3D. Kalau tidak ada, berhenti di sini.\n3. Kumpulkan data ketinggian yang sesuai ketelitian yang dibutuhkan.\n4. Baru bangun model 3D di atas dasar yang sudah rapi.\n\nLangkah ketiga yang paling sering memakan waktu, karena data ketinggian dengan ketelitian tinggi sering belum tersedia dan harus diambil sendiri memakai pemetaan udara atau pengukuran darat.\n\n## Yang belum berubah\nSatu hal yang tidak berubah: data 2D yang koordinatnya belum rapi tidak bisa diselamatkan dengan mengubahnya menjadi 3D. Kesalahannya hanya ikut terbawa, dan sekarang terlihat lebih meyakinkan karena bentuknya tiga dimensi.\n\nKarena itu kami selalu memeriksa data dasar lebih dulu, sekecil apa pun pekerjaannya.',
  6, true, ARRAY['peta 3D', 'digital twin', 'ArcGIS Pro', 'BIM', 'tren 2026'], 'active',
  'Peta 3D Jadi Standar Baru Pemetaan 2026, Ini Perubahannya',
  'Permintaan peta 3D dan digital twin naik tajam sepanjang 2026. ArcGIS Pro 3.7 kini membaca data Civil 3D dan IFC langsung. Ini artinya untuk pekerjaan pemetaan.'
),

-- ── 2: TREN — standar data nasional ──────────────────────────────────────────
(
  'Satu Peta 2026: 187 Peta Tematik Dikompilasi, Peluang Kerja Pemetaan di Daerah',
  'satu-peta-2026-peluang-pemetaan-daerah',
  'Badan Informasi Geospasial melaporkan 187 peta tematik telah dikompilasi hingga Juli 2026. Pemerintah daerah kini membutuhkan peta dasar skala 1:5.000. Ini yang perlu disiapkan penyedia jasa pemetaan di daerah.',
  'teknologi',
  'Tim SAYBA ARC',
  E'# Ada celah pekerjaan yang terbuka lebar di bidang pemetaan, dan sumbernya dari kebijakan pemerintah sendiri.\n\n## Apa yang dilaporkan\nBadan Informasi Geospasial (BIG) menyampaikan bahwa hingga Juli 2026, sebanyak 42 kementerian dan lembaga telah ikut dalam proses kompilasi dan integrasi Informasi Geospasial Tematik. Sebanyak 187 peta tematik telah dikompilasi dan 152 di antaranya sudah terintegrasi. Dari jumlah itu, 36 peta adalah data baru di luar rencana aksi yang sudah ditetapkan.\n\nKebijakan Satu Peta sendiri berdiri di atas empat prinsip: satu referensi geospasial, satu standar, satu basis data, dan satu geoportal.\n\n> Sumber: [Siapa Pengampu Kebijakan Satu Peta? - BIG](https://www.big.go.id/news/2026/09/10/siapa-pengampu-kebijakan-satu-peta)\n\n## Celah yang terbuka di daerah\nBagian yang paling relevan bagi penyedia jasa di daerah muncul dari pernyataan Kepala BIG pada Februari 2026. Pemerintah menargetkan penyediaan peta dasar skala 1:5.000 untuk seluruh wilayah Indonesia.\n\nAngka yang disebutkan menarik: kalau dikerjakan dengan cara biasa, pekerjaan itu bisa memakan waktu 130 tahun dengan anggaran sekitar 41,8 triliun rupiah. Dengan pendekatan yang lebih efisien, targetnya bisa diselesaikan dalam empat tahun dengan anggaran sekitar 4,8 triliun rupiah.\n\nSelisih sebesar itu hanya mungkin kalau pekerjaannya tidak dikerjakan sendiri oleh pemerintah pusat. Di sinilah penyedia jasa pemetaan daerah mengambil peran.\n\n> Sumber: [BIG Dukung Percepatan Digitalisasi Tata Ruang Nasional](https://big.go.id/news/2026/02/11/big-dukung-percepatan-digitalisasi-tata-ruang-nasional)\n\n## Teknologi yang dipakai\nBIG menyebut beberapa pendekatan yang dipakai untuk mengejar target tersebut:\n- **LiDAR dan foto udara** untuk wilayah perkotaan, karena butuh ketelitian tinggi.\n- **Citra satelit dan radar** untuk wilayah nonperkotaan, karena cakupannya luas.\n- **Otomasi berbasis Geo-AI** untuk mempercepat produksi peta.\n\n## Yang perlu disiapkan penyedia jasa\nDari daftar di atas, ada tiga hal yang bisa disiapkan mulai sekarang:\n\n1. **Kemampuan mengolah data LiDAR.** Data titik yang sangat banyak ini butuh cara pengolahan tersendiri, dan tidak semua penyedia jasa terbiasa.\n2. **Pemahaman standar penyerahan data.** Peta yang diserahkan ke instansi harus mengikuti aturan penamaan, sistem koordinat, dan metadata yang berlaku. Data yang benar tapi formatnya tidak sesuai akan dikembalikan.\n3. **Dokumentasi proses.** Pekerjaan skala besar menuntut setiap tahap bisa ditelusuri. Catatan proses bukan formalitas, melainkan syarat.\n\n## Kenapa ini penting untuk Kalimantan Barat\nPeta dasar skala 1:5.000 berarti ketelitiannya jauh lebih tinggi daripada peta 1:50.000 yang selama ini jadi acuan. Pada skala itu, satu sentimeter di peta mewakili 50 meter di lapangan. Untuk keperluan perizinan dan tata ruang, ketelitian sebesar itu memang dibutuhkan.\n\nWilayah yang luas dengan akses terbatas seperti Kalimantan Barat justru paling diuntungkan oleh pendekatan ini, karena pekerjaan lapangan bisa dipangkas dengan pemetaan udara dan penginderaan jauh, lalu diverifikasi di titik-titik yang menentukan.',
  7, true, ARRAY['Kebijakan Satu Peta', 'BIG', 'pemetaan', 'LiDAR', 'tata ruang'], 'active',
  'Satu Peta 2026: Peluang Jasa Pemetaan untuk Pemerintah Daerah',
  'BIG mengompilasi 187 peta tematik hingga Juli 2026 dan menargetkan peta dasar skala 1:5.000. Ini peluang jasa pemetaan di daerah dan hal yang perlu disiapkan.'
),

-- ── 3: TREN — BIM dan otomatisasi ────────────────────────────────────────────
(
  'BIM dan Kecerdasan Buatan di Proyek Konstruksi Indonesia 2026',
  'bim-dan-ai-konstruksi-indonesia-2026',
  'Kementerian Pekerjaan Umum mendorong transformasi digital lewat kompetisi BIM dan AI pada 2026, sementara BUMN konstruksi sudah memakai LiDAR dan digital twin. Ini arah yang sedang dituju industri.',
  'teknologi',
  'Tim SAYBA ARC',
  E'# Kalau selama ini BIM dianggap urusan proyek besar, tahun 2026 menandai pergeserannya menjadi kemampuan yang diminta di banyak tingkatan pekerjaan.\n\n## Dorongan dari pemerintah\nDirektorat Jenderal Bina Konstruksi Kementerian Pekerjaan Umum meluncurkan AI x 5D BIM Master Challenge 2026 bersama Glodon Indonesia pada Mei 2026. Kompetisi ini menyasar sumber daya manusia konstruksi, dan disebarkan lewat seluruh Balai Jasa Konstruksi Wilayah I sampai VII.\n\nAlasan yang disebutkan langsung: pelaku konstruksi Indonesia harus mengikuti perkembangan teknologi digital, dan peningkatan kemampuan tenaga kerja menjadi kunci.\n\n> Sumber: [Kementerian Pekerjaan Umum Dorong Transformasi Digital Sektor Konstruksi](https://binakonstruksi.pu.go.id/informasi-terkini/sekretariat-direktorat-jenderal/kementerian-pekerjaan-umum-dorong-transformasi-digital-sektor-konstruksi-melalui-peluncuran-ai-x-5d-bim-master-challenge-2026)\n\n## Apa yang sudah dikerjakan BUMN konstruksi\nDi sisi pelaksana, PT Hutama Karya sudah memakai BIM, LiDAR, dan Lean Construction di proyek infrastruktur strategis. Perjalanannya cukup panjang: dimulai dari kebutuhan koordinasi desain pada proyek jalan tol pada 2014, lalu menjadi unit resmi pada 2018.\n\nPada 2021, perusahaan itu menjadi yang pertama di Indonesia meraih sertifikasi ISO 19650 Kitemark untuk pengelolaan informasi BIM.\n\nYang menarik, manfaatnya disebutkan berlapis:\n- Potensi benturan antar elemen desain terdeteksi lebih awal, sebelum masuk lapangan.\n- Progres pekerjaan bisa dipantau, dan pengendalian waktu serta biaya jadi lebih rapat.\n- Model akhir disempurnakan menjadi representasi digital aset, yang dipakai untuk pengelolaan jangka panjang.\n\nPada salah satu proyek, penggabungan BIM dengan penjadwalan memangkas target penyelesaian dari April 2026 menjadi Desember 2025.\n\n> Sumber: [Hakteknas 2026: Hutama Karya dan Penerapan BIM](https://www.hutamakarya.com/article/hakteknas-2026-hutama-karya-becomes-the-face-of-indonesias-construction-technology-revival)\n\n## Kenapa GIS dan BIM akhirnya bertemu\nBagian yang paling relevan untuk pekerjaan pemetaan adalah titik temu keduanya.\n\nBIM menyimpan informasi sangat rinci tentang satu bangunan. GIS menyimpan informasi tentang lokasi, wilayah, dan hubungan antar objek di permukaan bumi. Selama ini keduanya berjalan terpisah: model bangunan di satu tempat, peta wilayah di tempat lain.\n\nYang berubah pada 2026 adalah jembatannya. Data desain dari Civil 3D dan Revit kini bisa dibaca langsung sebagai bagian dari sistem informasi geografis. Model bangunan bisa diletakkan di atas peta wilayah yang sebenarnya, dan diperiksa terhadap batas administrasi, tata guna lahan, serta kondisi permukaan tanah.\n\nKombinasi ini yang biasanya disebut GeoBIM, dan menjadi dasar pembuatan digital twin: salinan digital dari kawasan nyata yang bisa dipakai untuk menguji rencana sebelum dibangun.\n\n## Yang perlu disiapkan sekarang\nUntuk penyedia jasa di daerah, ada tiga hal yang bisa dimulai tanpa menunggu proyek besar:\n\n1. **Rapikan data spasial.** Tanpa koordinat yang benar, model 3D paling bagus pun tidak bisa digabungkan dengan peta wilayah.\n2. **Biasakan bekerja dengan model, bukan hanya gambar.** Perbedaan cara kerja ini yang paling sering menjadi hambatan awal.\n3. **Ikuti standar penyerahan data.** Standar ISO 19650 adalah acuan yang dipakai proyek-proyek besar, dan mengenalnya lebih awal memudahkan kerja sama.\n\n## Catatan\nBIM dan digital twin bukan tujuan akhir. Keduanya alat untuk menjawab pertanyaan yang lebih sederhana: apakah rencana ini bisa dibangun tanpa benturan, dan berapa biayanya. Kalau pertanyaan itu belum jelas, teknologinya hanya menambah biaya.',
  7, true, ARRAY['BIM', 'digital twin', 'konstruksi', 'GeoBIM', 'LiDAR'], 'active',
  'BIM dan AI di Konstruksi Indonesia 2026, Arah Baru Industri',
  'Kementerian PU mendorong BIM dan AI lewat kompetisi 2026, BUMN konstruksi sudah pakai LiDAR dan digital twin. Ini artinya untuk jasa pemetaan dan GIS di daerah.'
),

-- ── 4: KEBIASAN KERJA — tren desain web ──────────────────────────────────────
(
  'Tren Desain Web 2026: Kembalinya Kedalaman Setelah Era Datar',
  'tren-desain-web-2026-kedalaman',
  'Setelah bertahun-tahun tampilan serba datar, desain web 2026 kembali memakai bayangan berlapis dan kedalaman. Tapi kali ini dengan alasan yang bisa diukur, bukan sekadar mengikuti gaya.',
  'teknologi',
  'Tim SAYBA ARC',
  E'# Kalau Anda memperhatikan situs-situs yang baru diperbarui sepanjang 2026, ada pola yang cukup jelas: tampilannya kembali punya kedalaman.\n\n## Siklusnya berputar, tapi alasannya berbeda\nSekitar satu dekade lalu, desain web bergerak ke arah serba datar. Bayangan dihapus, sudut dibuat tajam, dan gradien ditinggalkan. Alasan saat itu masuk akal: bayangan berlebihan membuat antarmuka terasa ramai dan lambat.\n\nMemasuki 2026, arahnya berbalik. Yang perlu dicatat, kembalinya kedalaman kali ini bukan sekadar mengulang gaya lama.\n\nAlasan yang paling sering disebutkan dalam tinjauan tren tahun ini: hampir semua situs sekarang dibangun memakai alat yang sama dan pola yang sama, sehingga tampilannya cenderung seragam. Kedalaman menjadi cara paling murah untuk membedakan satu situs dari yang lain.\n\n> Sumber: [Web Design Trends 2026: Tactile Brutalism and Invisible Architecture](https://fireart.studio/blog/the-best-web-design-trends/) dan [10 Web Design Inspiration Trends for 2026](https://inspirefusion.com/web-design-inspiration-trends-2026)\n\n## Yang kembali dipakai, dan batasnya\n\n### Bayangan berlapis, bukan satu lapis tebal\nBayangan yang bagus bukan satu lapisan gelap yang besar, melainkan beberapa lapis tipis: satu lapis rapat untuk menempelkan benda ke permukaannya, satu lapis sedang, dan satu lapis lebar yang sangat tipis.\n\nBedanya langsung terasa. Satu lapis selalu terbaca seperti garis abu yang ditempel. Tiga lapis terbaca sebagai benda yang punya tinggi.\n\n### Kedalaman yang tidak mengorbankan kecepatan\nSalah satu tinjauan menyebutkan hal yang menarik: kedalaman sekarang lebih banyak dibuat memakai bayangan dan tekstur yang ringan, bukan model tiga dimensi yang berat. Alasannya praktis: model 3D yang berat membuat situs lambat dibuka, dan itu bertentangan dengan tujuan awalnya.\n\n### Gerakan yang mengikuti gulir\nAnimasi berbasis posisi gulir kini didukung langsung oleh browser tanpa perlu tambahan pustaka. Efeknya bisa muncul tanpa membebani kecepatan halaman.\n\nBatas yang perlu dijaga: gerakan harus memperjelas isi, bukan menghias. Animasi yang muncul hanya untuk terlihat canggih justru membuat pembaca terganggu.\n\n## Yang kami terapkan\nBeberapa hal di atas sudah kami pakai di situs ini. Sebelumnya, setiap kartu memakai bayangan bawaan yang berbeda-beda, sehingga ada yang terlihat mengambang dan ada yang terlihat menempel.\n\nYang kami rapikan:\n- Satu arah cahaya untuk seluruh halaman, bukan tiap bagian punya arah sendiri.\n- Empat tingkat bayangan dengan arti yang jelas: menempel, terangkat, mengambang, dan melayang.\n- Bayangan diwarnai biru gelap, bukan hitam. Di atas latar kebiruan, bayangan hitam terbaca abu mati.\n- Semua gerakan mati otomatis kalau pengunjung mengaktifkan pengurangan gerakan di perangkatnya.\n\n## Yang tidak kami ikuti\nTren tahun ini juga membawa warna neon, tekstur berisik, dan tampilan yang sengaja kasar. Semuanya menarik untuk situs portofolio kreatif.\n\nKami tidak memakainya, dan itu keputusan sadar. Pengunjung situs ini adalah pengambil keputusan di instansi dan perusahaan, yang datang untuk menilai apakah pekerjaannya bisa dipercaya. Yang mereka butuhkan adalah keterbacaan, bukan kejutan visual.\n\nKedalaman kami pakai sebatas membuat tata letaknya terbaca: mana yang lembar, mana yang kartu, dan mana yang tombol. Selebihnya dibiarkan tenang.',
  6, false, ARRAY['desain web', 'tren 2026', 'UI UX', 'kedalaman', 'bayangan'], 'active',
  'Tren Desain Web 2026: Kedalaman dan Bayangan Berlapis',
  'Desain web 2026 kembali memakai kedalaman dan bayangan berlapis setelah era serba datar. Ini alasan di baliknya dan batas yang perlu dijaga.'
),

-- ── 5: KEBIASAN KERJA — kecepatan web ────────────────────────────────────────
(
  'Kenapa Kecepatan Situs Menentukan Apakah Pekerjaan Digital Anda Terpakai',
  'kecepatan-situs-menentukan-pekerjaan-digital',
  'Sistem yang lambat dibuka bukan hanya mengganggu, tetapi sering berhenti dipakai sama sekali. Ini cara kami menguji sebelum menyerahkan pekerjaan.',
  'proyek',
  'Tim SAYBA ARC',
  E'# Ada pola yang berulang di banyak pekerjaan digital: sistem yang lambat tidak ditinggalkan karena rusak, tetapi karena membuat pekerjaan jadi lebih repot daripada cara lama.\n\n## Yang biasanya terjadi\nSistem informasi baru diserahkan, pelatihan dijalankan, dan semua berjalan lancar di kantor pusat yang sambungannya cepat. Beberapa bulan kemudian, pemakaiannya turun.\n\nSaat ditelusuri, penyebabnya bukan fitur yang kurang, melainkan hal sederhana: halaman pertama butuh belasan detik untuk terbuka di kantor cabang. Petugas memilih kembali memakai berkas lembar kerja yang bisa dibuka seketika.\n\n## Angka yang kami pakai sebagai batas\nDari pengalaman lapangan, batas kenyamanan di perangkat biasa adalah sekitar tiga detik untuk halaman pertama terbuka. Di atas lima detik, pemakaian mulai turun. Di atas sepuluh detik, sistem cenderung ditinggalkan.\n\nBatas ini bukan angka resmi dari mana pun, tetapi cukup dekat dengan kenyataan di lapangan.\n\n## Sumber berat yang paling sering\nEmpat hal ini menyumbang sebagian besar berat halaman:\n\n1. **Data yang dimuat seluruhnya sekaligus.** Sistem yang memuat seluruh daftar di awal, padahal yang dilihat hanya sebagian.\n2. **Gambar yang tidak dikecilkan.** Foto hasil pemotretan langsung dipasang tanpa diperkecil lebih dulu.\n3. **Pustaka tambahan yang berlebihan.** Satu fitur kecil kadang menarik masuk pustaka besar yang seluruhnya ikut dimuat.\n4. **Permintaan ke server yang berlapis.** Satu halaman bisa memanggil server belasan kali, dan setiap panggilan menambah waktu tunggu.\n\n## Cara kami menguji sebelum serah terima\n- **Diuji di sambungan lambat, bukan hanya di kantor.** Kami turunkan kecepatan sambungan, lalu mengukur ulang.\n- **Diuji di HP kelas menengah, bukan hanya komputer kantor.** Banyak pengguna lapangan memakai perangkat yang sudah berumur beberapa tahun.\n- **Diukur pada pemakaian pertama, bukan yang kedua.** Setelah halaman pernah dibuka, sebagian isinya tersimpan di perangkat, sehingga pengukuran kedua selalu terlihat lebih cepat.\n- **Diuji dengan data yang banyak, bukan data contoh.** Sistem yang cepat dengan sepuluh baris data bisa tersendat dengan sepuluh ribu.\n\n## Yang kami rapikan lebih dulu\nUrutan perbaikannya sengaja dari yang paling murah:\n1. Perkecil gambar dan pakai format yang lebih ringan.\n2. Muat data sedikit demi sedikit, bukan sekaligus.\n3. Buang pustaka yang tidak benar-benar dipakai.\n4. Baru sentuh sisi server.\n\nUrutan ini penting karena tiga langkah pertama biasanya menyelesaikan sebagian besar masalah, dan tidak membutuhkan perubahan besar pada sistemnya.\n\n## Kenapa ini bagian dari pekerjaan, bukan tambahan\nSistem yang cepat dipakai setiap hari, dan sistem yang dipakai setiap hari akan berkembang karena penggunanya sendiri yang meminta perbaikan.\n\nSebaliknya, sistem yang lambat akan ditinggalkan, dan pekerjaan yang ditinggalkan tidak pernah dikembangkan. Uang yang dihabiskan untuk membangunnya berhenti memberi manfaat begitu pemakaiannya berhenti.\n\nKarena itu, kecepatan bukan hal yang diperiksa di akhir. Ia diperiksa di awal, dan diuji berulang kali selama pengerjaan.',
  6, false, ARRAY['kecepatan web', 'optimasi', 'sistem informasi', 'pengujian'], 'active',
  'Kecepatan Situs Menentukan Apakah Sistem Anda Dipakai',
  'Sistem yang lambat sering ditinggalkan bukan karena rusak, tetapi karena membuat pekerjaan lebih repot. Ini batas kecepatan yang kami pakai dan cara mengujinya.'
),

-- ── 6: KEBIASAN KERJA — data lapangan ────────────────────────────────────────
(
  'Empat dari Lima Proyek Pemetaan Terlambat Karena Satu Hal: Data Lapangan',
  'data-lapangan-penyebab-proyek-terlambat',
  'Keterlambatan proyek pemetaan jarang disebabkan alat yang kurang canggih. Yang paling sering terjadi adalah data lapangan yang baru diperiksa setelah peta selesai dibuat.',
  'proyek',
  'Tim SAYBA ARC',
  E'# Dari pekerjaan pemetaan yang kami tangani, penyebab keterlambatan yang paling sering muncul bukan alat, bukan juga kemampuan tim. Penyebabnya adalah data lapangan yang diperiksa terlalu telat.\n\n## Pola yang berulang\nAlurnya hampir selalu sama. Data diterima, pekerjaan langsung dimulai karena waktu yang sempit. Peta mulai terbentuk, dan baru terlihat ada yang aneh setelah sebagian besar pekerjaan selesai.\n\nTiga temuan yang paling sering muncul di tahap akhir:\n\n### 1. Sistem koordinat tidak sesuai\nData datang dalam koordinat geografis, padahal pekerjaan butuh koordinat terproyeksi. Ketika digabungkan dengan data lain, letaknya melenceng.\n\nMemperbaiki ini di awal memakan beberapa menit. Memperbaikinya setelah lima peta tematik tersusun memakan beberapa hari, karena setiap peta harus dihitung ulang.\n\n### 2. Titik pengukuran tidak konsisten\nIni yang paling merepotkan. Sebagian titik diukur dari patok yang jelas, sebagian dari perkiraan. Saat digabungkan, ada pergeseran yang tidak seragam, sehingga tidak bisa diperbaiki dengan satu koreksi saja.\n\nTanda awalnya: hasil pengukuran tidak membentuk bidang yang tertutup rapi, dan ada celah atau tumpang tindih yang tidak wajar.\n\n### 3. Atribut bercampur dalam satu kolom\nKolom yang seharusnya berisi satu keterangan ternyata berisi campuran. Ketika data dipakai untuk penggabungan, hasilnya kosong tanpa pesan kesalahan sama sekali.\n\n## Kenapa pemeriksaan awal sering dilewati\nAlasannya selalu terdengar masuk akal: waktu sempit, dan memeriksa data terasa seperti menunda pekerjaan yang sebenarnya.\n\nYang sering tidak dihitung: waktu untuk memperbaiki di akhir jauh lebih besar daripada waktu untuk memeriksa di awal. Selisihnya bukan satu dua jam, tetapi hari.\n\n## Urutan pemeriksaan yang kami pakai\nTiga hal ini selalu diperiksa sebelum pekerjaan dimulai:\n\n1. **Sistem koordinat.** Dibuka di perangkat lunak, dilihat bagian sumber datanya, bukan ditebak dari nama berkas.\n2. **Titik acuan.** Dicocokkan dengan titik yang bisa diverifikasi di lapangan atau citra.\n3. **Isi atribut.** Setiap kolom dibaca beberapa baris untuk memastikan isinya tidak bercampur.\n\nKetiganya memakan waktu paling lama satu jam untuk data yang ukurannya sedang.\n\n## Yang kami sarankan ke klien\nKirimkan data lebih awal, walaupun belum lengkap. Data yang belum lengkap tapi sudah diperiksa jauh lebih berguna daripada data yang lengkap tapi baru diperiksa di akhir.\n\nKalau ada keraguan tentang data yang tersedia, sampaikan sejak awal. Kami lebih memilih menunda satu hari di awal daripada menemukan masalahnya setelah peta selesai.',
  5, false, ARRAY['pemetaan', 'data lapangan', 'kualitas data', 'proyek'], 'active',
  'Data Lapangan Penyebab Utama Proyek Pemetaan Terlambat',
  'Keterlambatan proyek pemetaan paling sering bukan karena alat, tetapi data lapangan yang diperiksa terlalu telat. Ini pola yang berulang dan cara mencegahnya.'
)

on conflict (slug) do nothing;


-- ════════════════════════════════════════════════════════════════════════════
-- BAGIAN 3: SOROTAN BERANDA (opsional, aman dilewati)
-- ════════════════════════════════════════════════════════════════════════════
-- Tiga berita baru di atas ditandai `featured`, supaya muncul sebagai sorotan
-- di beranda dan di bagian atas halaman Berita.
--
-- Bagian ini HANYA berjalan kalau kolom `featured_order` sudah ada. Kalau
-- migrasi `migrasi-berita-featured-order.sql` belum dijalankan, seluruh blok
-- di bawah dilewati tanpa error — berita tetap tampil normal.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'berita'
      and column_name = 'featured_order'
  ) then
    -- Posisi sorotan 1, 2, 3 dipakai oleh tiga berita baru, urut dari yang
    -- paling penting. Berita lain yang sebelumnya memegang nomor ini
    -- dikosongkan dulu supaya tidak ada dua berita di posisi yang sama.
    update public.berita
      set featured_order = null
      where featured_order in (1, 2, 3);

    update public.berita set featured_order = 1
      where slug = 'peta-3d-standar-baru-2026';
    update public.berita set featured_order = 2
      where slug = 'satu-peta-2026-peluang-pemetaan-daerah';
    update public.berita set featured_order = 3
      where slug = 'bim-dan-ai-konstruksi-indonesia-2026';
  end if;
end $$;


-- ════════════════════════════════════════════════════════════════════════════
-- SELESAI. Periksa hasilnya.
-- ════════════════════════════════════════════════════════════════════════════

-- Ringkasan jumlah per kategori
select 'informasi' as tabel, category, count(*) as jumlah
from public.informasi
where status = 'active'
group by category
union all
select 'berita', category, count(*)
from public.berita
where status = 'active'
group by category
order by tabel, category;

-- Tujuh tulisan yang baru ditambahkan (5 informasi + 6 berita = 11 baris).
-- Kolom `published_at` terisi tanggal Anda menjalankan berkas ini.
select
  'informasi' as jenis,
  title,
  slug,
  published_at,
  read_minutes as menit
from public.informasi
where slug in (
  'menyiapkan-data-spasial-untuk-arcgis',
  'standar-layer-gambar-kerja-autocad',
  'memilih-format-berkas-data-spasial',
  'peta-2d-dan-3d-untuk-proyek',
  'ukuran-berkas-dan-kecepatan-peta-web'
)
union all
select
  'berita',
  title,
  slug,
  published_at,
  read_minutes
from public.berita
where slug in (
  'peta-3d-standar-baru-2026',
  'satu-peta-2026-peluang-pemetaan-daerah',
  'bim-dan-ai-konstruksi-indonesia-2026',
  'tren-desain-web-2026-kedalaman',
  'kecepatan-situs-menentukan-pekerjaan-digital',
  'data-lapangan-penyebab-proyek-terlambat'
)
order by jenis, published_at desc;
