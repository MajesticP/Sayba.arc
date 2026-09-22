"use client"

import { useMemo, useState } from "react"
import { isGambarContoh } from "@/lib/image-path"
import Link from "next/link"
import { ArrowRight, ImageIcon, Search } from "lucide-react"
import PageTransition from "@/components/page-transition"
import CuttingBoardBackground, { BoardSection } from "@/components/cutting-board-bg"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"
import { findDeptColor } from "@/lib/layanan-config"
import type { KategoriItem } from "@/lib/kategori"

/** Link Google Drive → proxy gambar lokal, sama seperti berita/informasi */
function gdriveToImg(url: string | null): string | null {
  // Path gambar contoh dari versi lama diperlakukan sebagai "belum ada gambar".
  if (url && isGambarContoh(url)) return null
  if (!url) return null
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

interface Props {
  allLayanan: Layanan[]
  depts: LayananDept[]
  /** Kategori dari tabel `kategori` (scope "layanan") */
  kategori: KategoriItem[]
}

export default function ServicesClient({ allLayanan, depts, kategori }: Props) {
  const [activeDept, setActiveDept] = useState<string>("semua")
  const [query, setQuery] = useState("")

  // Peta slug kategori ke label, supaya kartu menampilkan label yang Anda
  // atur di admin, bukan slug mentah.
  const kategoriMap = useMemo(() => {
    const m = new Map<string, KategoriItem>()
    kategori.forEach((k) => m.set(k.slug.toLowerCase(), k))
    return m
  }, [kategori])

  const labelKategori = (slug: string | null): string | null => {
    if (!slug) return null
    return kategoriMap.get(slug.toLowerCase())?.label ?? slug
  }

  // Hanya tampilkan departemen yang benar-benar punya layanan aktif
  const usedDepts = useMemo(() => {
    const used = new Set(allLayanan.map((l) => l.dept))
    return depts.filter((d) => used.has(d.value))
  }, [allLayanan, depts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allLayanan.filter((l) => {
      if (activeDept !== "semua" && l.dept !== activeDept) return false
      if (!q) return true
      return (
        l.title.toLowerCase().includes(q) ||
        (l.description ?? "").toLowerCase().includes(q) ||
        (l.category ?? "").toLowerCase().includes(q) ||
        (labelKategori(l.category) ?? "").toLowerCase().includes(q)
      )
    })
  }, [allLayanan, activeDept, query])

  // Kelompokkan per departemen supaya tiap bidang punya blok sendiri
  const grouped = useMemo(() => {
    const order = activeDept === "semua" ? usedDepts.map((d) => d.value) : [activeDept]
    return order
      .map((value) => ({
        dept: depts.find((d) => d.value === value),
        items: filtered.filter((l) => l.dept === value),
      }))
      .filter((g) => g.items.length > 0)
  }, [filtered, activeDept, usedDepts, depts])

  return (
    <>
      {/* ══ HERO: pita gelap dengan kisi meja potong ══ */}
      <BoardSection dark id="services-hero" panelClassName="relative overflow-hidden">
        <CuttingBoardBackground tone="dark" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-[100px] pb-14 md:pt-36 md:pb-20">
          <p className="animate-fade-in stagger-1 text-[12px] font-bold text-orange-soft mb-4">
            Layanan
          </p>
          <h1 className="animate-blur-in stagger-2 text-[28px] leading-[1.15] sm:text-4xl lg:text-[44px] font-bold text-ice tracking-tight mb-4 max-w-3xl">
            Dua Departemen, Lingkup Kerja yang Jelas
          </h1>
          <p className="animate-fade-in-up stagger-3 text-[14px] md:text-lg text-ice/75 leading-relaxed max-w-2xl">
            Pilih bidang yang Anda butuhkan. Kalau pekerjaannya mencakup keduanya, satu tim kami yang
            menangani.
          </p>
        </div>
      </BoardSection>

      {/* ══ DAFTAR LAYANAN ══ */}
      <BoardSection id="services-list" panelClassName="panel-top-pad">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14">

          {/* ── Filter departemen + pencarian ── */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 md:mb-12">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
              <FilterChip
                label="Semua"
                active={activeDept === "semua"}
                onClick={() => setActiveDept("semua")}
              />
              {usedDepts.map((d) => (
                <FilterChip
                  key={d.value}
                  label={d.label}
                  active={activeDept === d.value}
                  onClick={() => setActiveDept(d.value)}
                />
              ))}
            </div>

            <div className="relative md:w-72 shrink-0">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/65 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text" inputMode="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari layanan…"
                aria-label="Cari layanan"
                className="search-no-native-clear w-full pl-10 pr-4 py-2.5 rounded-xl border border-ice-line bg-white text-[14px] text-ink placeholder:text-ink/70 outline-none focus:border-orange focus:ring-2 focus:ring-orange/25 transition-all"
              />
            </div>
          </div>

          {/* ── Kosong ── */}
          {grouped.length === 0 && (
            <div className="py-16 text-center">
              <h2 className="text-[16px] font-bold text-navy mb-1.5">
                {query ? "Tidak ada layanan yang cocok" : "Belum ada layanan tersedia"}
              </h2>
              <p className="text-[14px] text-slate-brand max-w-md mx-auto mb-5">
                {query
                  ? `Tidak ada hasil untuk "${query}". Coba kata kunci lain.`
                  : "Layanan sedang disiapkan. Hubungi kami untuk mendiskusikan kebutuhan Anda."}
              </p>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="btn-outline"
                >
                  Tampilkan semua layanan
                </button>
              )}
            </div>
          )}

          {/* ── Blok per departemen ── */}
          {grouped.map(({ dept, items }, gi) => (
            <section key={dept?.value ?? gi} className="mb-12 md:mb-16 last:mb-0">
              {/* Judul departemen */}
              <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-ice-line">
                <div>
                  <h2 className="text-[18px] md:text-2xl font-bold text-navy">
                    {dept?.label ?? "Layanan"}
                  </h2>
                  {dept?.description && (
                    <p className="text-[13px] text-slate-brand mt-1 max-w-2xl leading-relaxed">
                      {dept.description}
                    </p>
                  )}
                </div>
                <span className="text-[13px] text-slate-brand shrink-0 tabular-nums">
                  {items.length} layanan
                </span>
              </div>

              {/* Lingkup kerja departemen */}
              {dept?.scope && (
                <ul className="flex flex-wrap gap-1.5 mb-6">
                  {dept.scope.map((s) => (
                    <li
                      key={s}
                      className="text-[11px] text-slate-brand bg-white border border-ice-line px-2.5 py-1 rounded-lg"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}

              {/* Kartu memanjang: foto 1:1 di kiri, teks di kanan */}
              <div className="space-y-3 md:space-y-4">
                {items.map((item, i) => (
                  <PageTransition key={item.id} delay={Math.min(i, 6) * 60}>
                    <ServiceRow item={item} accent={findDeptColor(depts, item.dept)} categoryLabel={labelKategori(item.category)} />
                  </PageTransition>
                ))}
              </div>
            </section>
          ))}

          {/* ── Ajakan ── */}
          <div className="mt-14 md:mt-20">
            <div className="relative bg-navy rounded-2xl md:rounded-3xl overflow-hidden p-6 md:p-10">
              <CuttingBoardBackground tone="dark" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="max-w-xl">
                  <h2 className="text-[18px] md:text-2xl font-bold text-ice mb-2">
                    Lingkupnya belum jelas?
                  </h2>
                  <p className="text-ice/75 text-[14px] md:text-[15px] leading-relaxed">
                    Ceritakan kondisi yang Anda hadapi. Kami bantu petakan kebutuhan teknisnya dan
                    langkah pertama yang perlu disiapkan.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="btn-solid shrink-0"
                >
                  Diskusikan Kebutuhan
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </BoardSection>
    </>
  )
}

/* ── Chip filter departemen ─────────────────────────────────────────────── */
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 px-5 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${
        active
          ? "bg-navy text-ice border-navy"
          : "bg-white text-slate-brand border-ice-line hover:border-orange hover:text-navy"
      }`}
    >
      {label}
    </button>
  )
}

/* ── Kartu layanan memanjang: foto 1:1 kiri + isi kanan ─────────────────── */
function ServiceRow({
  item,
  accent,
  categoryLabel,
}: {
  item: Layanan
  accent: string
  categoryLabel: string | null
}) {
  const img = gdriveToImg(item.image_url)

  return (
    <Link
      href={`/services/${item.slug}`}
      className="group flex flex-col sm:flex-row bg-white rounded-2xl border border-ice-line overflow-hidden hover:border-orange hover:shadow-lg transition-all duration-200"
    >
      {/* Foto 1:1: rasio persegi di kiri */}
      <div className="relative w-full sm:w-40 md:w-44 aspect-square shrink-0 bg-ice-dim overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-7 h-7 text-slate-brand" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Isi */}
      <div className="flex flex-col flex-1 min-w-0 p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-[16px] md:text-[17px] font-bold text-navy leading-snug group-hover:text-orange-text transition-colors">
            {item.title}
          </h3>
          {categoryLabel && (
            <span
              className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md border text-navy"
              style={{ borderColor: `${accent}99`, backgroundColor: `${accent}14` }}
            >
              {categoryLabel}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-[13.5px] text-slate-brand leading-relaxed line-clamp-2 md:line-clamp-3 mb-4">
            {item.description}
          </p>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-navy">
          Lihat detail
          <ArrowRight
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  )
}
