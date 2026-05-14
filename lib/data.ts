// ============================================================
// SAYBA ARC — Konten Situs (Bahasa Indonesia)
// ============================================================

export const siteConfig = {
  name: "SAYBA ARC",
  tagline: "Teknik Lingkungan · Teknologi Digital · Teknik Kelautan",
  description:
    "SAYBA ARC adalah agensi multidisiplin dari Pontianak yang menghadirkan layanan pemetaan lingkungan berbasis ArcGIS, pengembangan web & mobile, machine learning, data science, serta gambar teknik kapal dengan AutoCAD.",
  url: "https://sayba.web.id",
  logoText: "SAYBA ARC",
  logoLink: "/",
  email: "sayba.help@gmail.com",
  phone: "+62 877-2191-6495",
  address: "Pontianak, Kalimantan Barat, Indonesia",
}

export const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/services" },
  { label: "Portofolio", href: "/portfolio" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Kontak", href: "/contact" },
]

export const hero = {
  SAYBA ARC.",
  subtitle:
    "SAYBA ARC adalah agensi digital dan engineering yang berfokus pada pengembangan solusi inovatif untuk mendukung kebutuhan bisnis dan proyek teknis di Indonesia. Kami menggabungkan teknologi modern dengan keahlian teknik untuk menghasilkan solusi yang tidak hanya fungsional, tetapi juga efisien dan berkelanjutan. Di era transformasi digital yang terus berkembang, SAYBA ARC hadir sebagai mitra strategis yang membantu klien dalam membangun sistem digital, meningkatkan efisiensi operasional, serta mengoptimalkan potensi bisnis melalui pendekatan berbasis teknologi dan data.",
  primaryButton: { text: "Jelajahi Layanan Kami", href: "/services" },
  secondaryButton: { text: "Lihat Portofolio", href: "/portfolio" },
  badge: "Lebih Dari 5 Departemen Spesialis",
}

export const arcgisDepartment = {
  id: "environmental",
  label: "Departemen Teknik Lingkungan",
  title: "Pemetaan & Analisis Lingkungan",
  subtitle:
    "Layanan GIS dan pemetaan berbasis ArcGIS untuk kebutuhan analisis lingkungan, tata ruang, dan pengelolaan sumber daya alam.",
  services: [
    {
      icon: "map",
      title: "Pemetaan ArcGIS",
      description:
        "Pembuatan peta tematik, peta dasar, dan peta analisis menggunakan ArcGIS — mulai dari pengolahan data vektor dan raster hingga layout peta siap cetak.",
      href: "/services/arcgis-mapping",
    },
    {
      icon: "layers",
      title: "Analisis Spasial Lingkungan",
      description:
        "Analisis keruangan untuk kajian dampak lingkungan (AMDAL), kesesuaian lahan, rawan bencana, dan perencanaan tata ruang berbasis data geografis.",
      href: "/services/spatial-analysis",
    },
    {
      icon: "satellite",
      title: "Penginderaan Jauh & Citra Satelit",
      description:
        "Pengolahan citra satelit (Landsat, Sentinel, SPOT) untuk pemetaan tutupan lahan, perubahan penggunaan lahan, dan monitoring lingkungan dari udara.",
      href: "/services/remote-sensing",
    },
    {
      icon: "database",
      title: "Manajemen Data Geospasial",
      description:
        "Pengorganisasian, pembersihan, dan pengelolaan geodatabase — memastikan data spasial Anda terstruktur, konsisten, dan siap dianalisis kapan saja.",
      href: "/services/geodata-management",
    },
    {
      icon: "globe",
      title: "Web GIS & Peta Interaktif",
      description:
        "Membangun platform peta interaktif berbasis web menggunakan Leaflet dan ArcGIS Online sehingga data lingkungan Anda bisa diakses dan dipahami semua pihak.",
      href: "/services/web-gis",
    },
    {
      icon: "smartphone",
      title: "Pengumpulan Data Lapangan",
      description:
        "Pendampingan survei lapangan menggunakan tools digital — dari desain form hingga sinkronisasi data GPS — untuk mempercepat proses inventarisasi lingkungan.",
      href: "/services/field-data",
    },
  ],
}

