// ============================================================
// SAYBA ARC — Berita & Artikel
// ------------------------------------------------------------
// Sumber data berbasis file. Tambah artikel dengan menyalin salah
// satu objek di bawah lalu ubah isinya (slug harus unik).
// Gambar diletakkan di /public/berita/ (rasio 8:5, mis. 800x500 px).
// ============================================================

export interface NewsCategory {
  /** dipakai di filter */
  slug: string
  label: string
  color: string
}

export interface NewsArticle {
  slug: string
  title: string
  excerpt: string
  category: string
  image: string
  author: string
  /** ISO date — YYYY-MM-DD */
  date: string
  /** perkiraan waktu baca dalam menit */
  readMinutes: number
  views: number
  featured?: boolean
  tags?: string[]
  /** paragraf & sub-judul; awali dengan "## " untuk sub-judul */
  body: string[]
}

export const newsCategories: NewsCategory[] = [
  { slug: "semua", label: "Semua", color: "#ff914d" },
  { slug: "gis", label: "GIS & Pemetaan", color: "#ff914d" },
  { slug: "teknologi", label: "Teknologi", color: "#0a6e8a" },
  { slug: "proyek", label: "Cerita Proyek", color: "#7c5cff" },
  { slug: "engineering", label: "Engineering", color: "#111111" },
  { slug: "perusahaan", label: "Kabar Perusahaan", color: "#1f9d55" },
]

