"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, ImageIcon, Search } from "lucide-react"
import PageTransition from "@/components/page-transition"
import CuttingBoardBackground from "@/components/cutting-board-bg"
import type { Layanan } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"
import { getDeptColor } from "@/lib/layanan-config"

/** Link Google Drive → proxy gambar lokal, sama seperti berita/informasi */
function gdriveToImg(url: string | null): string | null {
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
}

export default function ServicesClient({ allLayanan, depts }: Props) {
  const [activeDept, setActiveDept] = useState<string>("semua")
  const [query, setQuery] = useState("")

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
        (l.category ?? "").toLowerCase().includes(q)
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
      {/* ══ HERO — pita gelap dengan kisi meja potong ══ */}
      <section className="relative bg-carbon overflow-hidden">
        <CuttingBoardBackground tone="dark" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-[100px] pb-14 md:pt-36 md:pb-20">
          <p className="animate-fade-in stagger-1 text-[12px] font-medium text-steel mb-4">
            Layanan
          </p>
          <h1 className="animate-blur-in stagger-2 text-[28px] leading-[1.15] sm:text-4xl lg:text-[44px] font-bold text-platinum tracking-tight mb-4 max-w-3xl">
            Dua Departemen, Lingkup Kerja yang Jelas
          </h1>
          <p className="animate-fade-in-up stagger-3 text-[14px] md:text-lg text-steel leading-relaxed max-w-2xl">
            Pilih bidang yang Anda butuhkan. Kalau pekerjaannya mencakup keduanya, satu tim kami yang
            menangani.
          </p>
        </div>
      </section>

      {/* ══ DAFTAR LAYANAN ══ */}
      <section className="relative z-10 -mt-6 md:-mt-10 rounded-t-[28px] md:rounded-t-[40px] bg-platinum pb-14 md:pb-24">
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-brand pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari layanan…"
                aria-label="Cari layanan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-platinum-line bg-white text-[14px] text-carbon placeholder:text-slate-brand/90 outline-none focus:border-steel focus:ring-2 focus:ring-steel/25 transition-all"
              />
            </div>
          </div>

          {/* ── Kosong ── */}
          {grouped.length === 0 && (
            <div className="py-16 text-center">
              <h2 className="text-[16px] font-bold text-carbon mb-1.5">
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
                  className="px-5 py-2.5 rounded-xl bg-carbon text-platinum text-[13px] font-semibold hover:bg-carbon-800 transition-colors"
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
              <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-platinum-line">
                <div>
                  <h2 className="text-[18px] md:text-2xl font-bold text-carbon">
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
                      className="text-[11px] text-slate-brand bg-white border border-platinum-line px-2.5 py-1 rounded-lg"
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
                    <ServiceRow item={item} accent={getDeptColor(item.dept)} />
                  </PageTransition>
                ))}
              </div>
            </section>
          ))}

          {/* ── Ajakan ── */}
          <div className="mt-14 md:mt-20">
            <div className="relative bg-carbon rounded-2xl md:rounded-3xl overflow-hidden p-6 md:p-10">
              <CuttingBoardBackground tone="dark" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="max-w-xl">
                  <h2 className="text-[18px] md:text-2xl font-bold text-platinum mb-2">
                    Lingkupnya belum jelas?
                  </h2>
                  <p className="text-steel text-[14px] md:text-[15px] leading-relaxed">
                    Ceritakan kondisi yang Anda hadapi. Kami bantu petakan kebutuhan teknisnya dan
                    langkah pertama yang perlu disiapkan.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-powder text-carbon text-[14px] font-semibold hover:bg-white transition-colors"
                >
                  Diskusikan Kebutuhan
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
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
          ? "bg-carbon text-platinum border-carbon"
          : "bg-white text-slate-brand border-platinum-line hover:border-steel hover:text-carbon"
      }`}
    >
      {label}
    </button>
  )
}

/* ── Kartu layanan memanjang: foto 1:1 kiri + isi kanan ─────────────────── */
function ServiceRow({ item, accent }: { item: Layanan; accent: string }) {
  const img = gdriveToImg(item.image_url)

  return (
    <Link
      href={`/services/${item.slug}`}
      className="group flex flex-col sm:flex-row bg-white rounded-2xl border border-platinum-line overflow-hidden hover:border-steel hover:shadow-lg transition-all duration-200"
    >
      {/* Foto 1:1 — rasio persegi di kiri */}
      <div className="relative w-full sm:w-40 md:w-44 aspect-square shrink-0 bg-platinum-dim overflow-hidden">
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
            <ImageIcon className="w-7 h-7 text-slate-brand/75" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Isi */}
      <div className="flex flex-col flex-1 min-w-0 p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-[16px] md:text-[17px] font-bold text-carbon leading-snug group-hover:text-slate-brand transition-colors">
            {item.title}
          </h3>
          {item.category && (
            <span
              className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md border"
              style={{ borderColor: `${accent}99`, backgroundColor: `${accent}14` }}
            >
              {item.category}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-[14px] text-slate-brand leading-relaxed line-clamp-2 md:line-clamp-3 mb-4">
            {item.description}
          </p>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-carbon">
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
