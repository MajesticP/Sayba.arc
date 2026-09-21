// ============================================================
// SAYBA ARC — Konten Situs (Bahasa Indonesia)
// Palet & arah visual: lihat DESIGN.md
// ============================================================

export const siteConfig = {
  name: "SAYBA ARC",
  tagline: "Konsultan IT & Engineering — Pontianak",
  description:
    "SAYBA ARC adalah konsultan IT dan engineering dari Pontianak. Kami mengerjakan pengembangan perangkat lunak, pemetaan spasial, dan dokumen teknik untuk bisnis dan instansi di Indonesia.",
  url: "https://sayba.id",
  logoText: "SAYBA ARC",
  logoLink: "/",
  email: "sayba.help@gmail.com",
  phone: "+62 877-2191-6495",
  address: "Pontianak, Kalimantan Barat, Indonesia",
}

// ── Legalitas usaha ─────────────────────────────────────────────
// Ditampilkan di footer. Angka di sini adalah pernyataan resmi yang terbaca
// publik — pastikan cocok dengan dokumen NIB Anda sebelum diubah.
// Kolom yang dikosongkan otomatis tidak ditampilkan.
//
// CATATAN: kode KBLI perlu diverifikasi ulang ke NIB/OSS. Kode 60390
// terdaftar sebagai "Aktivitas Situs Jejaring Sosial dan Distribusi Konten
// Lainnya", sementara lingkup usaha di situs ini adalah konsultansi IT dan
// engineering. Tampilkan kode yang benar agar tidak menimbulkan pertanyaan
// saat due diligence.
export const legalitas = {
  namaUsaha: "SAYBA ARC",
  bentukUsaha: "Usaha Mikro",
  nib: "6105010402050002",
  kbli: "",
  kbliVersi: "",
  ossLogo: "/oss-logo.png",
  ossLabel: "Terdaftar melalui OSS",
}

// Gambar pratinjau saat tautan dibagikan (WhatsApp, Facebook, X, LinkedIn).
//
// CATATAN PENTING: metadata halaman di Next.js menimpa objek `openGraph`
// milik layout secara utuh, bukan menggabungkannya. Jadi setiap halaman yang
// mendefinisikan openGraph HARUS ikut menyertakan `images: [ogImage]`.
export const ogImage = {
  url: "https://sayba.id/og-image.png",
  width: 1200,
  height: 630,
  alt: "SAYBA ARC — Konsultan IT & Engineering",
}

export const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/services" },
  { label: "Informasi", href: "/informasi" },
  { label: "Portofolio", href: "/portfolio" },
  { label: "Berita", href: "/berita" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Kontak", href: "/contact" },
]

export const hero = {
  title: "Konsultan IT & Engineering untuk Kebutuhan Teknis Anda",
  subtitle:
    "Dua bidang, satu tim. Kami mengerjakan pengembangan perangkat lunak dan sistem informasi, sekaligus pemetaan spasial dan dokumen rancang bangun. Dikerjakan langsung oleh tim kami di Pontianak.",
  primaryButton: { text: "Lihat Layanan", href: "/services" },
  secondaryButton: { text: "Diskusikan Kebutuhan", href: "/contact" },
  badge: "Pontianak, Kalimantan Barat",
}

// Keunggulan ini harus bisa dibuktikan. Jangan tambah klaim tanpa bukti.
export const features = [
  {
    icon: "users",
    title: "Dua Bidang, Satu Tim",
    description:
      "Pekerjaan IT dan engineering ditangani tim yang sama, jadi Anda tidak perlu mengoordinasi dua vendor terpisah.",
  },
  {
    icon: "map-pin",
    title: "Paham Konteks Lapangan",
    description:
      "Berbasis di Pontianak sejak 2025. Kami tahu kondisi lapangan Kalimantan: akses, regulasi daerah, dan kualitas koneksi di lokasi kerja.",
  },
  {
    icon: "file-text",
    title: "Serah Terima Berkas Sumber",
    description:
      "Deliverable diserahkan lengkap dengan file sumbernya: DWG/DXF, SHP/GDB, atau repositori kode. Bukan hanya hasil akhir.",
  },
  {
    icon: "refresh-cw",
    title: "Progres Terbuka",
    description:
      "Laporan berkala dengan milestone yang jelas. Anda tahu pekerjaan sudah sampai mana tanpa harus menanyakan.",
  },
  {
    icon: "cpu",
    title: "Perkakas yang Relevan",
    description:
      "Next.js, Python, PostgreSQL, ArcGIS, dan AutoCAD. Kami pilih berdasarkan kebutuhan proyek, bukan karena sedang tren.",
  },
  {
    icon: "shield",
    title: "Revisi Sesuai Kesepakatan",
    description:
      "Jumlah siklus revisi dan masa garansi tertulis di KAK sejak awal, jadi tidak ada kejutan di tengah jalan.",
  },
]

