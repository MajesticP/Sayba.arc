"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  ChevronDown,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  LayoutGrid,
  List,
  Megaphone,
  Search,
  ShieldCheck,
  X,
} from "lucide-react"
import PageTransition from "@/components/page-transition"
import CuttingBoardBackground, { BoardSection } from "@/components/cutting-board-bg"
import type { Informasi } from "@/lib/database.types"
import type { KategoriItem } from "@/lib/kategori"
import { formatInformasiDate } from "@/lib/informasi-data"

interface Props {
  initialArticles: Informasi[]
  kategori: KategoriItem[]
}

/** Ikon per kategori. Kalau slug tidak dikenal, pakai ikon dokumen. */
function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const cls = className ?? "w-3.5 h-3.5"
  switch (slug.toLowerCase()) {
    case "pengumuman":
      return <Megaphone className={cls} aria-hidden="true" />
    case "panduan":
      return <FileText className={cls} aria-hidden="true" />
    case "standar":
      return <ShieldCheck className={cls} aria-hidden="true" />
    case "operasional":
      return <ClipboardList className={cls} aria-hidden="true" />
    default:
      return <FileText className={cls} aria-hidden="true" />
  }
}

export default function InformasiClient({ initialArticles, kategori }: Props) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("semua")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Peta slug → label/warna untuk pencarian cepat
  const catMap = useMemo(() => {
    const m = new Map<string, KategoriItem>()
    kategori.forEach((c) => m.set(c.slug.toLowerCase(), c))
    return m
  }, [kategori])

  const catOf = (slug: string): KategoriItem =>
    catMap.get(slug.toLowerCase()) ?? { slug, label: slug, color: "#5a5c62" }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return initialArticles.filter((item) => {
      if (activeCategory !== "semua" && item.category.toLowerCase() !== activeCategory.toLowerCase())
        return false
      if (!q) return true
      return (
        item.title.toLowerCase().includes(q) ||
        (item.excerpt ?? "").toLowerCase().includes(q) ||
        (item.body ?? "").toLowerCase().includes(q) ||
        (item.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [initialArticles, activeCategory, search])

  const featured = useMemo(
    () => initialArticles.find((item) => item.featured) ?? null,
    [initialArticles]
  )

  // Hanya tampilkan kategori yang benar-benar dipakai artikel
  const usedCategories = useMemo(() => {
    const used = new Set(initialArticles.map((a) => a.category.toLowerCase()))
    return kategori.filter((c) => used.has(c.slug.toLowerCase()))
  }, [kategori, initialArticles])

  const counts = useMemo(() => {
    const map: Record<string, number> = { semua: initialArticles.length }
    usedCategories.forEach((cat) => {
      map[cat.slug] = initialArticles.filter(
        (i) => i.category.toLowerCase() === cat.slug.toLowerCase()
      ).length
    })
    return map
  }, [initialArticles, usedCategories])

  const isFiltering = activeCategory !== "semua" || search.trim() !== ""
  const showFeatured = featured !== null && !isFiltering

  return (
    <>
      {/* ══ HERO ══ */}
      <BoardSection dark id="informasi-hero" panelClassName="relative overflow-hidden">
        <CuttingBoardBackground tone="dark" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-[100px] pb-14 md:pt-36 md:pb-20">
          <p className="animate-fade-in stagger-1 text-[12px] font-bold text-orange-soft mb-4">
            Informasi
          </p>
          <h1 className="animate-blur-in stagger-2 text-[24px] md:text-[38px] font-bold text-ice leading-tight mb-4 max-w-3xl">
            Panduan, Standar &amp; Pengumuman
          </h1>
          <p className="animate-fade-in-up stagger-3 text-[14px] md:text-lg text-ice/75 leading-relaxed max-w-2xl mb-7">
            Acuan kerja, format berkas, dan kabar layanan yang kami pakai sehari-hari.
          </p>

          <div className="animate-fade-in-up stagger-4 relative max-w-xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/45 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text" inputMode="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari panduan, standar, atau pengumuman…"
              aria-label="Cari informasi"
              className="search-no-native-clear w-full pl-11 pr-11 py-3.5 rounded-2xl bg-ice text-[14px] text-ink placeholder:text-ink/50 outline-none focus:ring-2 focus:ring-orange transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Bersihkan pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </BoardSection>

      {/* ══ ISI ══ */}
      <BoardSection id="informasi-list" panelClassName="panel-top-pad">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14">

          {/* ── Belum ada dokumen sama sekali ── */}
          {initialArticles.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-ice-dim border border-ice-line flex items-center justify-center mx-auto mb-5">
                <FileText className="w-6 h-6 text-slate-brand" aria-hidden="true" />
              </div>
              <h2 className="text-[17px] font-bold text-navy mb-2">Belum ada dokumen</h2>
              <p className="text-[14px] text-slate-brand max-w-md mx-auto mb-6 leading-relaxed">
                Panduan dan standar kerja sedang disiapkan. Untuk pertanyaan teknis, hubungi tim kami
                langsung.
              </p>
              <Link
                href="/contact"
                className="btn-outline"
              >
                Hubungi Kami
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* ── Kategori ── */}
          {initialArticles.length > 0 && usedCategories.length > 0 && (
            <div className="mb-8 md:mb-12">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
                <FilterChip
                  label="Semua"
                  count={counts.semua ?? 0}
                  active={activeCategory === "semua"}
                  onClick={() => setActiveCategory("semua")}
                />
                {usedCategories.map((cat) => (
                  <FilterChip
                    key={cat.slug}
                    label={cat.label}
                    count={counts[cat.slug] ?? 0}
                    active={activeCategory === cat.slug}
                    onClick={() => setActiveCategory(cat.slug)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Sorotan ── */}
          {showFeatured && featured && (
            <PageTransition>
              <Link
                href={`/informasi/${featured.slug}`}
                className="group block bg-navy rounded-2xl md:rounded-3xl overflow-hidden mb-10 md:mb-14 p-6 md:p-9 hover:shadow-2xl transition-all duration-200"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-orange-soft mb-3">
                  Sorotan
                </p>
                <h2 className="text-[18px] md:text-[24px] font-bold text-ice leading-snug mb-3 group-hover:text-orange-soft transition-colors max-w-3xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-ice/75 text-[14px] md:text-[15px] leading-relaxed line-clamp-2 mb-5 max-w-3xl">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-ice/70">
                  <span className="text-orange-soft font-semibold">{catOf(featured.category).label}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatInformasiDate(featured.published_at)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featured.read_minutes} menit baca</span>
                </div>
              </Link>
            </PageTransition>
          )}

          {/* ── Toolbar ── */}
          {initialArticles.length > 0 && (
            <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-ice-line">
              <h2 className="text-[17px] md:text-2xl font-bold text-navy">
                {activeCategory === "semua"
                  ? "Semua Dokumen"
                  : catOf(activeCategory).label}
                <span className="ml-2 text-[13px] font-medium text-slate-brand align-middle tabular-nums">
                  {filtered.length} dokumen
                </span>
              </h2>

              <div className="flex items-center p-1 rounded-xl bg-ice-dim border border-ice-line shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Tampilan grid"
                  aria-label="Tampilan grid"
                  aria-pressed={viewMode === "grid"}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-navy shadow-sm"
                      : "text-slate-brand hover:text-navy"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  title="Tampilan daftar"
                  aria-label="Tampilan daftar"
                  aria-pressed={viewMode === "list"}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    viewMode === "list"
                      ? "bg-white text-navy shadow-sm"
                      : "text-slate-brand hover:text-navy"
                  }`}
                >
                  <List className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* ── Kosong karena filter ── */}
          {initialArticles.length > 0 && filtered.length === 0 && (
            <div className="py-16 text-center">
              <h3 className="text-[15px] font-bold text-navy mb-1.5">Tidak ada dokumen yang cocok</h3>
              <p className="text-[14px] text-slate-brand max-w-md mx-auto mb-5">
                {search
                  ? `Tidak ada hasil untuk "${search}". Coba kata kunci lain.`
                  : "Belum ada dokumen pada kategori ini."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setActiveCategory("semua")
                }}
                className="btn-outline"
              >
                Tampilkan semua dokumen
              </button>
            </div>
          )}

          {/* ── Grid ── */}
          {viewMode === "grid" && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {filtered.map((article, i) => (
                <PageTransition key={article.id} delay={Math.min(i, 6) * 60}>
                  <DocumentCard article={article} cat={catOf(article.category)} />
                </PageTransition>
              ))}
            </div>
          )}

          {/* ── Daftar ── */}
          {viewMode === "list" && filtered.length > 0 && (
            <div className="rounded-2xl border border-ice-line overflow-hidden divide-y divide-ice-line">
              {filtered.map((article, i) => (
                <PageTransition key={article.id} delay={Math.min(i, 8) * 40}>
                  <Link
                    href={`/informasi/${article.slug}`}
                    className="group flex items-start gap-4 p-4 md:p-5 bg-white hover:bg-ice-dim/60 transition-colors"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2.5 flex-wrap mb-1">
                        <span className="text-[11px] font-semibold text-orange-text">
                          {catOf(article.category).label}
                        </span>
                        <span aria-hidden="true" className="text-slate-brand">·</span>
                        <span className="text-[11px] text-slate-brand">
                          {formatInformasiDate(article.published_at)}
                        </span>
                        <span aria-hidden="true" className="text-slate-brand">·</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-brand">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {article.read_minutes} mnt
                        </span>
                      </span>
                      <span className="block text-[14px] font-semibold text-navy leading-snug group-hover:text-orange-text transition-colors line-clamp-2">
                        {article.title}
                      </span>
                      {article.excerpt && (
                        <span className="block text-[13px] text-slate-brand leading-relaxed line-clamp-1 mt-1">
                          {article.excerpt}
                        </span>
                      )}
                    </span>

                    <ArrowRight
                      className="w-4 h-4 text-slate-brand group-hover:text-orange-text group-hover:translate-x-1 transition-all shrink-0 mt-3"
                      aria-hidden="true"
                    />
                  </Link>
                </PageTransition>
              ))}
            </div>
          )}

          {/* ── FAQ ── */}
          {initialArticles.length > 0 && (
            <section className="mt-14 md:mt-20 pt-10 md:pt-14 border-t border-ice-line">
              <h2 className="text-[18px] md:text-2xl font-bold text-navy mb-2">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-[14px] text-slate-brand mb-6 max-w-2xl">
                Seputar alur kerja, penyerahan berkas, dan revisi di SAYBA ARC.
              </p>

              <div className="space-y-2.5 max-w-3xl">
                {FAQ_LIST.map((faq, i) => {
                  const isOpen = openFaq === i
                  return (
                    <div
                      key={i}
                      className={`rounded-xl border bg-white transition-colors ${
                        isOpen ? "border-orange" : "border-ice-line"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        className="search-no-native-clear w-full p-4 text-left flex items-start justify-between gap-4"
                      >
                        <span className="text-[14px] font-semibold text-navy leading-snug">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${
                            isOpen ? "rotate-180 text-orange-text" : "text-slate-brand"
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 -mt-1 text-[14px] text-slate-brand leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </BoardSection>
    </>
  )
}

/* ── FAQ: pertanyaan yang benar-benar ditanyakan klien ─────────────────── */
const FAQ_LIST = [
  {
    q: "Bagaimana alur memulai pekerjaan di SAYBA ARC?",
    a: "Kirimkan lingkup pekerjaan lewat WhatsApp atau email. Kami kaji kebutuhannya, lalu menyusun Kerangka Acuan Kerja berisi lingkup, biaya, dan jadwal. Setelah SPK ditandatangani dan DP dibayar, pekerjaan mulai berjalan.",
  },
  {
    q: "Apakah berkas sumber ikut diserahkan?",
    a: "Ya. Untuk pekerjaan gambar teknik kami serahkan DWG/DXF, untuk pemetaan SHP atau File Geodatabase, dan untuk pengembangan perangkat lunak kami serahkan akses repositori kode. Semua tercantum di KAK.",
  },
  {
    q: "Berapa lama pengerjaan biasanya?",
    a: "Pemetaan standar 5 sampai 14 hari kerja. Pengembangan perangkat lunak bergantung jumlah fitur dan disepakati per milestone di KAK. Estimasi tertulis sebelum pekerjaan dimulai.",
  },
  {
    q: "Bagaimana ketentuan revisi?",
    a: "Jumlah siklus revisi tertulis di KAK sejak awal, biasanya 2 sampai 3 kali untuk pekerjaan gambar dan peta. Masa garansi perbaikan galat 30 sampai 90 hari setelah serah terima, tergantung jenis kontrak.",
  },
  {
    q: "Apakah data proyek kami dijaga kerahasiaannya?",
    a: "Ya. Kami bersedia menandatangani NDA sebelum pertukaran data. Data proyek disimpan pada penyimpanan terbatas akses, dan bisa dihapus permanen atas permintaan setelah masa garansi berakhir.",
  },
]

/* ── Chip filter kategori ───────────────────────────────────────────────── */
function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${
        active
          ? "bg-navy text-ice border-navy"
          : "bg-white text-slate-brand border-ice-line hover:border-orange hover:text-navy"
      }`}
    >
      {label}
      <span
        className={`text-[11px] tabular-nums ${active ? "text-ice/70" : "text-slate-brand"}`}
      >
        {count}
      </span>
    </button>
  )
}

/* ── Kartu dokumen ──────────────────────────────────────────────────────── */
function DocumentCard({ article, cat }: { article: Informasi; cat: KategoriItem }) {
  return (
    <Link
      href={`/informasi/${article.slug}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-ice-line overflow-hidden hover:border-orange hover:shadow-lg transition-all duration-200"
    >
      <span className="block h-1 w-full" style={{ backgroundColor: cat.color }} aria-hidden="true" />

      <span className="flex flex-col flex-1 p-5">
        <span className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-text">
            <CategoryIcon slug={article.category} className="w-3.5 h-3.5" />
            {cat.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-brand">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {article.read_minutes} mnt
          </span>
        </span>

        <span className="block text-[15px] font-bold text-navy leading-snug mb-2 line-clamp-2 group-hover:text-orange-text transition-colors">
          {article.title}
        </span>

        {article.excerpt && (
          <span className="block text-[13px] text-slate-brand leading-relaxed line-clamp-3 flex-1">
            {article.excerpt}
          </span>
        )}

        <span className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-ice-line">
          <span className="text-[11px] text-slate-brand">
            {formatInformasiDate(article.published_at)}
          </span>
          {article.views > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-brand">
              <Eye className="w-3 h-3" aria-hidden="true" />
              {article.views.toLocaleString("id-ID")}
            </span>
          )}
        </span>
      </span>
    </Link>
  )
}