export const newsArticles: NewsArticle[] = [
  {
    slug: "pemetaan-partisipatif-desa-kalbar",
    title: "Pemetaan Partisipatif Desa di Kalimantan Barat: Dari Sketsa Warga ke Peta Digital",
    excerpt:
      "Bagaimana data lapangan yang dikumpulkan bersama warga desa diubah menjadi basis data spasial yang siap dipakai untuk perencanaan tata ruang.",
    category: "gis",
    image: "/berita/berita-featured-1200x675.png",
    author: "Tim GIS SAYBA ARC",
    date: "2026-09-05",
    readMinutes: 6,
    views: 412,
    featured: true,
    tags: ["ArcGIS", "Survei Lapangan", "Tata Ruang"],
    body: [
      "Pemetaan partisipatif menempatkan warga sebagai sumber data utama. Alih-alih memulai dari citra satelit, tim kami memulai dari sketsa dan cerita warga tentang batas kebun, jalur sungai, dan area rawan banjir.",
      "## Kenapa data warga penting",
      "Citra satelit memberi geometri, tetapi tidak memberi konteks. Batas administratif di lapangan sering berbeda dengan dokumen, dan hanya warga yang tahu riwayatnya. Menggabungkan keduanya menghasilkan peta yang tidak sekadar akurat secara koordinat, tetapi juga diterima secara sosial.",
      "## Alur kerja yang kami pakai",
      "Sketsa warga difoto dan digeoreferensi, lalu titik-titik penting diverifikasi dengan GPS genggam. Hasilnya masuk ke geodatabase dengan skema atribut yang konsisten sehingga bisa dipakai lintas dinas tanpa konversi ulang.",
      "Tahap terakhir adalah kartografi: simbologi disederhanakan agar peta tetap terbaca saat dicetak A3 hitam-putih di kantor desa — kondisi nyata yang sering dilupakan saat mendesain peta di layar.",
      "## Yang kami pelajari",
      "Validasi berulang di lapangan lebih murah daripada memperbaiki peta setelah dipakai untuk pengambilan keputusan. Sisihkan waktu untuk satu putaran verifikasi tambahan sebelum peta difinalisasi.",
    ],
  },
  {
    slug: "webgis-ringan-untuk-instansi",
    title: "Membangun WebGIS yang Ringan untuk Instansi dengan Koneksi Terbatas",
    excerpt:
      "Teknik memangkas ukuran layer, caching tile, dan penyederhanaan geometri agar WebGIS tetap responsif di jaringan lambat.",
    category: "teknologi",
    image: "/berita/berita-1-800x500.png",
    author: "Tim Web SAYBA ARC",
    date: "2026-08-28",
    readMinutes: 5,
    views: 288,
    tags: ["WebGIS", "Performa", "Leaflet"],
    body: [
      "Banyak WebGIS gagal dipakai bukan karena datanya salah, tetapi karena terlalu berat dibuka dari kantor kecamatan. Optimasi harus jadi bagian desain, bukan tambalan di akhir.",
      "## Sederhanakan geometri lebih dulu",
      "Poligon hasil digitasi skala besar sering menyimpan ribuan vertex yang tidak terlihat pada skala tampil. Penyederhanaan bertingkat sesuai level zoom memangkas ukuran payload secara drastis tanpa perubahan visual.",
      "## Pisahkan data statis dan dinamis",
      "Layer dasar yang jarang berubah sebaiknya disajikan sebagai tile yang bisa di-cache lama. Hanya layer yang benar-benar berubah yang diambil langsung dari database.",
      "## Ukur dengan kondisi nyata",
      "Uji aplikasi dengan pembatasan jaringan, bukan di kantor dengan fiber. Target yang kami pakai: peta pertama tampil di bawah tiga detik pada koneksi 3G.",
    ],
  },
  {
    slug: "standar-penamaan-layer-geodatabase",
    title: "Standar Penamaan Layer yang Menyelamatkan Proyek Geodatabase Anda",
    excerpt:
      "Konvensi penamaan yang konsisten membuat serah terima proyek jauh lebih mudah dan mengurangi risiko salah pakai data.",
    category: "gis",
    image: "/berita/berita-2-800x500.png",
    author: "Tim GIS SAYBA ARC",
    date: "2026-08-20",
    readMinutes: 4,
    views: 197,
    tags: ["Geodatabase", "Standar Data"],
    body: [
      "Nama layer seperti final_fix_2_revisi adalah tanda bahaya. Saat proyek berpindah tangan, penamaan yang tidak konsisten menjadi sumber kesalahan paling mahal.",
      "## Pola yang kami pakai",
      "Kami memakai pola tema_wilayah_tahun_skala, seluruhnya huruf kecil tanpa spasi. Pola ini bisa diurutkan, bisa dicari, dan langsung menjelaskan isi tanpa membuka atribut.",
      "## Versi disimpan di metadata, bukan di nama",
      "Riwayat revisi masuk ke metadata dan catatan perubahan. Nama file tetap stabil sehingga tautan di peta, skrip, dan dokumen tidak putus setiap kali ada revisi.",
    ],
  },
  {
    slug: "cerita-proyek-dashboard-monitoring",
    title: "Cerita Proyek: Dashboard Monitoring Aset dalam Tiga Minggu",
    excerpt:
      "Dari kebutuhan yang belum jelas sampai dashboard yang dipakai harian — catatan proses, kompromi, dan hasilnya.",
    category: "proyek",
    image: "/berita/berita-3-800x500.png",
    author: "Tim SAYBA ARC",
    date: "2026-08-12",
    readMinutes: 7,
    views: 356,
    tags: ["Dashboard", "Studi Kasus"],
    body: [
      "Klien datang dengan permintaan singkat: ingin melihat kondisi aset di lapangan tanpa harus membuka file Excel satu per satu. Kebutuhan detailnya belum terdefinisi.",
      "## Minggu pertama: menyamakan definisi",
      "Sebagian besar waktu habis untuk menyepakati arti satu kata: aktif. Setelah definisi disepakati, sisa pekerjaan menjadi jauh lebih cepat.",
      "## Minggu kedua: prototipe yang bisa diklik",
      "Kami membangun prototipe dengan data contoh agar klien bisa mencoba alurnya lebih awal. Dua permintaan besar berubah di tahap ini — jauh lebih murah daripada berubah setelah sistem jadi.",
      "## Minggu ketiga: integrasi dan serah terima",
      "Data asli masuk, hak akses diatur per unit kerja, dan tim klien dilatih setengah hari. Dashboard dipakai rutin sejak minggu pertama setelah serah terima.",
    ],
  },
  {
    slug: "checklist-gambar-teknik",
    title: "Checklist Sebelum Mengirim Gambar Teknik ke Klien",
    excerpt:
      "Sepuluh pemeriksaan cepat yang mencegah revisi berulang: layer, skala, dimensi, dan konsistensi kop gambar.",
    category: "engineering",
    image: "/berita/berita-4-800x500.png",
    author: "Tim Engineering SAYBA ARC",
    date: "2026-08-04",
    readMinutes: 4,
    views: 163,
    tags: ["AutoCAD", "QA", "Drafting"],
    body: [
      "Sebagian besar revisi gambar teknik bukan soal desain, melainkan soal kerapian penyajian. Checklist singkat sebelum kirim menghemat berhari-hari bolak-balik.",
      "## Pemeriksaan wajib",
      "Pastikan seluruh objek berada di layer yang benar, tidak ada objek di layer 0. Periksa skala viewport, ketebalan garis saat plot, dan bahwa seluruh dimensi terhubung ke geometri (associative), bukan teks manual.",
      "## Kop gambar dan revisi",
      "Nomor gambar, tanggal, dan kode revisi harus konsisten di semua lembar. Satu lembar dengan revisi tertinggal cukup untuk membuat seluruh paket dipertanyakan.",
      "## Kirim PDF beserta file sumber",
      "PDF memastikan tampilan yang Anda maksud, file sumber memastikan klien bisa melanjutkan. Kirim keduanya, selalu.",
    ],
  },
  {
    slug: "sayba-arc-buka-layanan-machine-learning",
    title: "SAYBA ARC Membuka Layanan Analitik Data & Machine Learning",
    excerpt:
      "Lini layanan baru untuk klasifikasi citra, prediksi berbasis data spasial, dan otomasi pengolahan data rutin.",
    category: "perusahaan",
    image: "/berita/berita-5-800x500.png",
    author: "Redaksi SAYBA ARC",
    date: "2026-07-25",
    readMinutes: 3,
    views: 521,
    tags: ["Pengumuman", "Machine Learning"],
    body: [
      "Mulai kuartal ini SAYBA ARC resmi menawarkan layanan analitik data dan machine learning sebagai lini tersendiri, melengkapi layanan GIS, pengembangan web, dan rancang teknik.",
      "## Cakupan layanan",
      "Klasifikasi tutupan lahan dari citra, deteksi perubahan antarwaktu, model prediktif berbasis data spasial, serta otomasi pengolahan data yang selama ini dikerjakan manual.",
      "## Cara memulai",
      "Kami menyediakan sesi konsultasi awal untuk menilai kesiapan data sebelum proyek dimulai. Hubungi kami melalui halaman kontak untuk menjadwalkan.",
    ],
  },
  {
    slug: "memilih-sistem-koordinat-indonesia",
    title: "Memilih Sistem Koordinat yang Tepat untuk Proyek di Indonesia",
    excerpt:
      "Panduan praktis memilih antara WGS 84, UTM zona yang sesuai, dan DGN95 agar perhitungan luas tetap akurat.",
    category: "gis",
    image: "/berita/berita-6-800x500.png",
    author: "Tim GIS SAYBA ARC",
    date: "2026-07-15",
    readMinutes: 5,
    views: 274,
    tags: ["Sistem Koordinat", "UTM", "Kartografi"],
    body: [
      "Salah memilih sistem koordinat adalah kesalahan yang sunyi: peta tetap tampak benar, tetapi angka luas dan jaraknya keliru.",
      "## Geografis untuk penyimpanan, proyeksi untuk pengukuran",
      "Simpan data dalam koordinat geografis agar mudah dipertukarkan, lalu proyeksikan ke UTM zona yang sesuai saat menghitung luas atau jarak.",
      "## Perhatikan batas zona",
      "Wilayah Indonesia melintasi banyak zona UTM. Untuk area yang melewati batas zona, gunakan proyeksi setara-luas nasional agar hasil perhitungan konsisten.",
      "## Catat di metadata",
      "Selalu tuliskan sistem koordinat dan datum di metadata. Ini pemeriksaan pertama yang dilakukan siapa pun yang menerima data Anda.",
    ],
  },
]

// ── Helper ──────────────────────────────────────────────────────

export function getFeaturedArticle(): NewsArticle {
  return newsArticles.find((a) => a.featured) ?? newsArticles[0]
}

export function getArticleBySlug(slug: string): NewsArticle | undefined {
  return newsArticles.find((a) => a.slug === slug)
}

export function getRelatedArticles(article: NewsArticle, limit = 3): NewsArticle[] {
  const sameCategory = newsArticles.filter((a) => a.slug !== article.slug && a.category === article.category)
  const rest = newsArticles.filter((a) => a.slug !== article.slug && a.category !== article.category)
  return [...sameCategory, ...rest].slice(0, limit)
}

export function getCategory(slug: string): NewsCategory | undefined {
  return newsCategories.find((c) => c.slug === slug)
}

export function getCategoryLabel(slug: string): string {
  return getCategory(slug)?.label ?? slug
}

export function getCategoryColor(slug: string): string {
  return getCategory(slug)?.color ?? "#ff914d"
}

export function formatNewsDate(iso: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

/** Artikel terbaru lebih dulu */
export function sortedArticles(): NewsArticle[] {
  return [...newsArticles].sort((a, b) => b.date.localeCompare(a.date))
}