export const about = {
  title: "Dua Departemen, Satu Standar Kerja",
  description:
    "SAYBA ARC berdiri di Pontianak pada 2025. Kami membagi pekerjaan ke dua departemen — IT Consultant dan Engineering Consultant — supaya keahlian tiap bidang tetap tajam, sementara klien cukup berurusan dengan satu tim. Setiap proyek punya penanggung jawab yang bisa Anda hubungi langsung.",
  stats: [
    { value: "2025", label: "Tahun Berdiri" },
    { value: "2", label: "Departemen" },
    { value: "1", label: "Titik Kontak per Proyek" },
    { value: "100%", label: "Berkas Sumber Diserahkan" },
  ],
  buttonText: "Kenali Tim Kami",
  buttonHref: "/about",
}

export const cta = {
  title: "Ada Pekerjaan Teknis yang Sedang Direncanakan?",
  subtitle:
    "Ceritakan lingkupnya lewat WhatsApp atau email. Kami akan bantu petakan kebutuhan datanya dan langkah pertama yang perlu disiapkan.",
  buttonText: "Mulai Diskusi",
  buttonHref: "/contact",
}

export const footerLinks = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/services" },
  { label: "Informasi", href: "/informasi" },
  { label: "Portofolio", href: "/portfolio" },
  { label: "Berita", href: "/berita" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Kontak", href: "/contact" },
]

export const socialLinks = [
  { name: "Instagram", icon: "instagram", href: "https://instagram.com/sayba.arc" },
  { name: "LinkedIn", icon: "linkedin", href: "https://linkedin.com/company/sayba-arc" },
  { name: "WhatsApp", icon: "whatsapp", href: "https://wa.me/6287721916495" },
  { name: "GitHub", icon: "github", href: "https://github.com/sayba-arc" },
]

export const servicesPage = {
  title: "Layanan Kami",
  subtitle:
    "Dua departemen dengan lingkup kerja yang jelas. Pilih bidang yang Anda butuhkan, atau diskusikan kalau pekerjaannya mencakup keduanya.",
}

export const aboutPage = {
  hero: {
    title: "Tentang SAYBA ARC",
    subtitle:
      "Konsultan IT dan engineering dari Pontianak yang bekerja untuk bisnis dan instansi di Kalimantan Barat.",
  },
  mission:
    "Mengerjakan pekerjaan teknis dengan standar yang bisa diperiksa: lingkup jelas di awal, progres terbuka selama pengerjaan, dan berkas sumber diserahkan di akhir.",
  vision:
    "Menjadi konsultan IT dan engineering yang bisa diandalkan di Kalimantan Barat, dikenal dari hasil pekerjaan bukan dari klaim.",
}

export const contactPage = {
  title: "Hubungi Kami",
  subtitle:
    "Sampaikan lingkup pekerjaan yang Anda rencanakan. Kami balas lewat WhatsApp atau email dengan langkah selanjutnya.",
  info: [
    { icon: "mail", label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: "phone", label: "Telepon / WhatsApp", value: siteConfig.phone, href: `https://wa.me/6287721916495` },
    {
      icon: "map-pin",
      label: "Lokasi",
      value: siteConfig.address,
      href: "https://www.openstreetmap.org/search?query=Pontianak%2C%20Kalimantan%20Barat",
    },
  ],
  whatsappLink:
    "https://wa.me/6287721916495?text=Halo%20SAYBA%20ARC%2C%20saya%20ingin%20mendiskusikan%20pekerjaan%20teknis.%0ALingkup%3A%20%0A%3E%20Sayba%20Arc",
}