export const itDepartment = {
  id: "it",
  label: "Departemen IT & Digital",
  title: "Pengembangan Digital & Kecerdasan Data",
  subtitle:
    "Dari web dan mobile hingga machine learning dan data science — solusi digital end-to-end untuk kebutuhan modern organisasi Anda.",
  services: [
    {
      icon: "code",
      title: "Pengembangan Web",
      description:
        "Aplikasi web full-stack menggunakan Next.js, React, dan Node.js — dari landing page yang cepat hingga sistem informasi berbasis browser yang kompleks.",
      href: "/services/web-development",
    },
    {
      icon: "smartphone",
      title: "Pengembangan Mobile App",
      description:
        "Aplikasi mobile Android dan iOS menggunakan React Native atau Flutter — performa native, satu codebase, siap produksi.",
      href: "/services/mobile-development",
    },
    {
      icon: "cpu",
      title: "Machine Learning Engineering",
      description:
        "Membangun, melatih, dan mendeploy model ML — klasifikasi, regresi, deteksi objek, forecasting — dari eksperimen di notebook hingga API siap pakai.",
      href: "/services/ml-engineering",
    },
    {
      icon: "bar-chart-2",
      title: "Data Science & Analitik",
      description:
        "Eksplorasi data, visualisasi, pemodelan statistik, dan pelaporan berbasis data — membantu organisasi Anda membuat keputusan dari angka, bukan asumsi.",
      href: "/services/data-science",
    },
    {
      icon: "monitor",
      title: "Sistem Informasi",
      description:
        "Pembangunan sistem informasi manajemen (SIM), dashboard admin, dan portal internal yang disesuaikan dengan alur kerja dan kebutuhan spesifik organisasi Anda.",
      href: "/services/information-systems",
    },
    {
      icon: "layout",
      title: "Desain UI/UX",
      description:
        "Desain antarmuka yang bersih, intuitif, dan berorientasi pengguna — dari wireframe dan prototipe hingga design system yang konsisten untuk produk Anda.",
      href: "/services/ui-ux",
    },
  ],
}

export const oceanicDepartment = {
  id: "oceanic",
  label: "Departemen Teknik Kelautan",
  title: "Desain & Gambar Teknik Kapal",
  subtitle:
    "Gambar teknik kapal 2D dengan AutoCAD — dari desain lambung dan rencana garis hingga gambar konstruksi dan tata letak akomodasi.",
  services: [
    {
      icon: "anchor",
      title: "Desain Lambung Kapal 2D",
      description:
        "Gambar desain lambung kapal 2D menggunakan AutoCAD — mencakup penampang melintang, profil samping, dan denah atas sesuai spesifikasi teknis yang diminta.",
      href: "/services/hull-design",
    },
    {
      icon: "navigation",
      title: "Rencana Garis (Lines Plan)",
      description:
        "Pembuatan lines plan kapal yang presisi — body plan, sheer plan, dan half breadth plan — sebagai dasar perhitungan hidrostatik dan stabilitas.",
      href: "/services/lines-plan",
    },
    {
      icon: "file-text",
      title: "Gambar Konstruksi Kapal",
      description:
        "Gambar teknik konstruksi kapal 2D meliputi midship section, wrang, gading-gading, dan elemen struktural lainnya sesuai standar klasifikasi.",
      href: "/services/construction-drawing",
    },
    {
      icon: "grid",
      title: "General Arrangement",
      description:
        "Gambar tata letak umum kapal (General Arrangement) — penempatan ruang, dek, dan fasilitas secara keseluruhan dalam format AutoCAD siap kirim.",
      href: "/services/general-arrangement",
    },
    {
      icon: "home",
      title: "Tata Letak Akomodasi",
      description:
        "Desain dan gambar teknik tata letak ruang akomodasi kapal — kabin, ruang mesin, ruang kemudi, dan area publik sesuai kebutuhan operasional.",
      href: "/services/accommodation-layout",
    },
    {
      icon: "settings",
      title: "Gambar Outfitting & Sistem",
      description:
        "Gambar teknik sistem pendukung kapal — pipa, ventilasi, tambat, dan perlengkapan dek — dalam format 2D AutoCAD yang terstruktur dan mudah dibaca.",
      href: "/services/outfitting",
    },
  ],
}

export const services = [...arcgisDepartment.services, ...itDepartment.services, ...oceanicDepartment.services]

export const features = [
  {
    icon: "layers",
    title: "Tim Tiga Disiplin Ilmu",
    description:
      "Satu agensi dengan tiga keahlian nyata — Teknik Lingkungan, Teknologi Digital, dan Teknik Kelautan. Tidak perlu koordinasi antar vendor yang menyulitkan.",
  },
  {
    icon: "zap",
    title: "Pengerjaan End-to-End",
    description:
      "Dari analisis kebutuhan, eksekusi teknis, hingga serah terima hasil akhir — semua kami tangani dalam satu tim tanpa hand-off yang membuang waktu Anda.",
  },
  {
    icon: "map-pin",
    title: "Konteks Lokal yang Kuat",
    description:
      "Kami paham kondisi lapangan di Kalimantan dan Indonesia — regulasi tata ruang, standar BIG, hingga tantangan konektivitas di wilayah terluar.",
  },
  {
    icon: "refresh-cw",
    title: "Agile & Transparan",
    description:
      "Sprint pendek, laporan berkala, dan komunikasi terbuka. Anda tahu persis perkembangan proyek di setiap tahap — tidak ada kejutan di akhir.",
  },
  {
    icon: "cpu",
    title: "Teknologi & Tools Terkini",
    description:
      "Kami menggunakan stack yang relevan dan terawat aktif — Next.js, Python, ArcGIS, AutoCAD, dan ML frameworks modern — bukan teknologi warisan yang butuh ditopang.",
  },
  {
    icon: "users",
    title: "Kolaborasi Nyata",
    description:
      "Kami bekerja bersama Anda, bukan hanya untuk Anda. Masukan klien adalah bagian dari proses, bukan gangguan — dan itu membuat hasil akhirnya lebih baik.",
  },
]

