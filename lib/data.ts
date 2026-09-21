// ============================================================
// SAYBA ARC — Konten Situs (Bahasa Indonesia)
// ============================================================

export const siteConfig = {
  name: "SAYBA ARC",
  tagline: "Art You Believe — Agensi Digital & Engineering dari Pontianak",
  description:
    "SAYBA ARC adalah agensi multidisiplin dari Pontianak yang menghadirkan solusi digital, rekayasa teknis, dan engineering untuk bisnis dan instansi di Indonesia.",
  url: "https://sayba.id",
  logoText: "SAYBA ARC",
  logoLink: "/",
  email: "sayba.help@gmail.com",
  phone: "+62 877-2191-6495",
  address: "Pontianak, Kalimantan Barat, Indonesia",
}

// ── Legalitas usaha ─────────────────────────────────────────────
// Ditampilkan di footer. Angka-angka di sini adalah pernyataan resmi yang
// terbaca publik — pastikan cocok dengan dokumen NIB Anda sebelum diubah.
// Kolom yang dikosongkan otomatis tidak ditampilkan.
export const legalitas = {
  namaUsaha: "SAYBA ARC",
  bentukUsaha: "Usaha Mikro",
  nib: "6105010402050002",
  kbli: "60390",
  kbliVersi: "KBLI 2025",
  /** Ganti berkas di /public/oss-logo.png dengan lambang resmi OSS */
  ossLogo: "/oss-logo.png",
  ossLabel: "Terdaftar melalui OSS",
}

// Gambar pratinjau saat tautan dibagikan (WhatsApp, Facebook, X, LinkedIn).
// Dibuat dari logo SAYBA ARC pada rasio 1200x630 yang dianjurkan.
//
// CATATAN PENTING: metadata halaman di Next.js menimpa objek `openGraph`
// milik layout secara utuh, bukan menggabungkannya. Jadi setiap halaman yang
// mendefinisikan openGraph HARUS ikut menyertakan `images: [ogImage]`, kalau
// tidak gambar pratinjaunya hilang sama sekali.
export const ogImage = {
  url: "https://sayba.id/og-image.png",
  width: 1200,
  height: 630,
  alt: "SAYBA ARC — Art You Believe",
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
  title: "Solusi Cerdas Engineering & IT",
  subtitle:
    "Membangun Masa Depan Anda. Kami menyediakan layanan komprehensif mulai dari Desain Rancang Bangun, Pemetaan Canggih, hingga Inovasi Website, Aplikasi, dan Machine Learning.",
  primaryButton: { text: "Jelajahi Layanan Kami", href: "/services" },
  secondaryButton: { text: "Lihat Portofolio", href: "/portfolio" },
  badge: "Inovasi Engineering & IT Terdepan",
}

export const features = [
  {
    icon: "zap",
    title: "Eksekusi End-to-End",
    description:
      "Dari analisis kebutuhan hingga serah terima — semua dikerjakan dalam satu tim tanpa hand-off yang membuang waktu Anda.",
  },
  {
    icon: "map-pin",
    title: "Konteks Lokal yang Kuat",
    description:
      "Kami paham kondisi lapangan di Kalimantan dan Indonesia — regulasi, standar lokal, hingga tantangan konektivitas di lapangan.",
  },
  {
    icon: "refresh-cw",
    title: "Agile & Transparan",
    description:
      "Sprint pendek, laporan berkala, komunikasi terbuka. Anda tahu persis perkembangan proyek di setiap tahap.",
  },
  {
    icon: "cpu",
    title: "Stack Teknologi Terkini",
    description:
      "Next.js, Python, ArcGIS, AutoCAD, ML frameworks modern — kami pakai yang relevan dan terawat, bukan teknologi warisan.",
  },
  {
    icon: "users",
    title: "Kolaborasi Nyata",
    description:
      "Kami bekerja bersama Anda, bukan hanya untuk Anda. Masukan klien adalah bagian dari proses, bukan gangguan.",
  },
  {
    icon: "shield",
    title: "Hasil yang Bisa Ditunjukkan",
    description:
      "Kami tidak overpromise. Setiap deliverable dirancang agar bisa langsung dipakai, ditunjukkan ke stakeholder, atau di-deploy.",
  },
]

export const about = {
  title: "Satu Tim. Dua Pilar Keahlian.",
  description:
    "SAYBA ARC adalah konsultan dari Pontianak yang berfokus pada dua bidang utama. Engineering Consultant yang menangani Desain Rancang Bangun, Pemetaan Spasial, dan perancangan 2D/3D. Serta IT Consultant yang membangun Website modern, Aplikasi Mobile/Desktop, hingga pengembangan Machine Learning. Semua dikerjakan oleh tim profesional kami.",
  stats: [
    { value: "50+", label: "Proyek Selesai" },
    { value: "2025", label: "Tahun Berdiri" },
    { value: "100%", label: "Komitmen Kualitas" },
    { value: "1", label: "Tim, Banyak Solusi" },
  ],
  buttonText: "Kenali Tim Kami",
  buttonHref: "/about",
}

export const cta = {
  title: "Punya Proyek yang Ingin Dikerjakan?",
  subtitle:
    "Apapun kebutuhannya — peta, aplikasi, data, atau desain — ceritakan ke kami dan kita cari solusinya bersama.",
  buttonText: "Hubungi Kami",
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
    "Setiap layanan dirancang untuk menyelesaikan masalah nyata — bukan sekadar daftar fitur yang terdengar keren.",
}

export const aboutPage = {
  hero: {
    title: "Tentang SAYBA ARC",
    subtitle: "Inovator teknologi digital dan engineering yang mendedikasikan keahlian lintas disiplin untuk menghasilkan solusi nyata, tepat sasaran, dan berkelanjutan.",
  },
  mission:
    "Memberikan layanan terintegrasi berkualitas tinggi melalui pendekatan agile, mengadopsi teknologi terdepan, dan memprioritaskan transparansi serta kepuasan mitra kami pada setiap tahap pengerjaan.",
  vision:
    "Menjadi pionir agensi digital dan rekayasa teknik di Indonesia yang senantiasa diandalkan untuk mengubah tantangan kompleks menjadi sistem yang intuitif, andal, dan berdampak.",
}

export const contactPage = {
  title: "Hubungi Kami",
  subtitle:
    "Punya proyek yang ingin dikerjakan atau sekadar ingin mengeksplorasi kemungkinan? Kami senang mendengar dari Anda.",
  info: [
    { icon: "mail", label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: "phone", label: "Telepon / WhatsApp", value: siteConfig.phone, href: `https://wa.me/6287721916495` },
    { icon: "map-pin", label: "Lokasi", value: siteConfig.address, href: "#" },
  ],
  whatsappLink:
    "https://wa.me/6287721916495?text=Halo%20Saya%20Tertarik%20Pada%20%5Bjenis%20produk/jasa%5D%20%5BJasa%20nya%20mis%20:%20Autocad%203D%5D%20%0A%3E%20Sayba%20Arc",
}
