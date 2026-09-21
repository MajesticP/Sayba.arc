"use client"

import type React from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ChevronDown,
  ClipboardList,
  Clock,
  FileText,
  HelpCircle,
  LayoutGrid,
  List,
  Megaphone,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"
import PageTransition from "@/components/page-transition"
import type { Informasi } from "@/lib/database.types"
import {
  informasiCategories,
  getInformasiCategory,
  getInformasiCategoryLabel,
  getInformasiCategoryColor,
  formatInformasiDate,
} from "@/lib/informasi-data"

interface Props {
  initialArticles: Informasi[]
}

const FAQS = [
  {
    q: "Bagaimana tahapan pengajuan konsultasi atau proyek teknis di SAYBA ARC?",
    a: "Anda dapat menghubungi kami melalui formulir kontak atau WhatsApp dengan menyertakan deskripsi kebutuhan Anda (misalnya: pemetaan GIS, gambar CAD perkapalan, atau pembuatan aplikasi web). Tim kami akan mengkaji data awal dan menyiapkan Kerangka Acuan Kerja (KAK) serta penawaran resmi dalam 1-2 hari kerja.",
  },
  {
    q: "Apakah seluruh deliverable gambar teknik dan data GIS diserahkan dalam bentuk file sumber?",
    a: "Ya. Setiap pekerjaan yang telah selesai diserahkan dalam bentuk file sumber lengkap — DWG/DXF untuk AutoCAD, SHP/GDB untuk GIS, serta PDF resolusi tinggi siap cetak — sesuai klausul perjanjian yang disepakati.",
  },
  {
    q: "Berapa lama estimasi pengerjaan untuk proyek pemetaan atau gambar teknik?",
    a: "Durasi bervariasi bergantung luas area atau kompleksitas desain. Pemetaan standar berkisar 5-14 hari kerja, sementara rancangan teknik menyeluruh disesuaikan dengan milestone Kerangka Acuan Kerja (KAK).",
  },
  {
    q: "Apakah tersedia garansi revisi pasca serah terima hasil pekerjaan?",
    a: "Setiap paket layanan kami mencakup hak revisi teknis serta masa pendampingan uji coba (garansi pemeliharaan) antara 30 hingga 90 hari kalender untuk memastikan data dan sistem berjalan sempurna di pihak klien.",
  },
]

/** Ikon per kategori — dibuat konsisten di kartu, chip, dan daftar isi. */
function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const cls = className ?? "w-3.5 h-3.5"
  switch ((getInformasiCategory(slug)?.slug ?? slug).toLowerCase()) {
    case "pengumuman":
      return <Megaphone className={cls} />
    case "panduan":
      return <BookOpen className={cls} />
    case "standar":
      return <ShieldCheck className={cls} />
    case "dokumentasi":
      return <FileText className={cls} />
    case "operasional":
      return <ClipboardList className={cls} />
    default:
      return <FileText className={cls} />
  }
}

function MetaLine({ article }: { article: Informasi }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-[11px] text-black/40">
      <span>{formatInformasiDate(article.published_at)}</span>
      <span aria-hidden="true" className="text-black/20">·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {article.read_minutes} mnt
      </span>
    </span>
  )
}