export const about = {
  title: "Tiga Disiplin. Satu Tim. Satu Tujuan.",
  description:
    "SAYBA ARC adalah agensi multidisiplin dari Pontianak yang lahir dari satu keyakinan sederhana: masalah yang kompleks butuh tim yang punya lebih dari satu cara pandang. Kami menggabungkan keahlian Teknik Lingkungan, Teknologi Digital, dan Teknik Kelautan dalam satu atap — sehingga klien tidak perlu keliling mencari tiga vendor berbeda untuk satu proyek yang saling terkait.",
  stats: [
    { value: "3", label: "Departemen Spesialis" },
    { value: "2025", label: "Tahun Berdiri" },
    { value: "100%", label: "Komitmen Terhadap Kualitas" },
    { value: "1", label: "Tim, Banyak Solusi" },
  ],
  buttonText: "Kenali Tim Kami",
  buttonHref: "/about",
}

export const cta = {
  title: "Punya Proyek yang Ingin Dikerjakan?",
  subtitle:
    "Butuh peta lingkungan, aplikasi web, model machine learning, atau gambar teknik kapal — mari diskusikan kebutuhan Anda dan kami carikan solusinya.",
  buttonText: "Hubungi Kami",
  buttonHref: "/contact",
}

export const footerLinks = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/services" },
  { label: "Portofolio", href: "/portfolio" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Kontak", href: "/contact" },
]

export const socialLinks = [
  { name: "Instagram", icon: "instagram", href: "https://instagram.com/sayba.arc" },
  { name: "LinkedIn", icon: "linkedin", href: "https://linkedin.com/company/sayba-arc" },
  { name: "WhatsApp", icon: "whatsapp", href: "https://wa.me/6281234567890" },
  { name: "GitHub", icon: "github", href: "https://github.com/sayba-arc" },
]

export const servicesPage = {
  title: "Layanan Kami",
  subtitle:
    "Tiga departemen spesialis — Teknik Lingkungan, IT & Digital, dan Teknik Kelautan — siap menangani proyek dari ujung ke ujung.",
  items: services.map((s) => ({
    ...s,
    longDescription: s.description,
    features: [] as string[],
  })),
}

export const aboutPage = {
  hero: {
    title: "Tentang SAYBA ARC",
    subtitle: "Agensi multidisiplin dari Pontianak — Teknik Lingkungan, Teknologi Digital, dan Teknik Kelautan dalam satu tim.",
  },
  mission:
    "Menghadirkan solusi teknis yang relevan, jujur, dan berkualitas — tanpa overpromise, tanpa inflasi angka, dan tanpa meninggalkan klien setelah proyek selesai.",
  vision:
    "Menjadi agensi multidisiplin terpercaya di Indonesia yang dikenal bukan karena sertifikat di dinding, melainkan karena hasil nyata yang bisa klien tunjukkan.",
  team: [
    {
      name: "Tim Teknik Lingkungan",
      role: "Pemetaan ArcGIS & Analisis Spasial",
      bio: "Menangani seluruh pekerjaan pemetaan, GIS, penginderaan jauh, dan analisis data lingkungan. Berpengalaman dalam pengolahan data spasial untuk kebutuhan kajian lingkungan dan tata ruang.",
    },
    {
      name: "Tim IT & Digital",
      role: "Web, Mobile, ML & Data Science",
      bio: "Membangun aplikasi web dan mobile modern, model machine learning, sistem analitik data, dan sistem informasi — dari nol hingga deployment. Stack utama: Next.js, Python, React Native.",
    },
    {
      name: "Tim Teknik Kelautan",
      role: "Desain & Gambar Teknik Kapal",
      bio: "Mengerjakan seluruh gambar teknik kapal 2D menggunakan AutoCAD — lines plan, general arrangement, konstruksi, outfitting, hingga tata letak akomodasi sesuai standar teknis.",
    },
  ],
}

export const contactPage = {
  title: "Hubungi Kami",
  subtitle:
    "Punya proyek yang ingin dikerjakan atau sekadar ingin mengeksplorasi kemungkinan? Kami senang mendengar dari Anda.",
  info: [
    { icon: "mail", label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: "phone", label: "Telepon / WhatsApp", value: siteConfig.phone, href: `https://wa.me/6281234567890` },
    { icon: "map-pin", label: "Lokasi", value: siteConfig.address, href: "#" },
  ],
}
