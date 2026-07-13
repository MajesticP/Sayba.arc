"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Package } from "lucide-react"
import PageTransition from "@/components/page-transition"
import type { Produk } from "@/lib/database.types"
import type { LayananDept } from "@/lib/layanan-config"

function gdriveToImg(url: string): string {
  if (!url) return url
  if (url.startsWith("/api/gdrive-img")) return url
  const fileMatch = url.match(/\/d\/([\w-]+)/)
  if (fileMatch) return `/api/gdrive-img?id=${fileMatch[1]}`
  const idMatch = url.match(/[?&]id=([\w-]+)/)
  if (idMatch) return `/api/gdrive-img?id=${idMatch[1]}`
  return url
}

function formatIDR(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price)
}

function getDeptCfg(dept: string, depts: LayananDept[]) {
  const d = depts.find(x => x.value === dept)
  return { label: d?.label ?? dept, color: d?.color ?? "#888" }
}

interface Props { allProduk: Produk[]; allDepts: LayananDept[] }

export default function ProductsClient({ allProduk, allDepts }: Props) {
  const [activeDept, setActiveDept] = useState<string>("semua")

  const depts = useMemo(() => {
    const seen = new Set<string>(); const result: string[] = []
    for (const p of allProduk) { if (!seen.has(p.dept)) { seen.add(p.dept); result.push(p.dept) } }
    return result
  }, [allProduk])

  const filtered = useMemo(() => {
    return allProduk.filter(p => activeDept === "semua" || p.dept === activeDept)
  }, [allProduk, activeDept])

  if (allProduk.length === 0) {
    return (
      <section className="py-16 bg-white flex-1 flex items-center justify-center">
        <p className="text-black/30 text-base">Belum ada produk tersedia.</p>
      </section>
    )
  }

  return (
    <section className="py-6 md:py-16 bg-white flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Filter bar */}
        <div className="mb-5 md:mb-10 space-y-1.5">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 mr-1">Tipe</span>
            <FilterChip label="Semua" active={activeDept === "semua"} color="#ff914d" onClick={() => setActiveDept("semua")} />
            {depts.map(dept => {
              const cfg = getDeptCfg(dept, allDepts)
              return <FilterChip key={dept} label={cfg.label} active={activeDept === dept} color={cfg.color} onClick={() => setActiveDept(dept)} />
            })}
          </div>
          <p className="text-[11px] text-black/30">
            Menampilkan <span className="font-semibold text-black/50">{filtered.length}</span> produk
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {filtered.map((product, i) => (
            <PageTransition key={product.id} delay={i * 60}>
              <ProductCard product={product} cfg={getDeptCfg(product.dept, allDepts)} />
            </PageTransition>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-black/25 text-base">Tidak ada produk untuk filter ini.</p>
            <button onClick={() => setActiveDept("semua")} className="mt-3 text-sm text-[#ff914d] underline hover:text-[#e07b3a] transition-colors">Reset filter</button>
          </div>
        )}

        {/* CTA */}
        <div className="text-center bg-black rounded-2xl p-6 md:p-10 relative overflow-hidden mt-8 md:mt-16">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#ff914d] opacity-[0.08] blur-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-[#ff914d] rounded-full" />
          <h2 className="text-[18px] md:text-3xl font-bold text-white mb-1.5 md:mb-3 relative z-10">Butuh dokumen kustom?</h2>
          <p className="text-white/40 text-[12px] md:text-base mb-5 md:mb-6 relative z-10">Kami juga mengerjakan dokumen dan deliverable sesuai kebutuhan spesifik Anda.</p>
          <Link href="/contact" className="inline-block px-7 py-2.5 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:scale-105 relative z-10 text-[13px]">
            Diskusikan Kebutuhan Anda
          </Link>
        </div>
      </div>
    </section>
  )
}

function FilterChip({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`transition-all duration-200 font-semibold rounded-full border text-[11px] px-3 py-1 ${active ? "text-white border-transparent shadow-sm" : "text-black/40 border-black/12 bg-white hover:border-black/25 hover:text-black/60"}`}
      style={active ? { backgroundColor: color, borderColor: color } : {}}>
      {label}
    </button>
  )
}

function ProductCard({ product, cfg }: { product: Produk; cfg: { label: string; color: string } }) {
  const imgSrc = product.image_url ? gdriveToImg(product.image_url) : null

  return (
    <Link href={product.slug ? `/products/${product.slug}` : "#"}
      className="group bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden rounded-xl border border-black/8 w-full flex flex-col"
    >
      <div className="relative w-full bg-black/5 overflow-hidden leading-[0]" style={{ height: "160px" }}>
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgSrc} alt={product.title} className="w-full object-cover transition-transform duration-500 group-hover:scale-105 block"
            style={{ height: "100%" }}
            onError={e => { const el = e.currentTarget; el.style.display = "none"; const fb = el.nextElementSibling as HTMLElement | null; if (fb) fb.style.display = "flex" }} />
        ) : null}
        <div className="absolute inset-0 items-center justify-center transition-colors duration-300" style={{ display: imgSrc ? "none" : "flex", backgroundColor: `${cfg.color}14` }}>
          <Package className="w-6 h-6" style={{ color: cfg.color }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: cfg.color }} />
      </div>

      <div className="flex flex-col p-4 flex-1">
        {product.category && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full mb-1 w-fit flex-shrink-0" style={{ backgroundColor: `${cfg.color}14`, color: cfg.color }}>
            # {product.category}
          </span>
        )}
        <h4 className="text-[13px] font-bold text-black mb-1.5 transition-colors duration-200 leading-snug line-clamp-2 flex-shrink-0">
          {product.title}
        </h4>
        <p className="text-black/50 text-[11.5px] leading-relaxed line-clamp-2">
          {product.description}
        </p>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-[13px] font-bold" style={{ color: cfg.color }}>{formatIDR(product.price)}</span>
          <span className="text-[10.5px] font-semibold text-black/40 flex items-center gap-1 group-hover:text-black/60 transition-colors">
            Detail
            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