export default function InformasiClient({ initialArticles }: Props) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("semua")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return initialArticles.filter((item) => {
      const cat = getInformasiCategory(item.category)
      const matchCategory =
        activeCategory === "semua" ||
        item.category.toLowerCase() === activeCategory.toLowerCase() ||
        cat?.slug === activeCategory
      if (!matchCategory) return false
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        (item.excerpt ?? "").toLowerCase().includes(q) ||
        (item.body ?? "").toLowerCase().includes(q) ||
        (item.tags ?? []).some((t) => t.toLowerCase().includes(q)) ||
        (item.author ?? "").toLowerCase().includes(q)
      )
    })
  }, [initialArticles, activeCategory, search])

  const featured = useMemo(
    () => initialArticles.find((item) => item.featured) ?? null,
    [initialArticles]
  )

  const counts = useMemo(() => {
    const map: Record<string, number> = { semua: initialArticles.length }
    informasiCategories.forEach((cat) => {
      map[cat.slug] = initialArticles.filter(
        (i) =>
          i.category.toLowerCase() === cat.slug.toLowerCase() ||
          i.category.toLowerCase() === cat.label.toLowerCase()
      ).length
    })
    return map
  }, [initialArticles])

  const latestDate = useMemo(() => {
    if (initialArticles.length === 0) return null
    return initialArticles
      .map((a) => a.published_at)
      .sort()
      .reverse()[0]
  }, [initialArticles])

  const isFiltering = activeCategory !== "semua" || search.trim() !== ""
  const showFeatured = featured !== null && !isFiltering

  return (
    <div className="w-full flex-1">
      {/* ══ HERO — pita gelap dengan pencarian, berbeda dari banner halaman lain ══ */}
      <section className="relative bg-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,145,77,0.85) 1px, transparent 1px), linear-gradient(90deg, rgba(255,145,77,0.85) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#ff914d] animate-orb-pulse pointer-events-none" />
        <div
          className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-[#ff914d] animate-orb-pulse-2 pointer-events-none"
          style={{ animationDelay: "2.2s" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[92px] pb-16 md:pt-36 md:pb-24">
          <div className="max-w-3xl">
            <div className="animate-fade-in-up stagger-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/15 text-[11px] font-medium text-white/60 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff914d] animate-pulse" />
              Pusat Informasi &amp; Dokumen Teknis
            </div>

            <h1 className="animate-blur-in stagger-2 text-[28px] leading-[1.1] sm:text-4xl lg:text-[52px] font-bold text-white tracking-tight mb-3">
              Informasi &amp; <span className="text-[#ff914d]">Dokumen Teknis</span>
            </h1>

            <p className="animate-fade-in-up stagger-3 text-white/55 text-[13px] md:text-lg leading-relaxed max-w-2xl mb-7">
              Panduan operasional, Kerangka Acuan Kerja (KAK), standar CAD &amp; geospasial, serta
              pengumuman layanan — dikelola langsung oleh tim SAYBA ARC.
            </p>

            {/* Pencarian utama */}
            <div className="animate-fade-in-up stagger-4 relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari panduan, standar, atau pengumuman…"
                aria-label="Cari informasi"
                className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-white text-[13.5px] text-black placeholder:text-black/35 outline-none shadow-2xl focus:ring-2 focus:ring-[#ff914d]/60 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Bersihkan pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-black/35 hover:text-black hover:bg-black/5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Statistik ringkas */}
            <div className="animate-fade-in-up stagger-5 flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-[12px] text-white/45">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#ff914d]" />
                <span className="text-white/80 font-semibold">{initialArticles.length}</span> dokumen
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-[#ff914d]" />
                <span className="text-white/80 font-semibold">{informasiCategories.length}</span> kategori
              </span>
              {latestDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#ff914d]" />
                  Diperbarui <span className="text-white/80 font-semibold">{formatInformasiDate(latestDate)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PANEL PUTIH — menumpuk di atas hero untuk transisi yang halus ══ */}
      <section className="relative z-10 -mt-7 md:-mt-12 rounded-t-[28px] md:rounded-t-[40px] bg-white pt-8 md:pt-14 pb-10 md:pb-20 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Kategori sebagai kartu pintasan ── */}
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[17px] md:text-2xl font-black text-black">Telusuri Kategori</h2>
              <p className="text-black/45 text-[12.5px] mt-0.5">Pilih topik untuk menyaring dokumen di bawah.</p>
            </div>
            {isFiltering && (
              <button
                type="button"
                onClick={() => { setActiveCategory("semua"); setSearch("") }}
                className="shrink-0 text-[12.5px] font-semibold text-[#b35418] hover:text-[#8f400f] transition-colors"
              >
                Atur ulang
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 md:gap-3 mb-10 md:mb-14">
            <CategoryTile
              label="Semua"
              count={counts.semua ?? 0}
              color="#ff914d"
              active={activeCategory === "semua"}
              icon={<LayoutGrid className="w-4 h-4" />}
              onClick={() => setActiveCategory("semua")}
            />
            {informasiCategories.map((cat) => (
              <CategoryTile
                key={cat.slug}
                label={cat.label}
                count={counts[cat.slug] ?? 0}
                color={cat.color}
                active={activeCategory === cat.slug}
                icon={<CategoryIcon slug={cat.slug} className="w-4 h-4" />}
                onClick={() => setActiveCategory(cat.slug)}
              />
            ))}
          </div>

          {/* ── Sorotan ── */}
          {showFeatured && featured && (
            <PageTransition>
              <Link
                href={`/informasi/${featured.slug}`}
                className="group relative block bg-black rounded-2xl md:rounded-3xl overflow-hidden mb-10 md:mb-14 p-6 md:p-10 transition-all duration-300 hover:shadow-2xl"
              >
                <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full" style={{ backgroundColor: getInformasiCategoryColor(featured.category) }} />
                <div className="absolute -top-16 right-0 w-72 h-72 rounded-full bg-[#ff914d] opacity-[0.10] blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                  <div className="max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#ff914d] mb-3">
                      <Sparkles className="w-3 h-3" />
                      Sorotan
                    </span>
                    <h3 className="text-[19px] md:text-3xl font-black text-white leading-snug mb-2.5 group-hover:text-[#ff914d] transition-colors duration-200">
                      {featured.title}
                    </h3>
                    {featured.excerpt && (
                      <p className="text-white/50 text-[13px] md:text-[15px] leading-relaxed line-clamp-2 mb-4">
                        {featured.excerpt}
                      </p>
                    )}
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-white/40">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/15 text-white/70">
                        <CategoryIcon slug={featured.category} className="w-3 h-3" />
                        {getInformasiCategoryLabel(featured.category)}
                      </span>
                      <span>{formatInformasiDate(featured.published_at)}</span>
                      <span aria-hidden="true" className="text-white/20">·</span>
                      <span>{featured.read_minutes} menit baca</span>
                    </div>
                  </div>

                  <span className="btn-shine shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ff914d] text-[#111111] text-[13px] font-bold group-hover:bg-[#e07b3a] transition-colors">
                    Buka Dokumen
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </PageTransition>
          )}

          {/* ── Toolbar hasil ── */}
          <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-black/8">
            <h2 className="text-[17px] md:text-2xl font-black text-black">
              {activeCategory === "semua" ? "Semua Dokumen" : getInformasiCategoryLabel(activeCategory)}
              <span className="ml-2 text-[12.5px] font-semibold text-black/35 align-middle">
                {filtered.length} dokumen
              </span>
            </h2>

            <div className="flex items-center p-1 rounded-xl bg-black/[0.04] border border-black/8 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Tampilan grid"
                aria-pressed={viewMode === "grid"}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === "grid" ? "bg-white text-[#ff914d] shadow-sm" : "text-black/35 hover:text-black/60"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="Tampilan daftar"
                aria-pressed={viewMode === "list"}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === "list" ? "bg-white text-[#ff914d] shadow-sm" : "text-black/35 hover:text-black/60"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Kosong ── */}
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-black/[0.04] border border-black/8 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-black/25" />
              </div>
              <h3 className="text-[15px] font-bold text-black mb-1">Tidak ada dokumen ditemukan</h3>
              <p className="text-[13px] text-black/45 max-w-md mx-auto mb-5">
                {search
                  ? `Tidak ada hasil untuk kata kunci "${search}". Coba kata kunci lain.`
                  : "Belum ada dokumen pada kategori ini."}
              </p>
              <button
                type="button"
                onClick={() => { setSearch(""); setActiveCategory("semua") }}
                className="px-4 py-2 rounded-xl bg-black text-white text-[12.5px] font-semibold hover:bg-[#ff914d] transition-colors"
              >
                Tampilkan semua dokumen
              </button>
            </div>
          )}

          {/* ── Grid dokumen ── */}
          {viewMode === "grid" && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((article, i) => (
                <PageTransition key={article.id} delay={Math.min(i, 8) * 60}>
                  <DocumentCard article={article} />
                </PageTransition>
              ))}
            </div>
          )}

          {/* ── Daftar dokumen ── */}
          {viewMode === "list" && filtered.length > 0 && (
            <div className="rounded-2xl border border-black/10 overflow-hidden divide-y divide-black/8">
              {filtered.map((article, i) => (
                <PageTransition key={article.id} delay={Math.min(i, 10) * 40}>
                  <Link
                    href={`/informasi/${article.slug}`}
                    className="group flex items-start gap-4 p-4 md:p-5 bg-white hover:bg-black/[0.02] transition-colors"
                  >
                    <span
                      className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${getInformasiCategoryColor(article.category)}14`,
                        color: getInformasiCategoryColor(article.category),
                      }}
                    >
                      <CategoryIcon slug={article.category} className="w-4 h-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: getInformasiCategoryColor(article.category) }}>
                          {getInformasiCategoryLabel(article.category)}
                        </span>
                        <MetaLine article={article} />
                      </span>
                      <span className="block text-[14.5px] font-bold text-black leading-snug group-hover:text-[#ff914d] transition-colors line-clamp-2">
                        {article.title}
                      </span>
                      {article.excerpt && (
                        <span className="block text-[12.5px] text-black/45 leading-relaxed line-clamp-1 mt-1">
                          {article.excerpt}
                        </span>
                      )}
                    </span>

                    <ArrowRight className="w-4 h-4 text-black/25 group-hover:text-[#ff914d] group-hover:translate-x-1 transition-all shrink-0 mt-3" />
                  </Link>
                </PageTransition>
              ))}
            </div>
          )}

          {/* ── FAQ & Bantuan ── */}
          <section className="mt-14 md:mt-24 pt-10 md:pt-16 border-t border-black/8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff914d]/10 mb-3">
                  <HelpCircle className="w-3.5 h-3.5 text-[#b35418]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#b35418]">Pertanyaan Umum</span>
                </div>
                <h2 className="text-[20px] md:text-3xl font-black text-black mb-2">
                  Hal yang Sering Ditanyakan
                </h2>
                <p className="text-black/45 text-[13px] md:text-[15px] mb-6 max-w-xl">
                  Seputar alur konsultasi, penyerahan berkas, dan lisensi hasil pekerjaan di SAYBA ARC.
                </p>

                <div className="space-y-2.5">
                  {FAQS.map((faq, i) => {
                    const isOpen = openFaq === i
                    return (
                      <div key={i} className={`rounded-xl border transition-colors ${isOpen ? "border-[#ff914d]/35 bg-[#ff914d]/[0.04]" : "border-black/10 bg-white"}`}>
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          aria-expanded={isOpen}
                          className="w-full p-4 text-left flex items-start justify-between gap-4"
                        >
                          <span className={`text-[13.5px] font-bold leading-snug transition-colors ${isOpen ? "text-[#ff914d]" : "text-black"}`}>
                            {faq.q}
                          </span>
                          <ChevronDown className={`w-4 h-4 shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#ff914d]" : "text-black/30"}`} />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 -mt-1 text-[12.5px] text-black/55 leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-black p-6 md:p-8 relative overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#ff914d] opacity-[0.10] blur-3xl pointer-events-none" />
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff914d]/60 to-transparent" />

                  <div className="relative z-10 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-[#ff914d]/15 border border-[#ff914d]/30 flex items-center justify-center text-[#ff914d] mb-5">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="text-[18px] md:text-2xl font-black text-white mb-2 leading-snug">
                      Butuh informasi yang belum tercantum?
                    </h3>
                    <p className="text-white/50 text-[12.5px] leading-relaxed mb-6">
                      Hubungi perwakilan teknis kami untuk diskusi kebutuhan dokumen, penjadwalan survei, atau
                      penawaran resmi.
                    </p>

                    <ul className="space-y-2.5 mb-8">
                      {[
                        "Respon WhatsApp rata-rata < 15 menit",
                        "Diskusi langsung dengan engineer spesialis",
                        "Kerahasiaan data dijamin dengan NDA",
                      ].map((t) => (
                        <li key={t} className="flex items-start gap-2.5 text-[12.5px] text-white/70">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#ff914d] shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative z-10 space-y-2.5">
                    <a
                      href="https://wa.me/6287721916495?text=Halo%20SAYBA%20ARC,%20saya%20ingin%20bertanya%20mengenai%20informasi%20dan%20dokumen%20teknis."
                      target="_blank"
                      rel="noreferrer"
                      className="btn-shine w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#ff914d] text-[#111111] text-[13px] font-bold hover:bg-[#e07b3a] transition-colors"
                    >
                      Hubungi via WhatsApp
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <Link
                      href="/contact"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/8 border border-white/15 text-white/80 text-[12.5px] font-semibold hover:bg-white/14 transition-colors"
                    >
                      Buka Halaman Kontak
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </section>
    </div>
  )
}

/* ── Kartu kategori ─────────────────────────────────────────────────────── */
function CategoryTile({
  label,
  count,
  color,
  active,
  icon,
  onClick,
}: {
  label: string
  count: number
  color: string
  active: boolean
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group text-left rounded-2xl border p-3.5 transition-all duration-200 hover:-translate-y-0.5 ${
        active
          ? "border-transparent text-white shadow-lg"
          : "border-black/10 bg-white hover:border-black/25 hover:shadow-md"
      }`}
      style={active ? { backgroundColor: color } : {}}
    >
      <span
        className="flex w-8 h-8 rounded-lg items-center justify-center mb-2.5"
        style={
          active
            ? { backgroundColor: "rgba(255,255,255,0.22)", color: "#fff" }
            : { backgroundColor: `${color}14`, color }
        }
      >
        {icon}
      </span>
      <span className={`block text-[12.5px] font-bold leading-snug ${active ? "text-white" : "text-black"}`}>
        {label}
      </span>
      <span className={`block text-[11px] mt-0.5 ${active ? "text-white/75" : "text-black/40"}`}>
        {count} dokumen
      </span>
    </button>
  )
}

/* ── Kartu dokumen — tanpa foto besar, gaya pusat dokumen ────────────────── */
function DocumentCard({ article }: { article: Informasi }) {
  const color = getInformasiCategoryColor(article.category)
  const label = getInformasiCategoryLabel(article.category)

  return (
    <Link
      href={`/informasi/${article.slug}`}
      className="group relative flex flex-col h-full rounded-2xl border border-black/10 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <span className="block h-1 w-full" style={{ backgroundColor: color }} />

      <span className="flex flex-col flex-1 p-5">
        <span className="flex items-center justify-between gap-2 mb-3.5">
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${color}14`, color }}
          >
            <CategoryIcon slug={article.category} className="w-3 h-3" />
            {label}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-black/35">
            <Clock className="w-3 h-3" />
            {article.read_minutes} mnt
          </span>
        </span>

        <span className="block text-[15.5px] font-black text-black leading-snug mb-2 line-clamp-2 group-hover:text-[#b35418] transition-colors duration-200">
          {article.title}
        </span>

        {article.excerpt && (
          <span className="block text-[12.5px] text-black/45 leading-relaxed line-clamp-3 flex-1">
            {article.excerpt}
          </span>
        )}

        {article.tags && article.tags.length > 0 && (
          <span className="flex flex-wrap gap-1.5 mt-3.5">
            {article.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] text-black/40 bg-black/[0.04] border border-black/8 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </span>
        )}

        <span className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-black/8">
          <span className="text-[11px] text-black/40">{formatInformasiDate(article.published_at)}</span>
          <span className="inline-flex items-center gap-1 text-[12px] font-bold" style={{ color }}>
            Baca
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </span>
      </span>
    </Link>
  )
}
