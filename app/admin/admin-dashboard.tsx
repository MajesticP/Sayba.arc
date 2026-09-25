"use client"

import { useEffect, useState, useCallback, useRef, useId } from "react"
import type { Portfolio, PortfolioInsert, Layanan, Informasi, Berita, PromoBanner, ContentBlock, LayananFAQ, ProcessStep, KategoriScope } from "@/lib/database.types"
import { LAYANAN_DEPTS as DEFAULT_DEPTS, type LayananDept } from "@/lib/layanan-config"
import { LayoutGrid, Layers, Settings, Plus, Pencil, Trash2, RefreshCw, Search, X, Save, ChevronDown, ChevronUp, ExternalLink, Map, CheckCircle, AlertCircle, Loader2, Tag, Users, ImageIcon, Menu, Newspaper, GalleryHorizontalEnd, ListOrdered, Heading, AlignLeft, ImagePlus, Info, AlertTriangle, Star, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import EditorIsi from "./editor-isi"
import BagianLipat from "./bagian-lipat"
import { ringkasDariIsi } from "@/lib/ringkasan"
import { gambarAmanAtau } from "@/lib/gambar"
/**
 * Slug dari judul: huruf kecil, tanda baca dibuang, spasi jadi tanda hubung.
 * Dulu ada di lib/news-data; dipindah ke sini karena hanya admin yang memakainya.
 */
function slugifyTitle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// Departemen layanan bersifat tetap, dua dept dari lib/layanan-config.ts,
// dibaca lewat /api/admin/tipe. Kategori informasi dikelola di tab tersendiri
// (tabel `kategori`, lewat /api/admin/kategori, mencakup tiga modul).

// ── Types ──────────────────────────────────────────────────────────────────
type Tab = "portfolio" | "layanan" | "informasi" | "kategori" | "berita" | "promo" | "tim"

/**
 * Satu kategori terpusat (tabel `kategori`). Kolom `scope` menentukan modul
 * pemakainya: "layanan", "berita", atau "informasi". Satu daftar melayani
 * ketiganya, jadi admin tidak perlu mengelola tiga tempat terpisah.
 */
interface KategoriRow {
  id: string
  scope: KategoriScope
  slug: string
  label: string
  description: string | null
  color: string
  sort_order: number
  status: "active" | "draft"
}

interface TimMember {
  id: string
  name: string
  role: string
  bio: string | null
  photo_url: string | null
  github_url: string | null
  linkedin_url: string | null
  instagram_url: string | null
  order_num: number
  status: "active" | "draft"
  created_at: string
}

// Tautan gambar dirapikan lewat satu modul bersama (lib/gambar): tautan Drive
// maupun tautan luar sama-sama diarahkan ke proksi situs ini, supaya gambar
// tidak diblokir kebijakan keamanan dan langsung terlihat di pratinjau.
const gdriveToImg = gambarAmanAtau

// Format gambar yang boleh diunggah. Pemeriksaan di klien ini hanya untuk
// umpan balik cepat; server tetap memvalidasi format sebenarnya dari isi
// berkas. Semua gambar (JPG/PNG/WebP/GIF/SVG) otomatis dikonversi ke WebP.
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]
const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,.svg,image/jpeg,image/png,image/webp,image/gif,image/svg+xml"

function isAllowedImageFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return ALLOWED_IMAGE_TYPES.includes(file.type) || ALLOWED_IMAGE_EXT.some((ext) => name.endsWith(ext))
}

type DeptFilter = "semua" | string
type Status = "active" | "draft" | "archived"
type Toast = { id: number; msg: string; type: "success" | "error" }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim()
}

const STATUS_LABEL: Record<Status, string> = { active: "Active", draft: "Draft", archived: "Archived" }
const STATUS_CLASS: Record<Status, string> = {
  active: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  draft: "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20",
  archived: "bg-white/5 text-white/30 ring-white/10",
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1", STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function DeptBadge({ dept, depts }: { dept: string; depts: LayananDept[] }) {
  const cfg = depts.find(d => d.value === dept)
  if (!cfg) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-white/40 ring-1 ring-white/10">{dept}</span>
  )
  // Warna aksen diambil dari data departemen (kolom `color`), bukan kelas Tailwind,
  // supaya badge tetap benar walau warna dept diubah tanpa deploy.
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ color: cfg.color, backgroundColor: `${cfg.color}1a`, boxShadow: `inset 0 0 0 1px ${cfg.color}33` }}
    >
      {cfg.label}
    </span>
  )
}

function tabIcon(t: Tab, size = 14) {
  if (t === "portfolio") return <LayoutGrid size={size} />
  if (t === "layanan") return <Layers size={size} />
  if (t === "informasi") return <Newspaper size={size} />
  if (t === "kategori") return <Tag size={size} />
  if (t === "berita") return <Newspaper size={size} />
  if (t === "promo") return <GalleryHorizontalEnd size={size} />
  if (t === "tim") return <Users size={size} />
  return <Settings size={size} />
}
function tabLabel(t: Tab) {
  if (t === "portfolio") return "Portofolio"
  if (t === "layanan") return "Layanan"
  if (t === "informasi") return "Informasi"
  if (t === "kategori") return "Kategori"
  if (t === "berita") return "Berita"
  if (t === "promo") return "Banner"
  if (t === "tim") return "Tim"
  return "Pengaturan"
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [depts, setDepts] = useState<LayananDept[]>(DEFAULT_DEPTS)
  const [tab, setTab] = useState<Tab>("portfolio")
  const [deptFilter, setDeptFilter] = useState<DeptFilter>("semua")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchDepts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tipe")
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) setDepts(data.length > 0 ? data : DEFAULT_DEPTS)
    } catch {}
  }, [])

  const getDept = (value: string) => depts.find(d => d.value === value)

  const [katModal, setKatModal] = useState(false)
  const [katEdit, setKatEdit] = useState<KategoriRow | null>(null)
  // Modal departemen: dipakai saat sub-tab Departemen aktif.
  const [deptModal, setDeptModal] = useState(false)
  const [deptEdit, setDeptEdit] = useState<LayananDept | null>(null)
  // Sub-tab di dalam tab Kategori: satu tempat untuk empat cakupan.
  const [katScope, setKatScope] = useState<KategoriScope | "departemen">("layanan")
  const [search, setSearch] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  const [portfolioData, setPortfolioData] = useState<Portfolio[]>([])
  const [layananData, setLayananData] = useState<Layanan[]>([])
  const [informasiData, setInformasiData] = useState<Informasi[]>([])
  const [timData, setTimData] = useState<TimMember[]>([])
  const [beritaData, setBeritaData] = useState<Berita[]>([])
  const [promoData, setPromoData] = useState<PromoBanner[]>([])
  const [kategoriData, setKategoriData] = useState<KategoriRow[]>([])

  // Penyaring kategori per modul. Dipakai form Layanan, Berita, dan Informasi
  // supaya tiap form hanya menampilkan kategorinya sendiri.
  const kategoriBerita = kategoriData.filter((k) => k.scope === "berita")
  const kategoriLayanan = kategoriData.filter((k) => k.scope === "layanan")
  const kategoriInformasi = kategoriData.filter((k) => k.scope === "informasi")

  /** Label kategori untuk sebuah slug; tampilkan slug apa adanya bila tak ada. */
  const kategoriLabel = (scope: KategoriScope, slug: string): string =>
    kategoriData.find((k) => k.scope === scope && k.slug === slug)?.label ?? slug
  const kategoriLabelBerita = (slug: string) => kategoriLabel("berita", slug)
  const [loadingP, setLoadingP] = useState(true)
  const [loadingL, setLoadingL] = useState(true)
  const [loadingI, setLoadingI] = useState(true)
  const [loadingT, setLoadingT] = useState(true)
  const [loadingB, setLoadingB] = useState(true)
  const [loadingPm, setLoadingPm] = useState(true)
  const [loadingK, setLoadingK] = useState(true)

  const [toasts, setToasts] = useState<Toast[]>([])
  const toastCounter = useRef(0)

  const [pfModal, setPfModal] = useState(false)
  const [pfEdit, setPfEdit] = useState<Portfolio | null>(null)
  const [lvModal, setLvModal] = useState(false)
  const [lvEdit, setLvEdit] = useState<Layanan | null>(null)
  const [inModal, setInModal] = useState(false)
  const [inEdit, setInEdit] = useState<Informasi | null>(null)
  const [timModal, setTimModal] = useState(false)
  const [timEdit, setTimEdit] = useState<TimMember | null>(null)
  const [brModal, setBrModal] = useState(false)
  const [brEdit, setBrEdit] = useState<Berita | null>(null)
  const [pmModal, setPmModal] = useState(false)
  const [pmEdit, setPmEdit] = useState<PromoBanner | null>(null)
  // `table` bisa "tipe" untuk departemen: datanya di tabel layanan_depts,
  // bukan salah satu dari tabel konten biasa.
  const [deleteTarget, setDeleteTarget] = useState<{ table: Tab | "tipe"; id: string; name: string; scope?: KategoriScope } | null>(null)
  const deleteRef = useRef<{ table: Tab | "tipe"; id: string; name: string; scope?: KategoriScope } | null>(null)

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    const id = ++toastCounter.current
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  const fetchPortfolio = useCallback(async () => {
    setLoadingP(true)
    const res = await fetch("/api/admin/portfolio")
    if (!res.ok) showToast("Gagal memuat portfolio", "error")
    else setPortfolioData(await res.json())
    setLoadingP(false)
  }, [showToast])

  const fetchLayanan = useCallback(async () => {
    setLoadingL(true)
    const res = await fetch("/api/admin/layanan")
    if (!res.ok) showToast("Gagal memuat layanan", "error")
    else setLayananData(await res.json())
    setLoadingL(false)
  }, [showToast])

  const fetchTim = useCallback(async () => {
    setLoadingT(true)
    const res = await fetch("/api/admin/tim")
    if (!res.ok) showToast("Gagal memuat tim", "error")
    else setTimData(await res.json())
    setLoadingT(false)
  }, [showToast])

  const fetchInformasi = useCallback(async () => {
    setLoadingI(true)
    const res = await fetch("/api/admin/informasi")
    if (!res.ok) showToast("Gagal memuat informasi", "error")
    else setInformasiData(await res.json())
    setLoadingI(false)
  }, [showToast])

  const fetchBerita = useCallback(async () => {
    setLoadingB(true)
    const res = await fetch("/api/admin/berita")
    if (!res.ok) showToast("Gagal memuat berita", "error")
    else setBeritaData(await res.json())
    setLoadingB(false)
  }, [showToast])

  const fetchPromo = useCallback(async () => {
    setLoadingPm(true)
    const res = await fetch("/api/admin/promo")
    if (!res.ok) showToast("Gagal memuat banner", "error")
    else setPromoData(await res.json())
    setLoadingPm(false)
  }, [showToast])

  // Kategori terpusat: satu endpoint melayani Layanan, Berita, dan Informasi.
  // Data disimpan lengkap lalu disaring per scope saat dipakai.
  const fetchKategori = useCallback(async () => {
    setLoadingK(true)
    const res = await fetch("/api/admin/kategori")
    if (!res.ok) showToast("Gagal memuat kategori", "error")
    else setKategoriData(await res.json())
    setLoadingK(false)
  }, [showToast])

  useEffect(() => { fetchDepts(); fetchPortfolio(); fetchLayanan(); fetchInformasi(); fetchKategori(); fetchTim(); fetchBerita(); fetchPromo() }, [fetchDepts, fetchPortfolio, fetchLayanan, fetchInformasi, fetchKategori, fetchTim, fetchBerita, fetchPromo])

  const filteredPortfolio = portfolioData.filter(p => {
    const matchDept = deptFilter === "semua" || p.dept === deptFilter
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
    return matchDept && matchSearch
  })

  const filteredLayanan = layananData.filter(l => {
    const matchDept = deptFilter === "semua" || l.dept === deptFilter
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase())
    return matchDept && matchSearch
  })

  const filteredInformasi = informasiData.filter(b => {
    if (!search) return true
    const q = search.toLowerCase()
    return b.title.toLowerCase().includes(q)
      || (b.excerpt ?? "").toLowerCase().includes(q)
  })

  const filteredBerita = beritaData.filter(b => {
    if (!search) return true
    const q = search.toLowerCase()
    return b.title.toLowerCase().includes(q)
      || (b.excerpt ?? "").toLowerCase().includes(q)
      || (kategoriLabelBerita(b.category) ?? "").toLowerCase().includes(q)
  })

  const filteredKategori = kategoriData.filter(k => {
    // Hanya kategori dari cakupan yang sedang dibuka.
    if (k.scope !== katScope) return false
    if (!search) return true
    const q = search.toLowerCase()
    return k.label.toLowerCase().includes(q)
      || k.slug.toLowerCase().includes(q)
      || (k.description ?? "").toLowerCase().includes(q)
  })

  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    const target = deleteRef.current
    if (!target || deleting) return
    setDeleting(true)
    try {
      // Departemen dihapus lewat endpoint sendiri karena tabelnya berbeda.
      if ((target.table as string) === "tipe") {
        const res = await fetch(`/api/admin/tipe?value=${encodeURIComponent(target.id)}`, { method: "DELETE" })
        if (!res.ok) throw new Error((await res.json()).error ?? "Gagal menghapus departemen")
        setDeleteTarget(null); deleteRef.current = null
        fetchDepts(); fetchLayanan()
        showToast("Departemen dihapus")
        return
      }
      // Kategori informasi memakai kolom `slug` sebagai kunci, bukan `id`.
      const res = target.table === "kategori"
        ? await fetch(`/api/admin/kategori?scope=${encodeURIComponent((target as { scope?: string }).scope ?? "informasi")}&slug=${encodeURIComponent(target.id)}`, { method: "DELETE" })
        : await fetch(`/api/admin/${target.table}?id=${target.id}`, { method: "DELETE" })
      if (!res.ok) {
        let errMsg = "Delete gagal"
        try { errMsg = (await res.json()).error ?? errMsg } catch {}
        showToast(errMsg, "error"); return
      }
      showToast("Data berhasil dihapus")
      setDeleteTarget(null); deleteRef.current = null
      if (target.table === "portfolio") fetchPortfolio()
      else if (target.table === "layanan") fetchLayanan()
      else if (target.table === "informasi") fetchInformasi()
      else if (target.table === "kategori") fetchKategori()
      else if (target.table === "berita") fetchBerita()
      else if (target.table === "promo") fetchPromo()
      else fetchTim()
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete gagal", "error")
    } finally { setDeleting(false) }
  }

  const switchTab = (t: Tab) => {
    setTab(t); setDeptFilter("semua"); setSearch(""); setShowSearch(false); setSidebarOpen(false)
    if (t === "tim") fetchTim()
    else if (t === "berita") fetchBerita()
    else if (t === "promo") fetchPromo()
    else if (t === "kategori") fetchKategori()
  }

  const handleAdd = () => {
    // Sub-tab Departemen punya modalnya sendiri: datanya di tabel
    // layanan_depts, bukan tabel kategori.
    if (tab === "kategori" && katScope === "departemen") {
      setDeptEdit(null); setDeptModal(true); return
    }
    if (tab === "portfolio") { setPfEdit(null); setPfModal(true) }
    else if (tab === "layanan") { setLvEdit(null); setLvModal(true) }
    else if (tab === "informasi") { setInEdit(null); setInModal(true) }
    else if (tab === "kategori") { setKatEdit(null); setKatModal(true) }
    else if (tab === "berita") { setBrEdit(null); setBrModal(true) }
    else if (tab === "promo") { setPmEdit(null); setPmModal(true) }
    else if (tab === "tim") { setTimEdit(null); setTimModal(true) }
  }

  const isLoading = (tab === "portfolio" && loadingP) || (tab === "layanan" && loadingL) || (tab === "informasi" && loadingI) || (tab === "kategori" && loadingK) || (tab === "tim" && loadingT) || (tab === "berita" && loadingB) || (tab === "promo" && loadingPm)

  return (
    <div className="min-h-screen bg-navy text-white font-sans">

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 z-50 w-[210px] bg-[#242c29] border-r border-white/[0.07] flex flex-col transition-transform duration-200 ease-out",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-white/[0.07] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-powder flex items-center justify-center flex-shrink-0">
            <Map size={13} className="text-carbon" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-[12.5px] tracking-tight leading-none">SAYBA ARC</p>
            <p className="text-[9.5px] text-white/30 mt-0.5">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/30 hover:text-white/70 p-1">
            <X size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 px-2 mb-2">Menu</p>
          {(["portfolio", "layanan", "informasi", "kategori", "berita", "promo", "tim"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12.5px] font-medium transition-all",
                tab === t ? "bg-powder/10 text-powder" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              )}
            >
              {tabIcon(t, 13)}
              {tabLabel(t)}
              <span className={cn("ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md", tab === t ? "bg-powder/20 text-powder" : "bg-white/[0.06] text-white/30")}>
                {t === "portfolio" ? portfolioData.length : t === "layanan" ? layananData.length : t === "informasi" ? informasiData.length : t === "kategori" ? kategoriData.length : t === "berita" ? beritaData.length : t === "promo" ? promoData.length : timData.length}
              </span>
            </button>
          ))}

          {tab === "layanan" && (
            <div className="pt-2 border-t border-white/[0.05] mt-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 px-2 mb-1.5 mt-2">Per Departemen</p>
              {depts.map(d => (
                <div key={d.value} className="flex items-center justify-between px-2.5 py-0.5">
                  <span className="text-[11px] text-white/30 truncate">{d.label}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/[0.04] text-white/25 ml-2 flex-shrink-0">
                    {layananData.filter(l => l.dept === d.value).length}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 px-2 mb-2">Info</p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
            >
              <Settings size={13} />Supabase
              <ExternalLink size={10} className="ml-auto opacity-50" />
            </a>
          </div>
        </nav>

        <div className="px-3 pb-4">
          <div className="bg-[#2d3733] border border-white/[0.06] rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-white/60">Supabase</p>
              <p className="text-[9.5px] text-white/25">Connected</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────── */}
      <div className="lg:ml-[210px] flex flex-col min-h-screen pb-[56px] lg:pb-0">

        {/* Header */}
        <header className="h-12 bg-[#242c29] border-b border-white/[0.07] flex items-center px-3 gap-2 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/40 hover:text-white/70 p-1.5 rounded-lg hover:bg-white/[0.05] transition-all flex-shrink-0"
          >
            <Menu size={18} />
          </button>

          <h1 className="font-bold text-[14px] flex-1 truncate">{tabLabel(tab)}</h1>

          {(tab === "portfolio" || tab === "layanan" || tab === "informasi" || tab === "kategori" || tab === "berita") && (
            <button
              onClick={() => setShowSearch(v => !v)}
              className={cn("p-1.5 rounded-lg transition-all", showSearch ? "text-powder bg-powder/10" : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]")}
            >
              <Search size={15} />
            </button>
          )}

          <button
            onClick={() => { if (tab === "portfolio") fetchPortfolio(); else if (tab === "layanan") fetchLayanan(); else if (tab === "informasi") fetchInformasi(); else if (tab === "kategori") fetchKategori(); else if (tab === "berita") fetchBerita(); else if (tab === "promo") fetchPromo(); else fetchTim() }}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
          >
            <RefreshCw size={14} className={cn(isLoading ? "animate-spin" : "")} />
          </button>

          <button
            onClick={handleAdd}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-powder text-carbon hover:bg-steel transition-all flex-shrink-0"
          >
            <Plus size={13} />
            <span className="hidden sm:inline">
              {tab === "kategori"
                ? `Tambah ${KATEGORI_SCOPES.find(x => x.value === katScope)?.label ?? "Kategori"}`
                : "Tambah"}
            </span>
          </button>
        </header>

        {/* Search bar (expandable) */}
        {showSearch && (tab === "portfolio" || tab === "layanan" || tab === "informasi" || tab === "kategori" || tab === "berita") && (
          <div className="bg-[#242c29] border-b border-white/[0.07] px-3 py-2 flex items-center gap-2">
            <Search size={12} className="text-white/25 flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Cari ${tab}…`}
              className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/25 outline-none"
            />
            {search && <button onClick={() => setSearch("")} className="text-white/30 hover:text-white/60"><X size={12} /></button>}
          </div>
        )}

        {/* Dept filter pills: hanya untuk konten yang memang ber-departemen */}
        {(tab === "portfolio" || tab === "layanan") && (
          <div className="bg-[#242c29] border-b border-white/[0.07] px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {(["semua", ...depts.map(d => d.value)] as DeptFilter[]).map(d => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap flex-shrink-0 transition-all",
                  deptFilter === d
                    ? "bg-powder/10 text-powder ring-1 ring-powder/20"
                    : "text-white/30 bg-white/[0.03] hover:text-white/50 hover:bg-white/[0.05]"
                )}
              >
                {d === "semua" ? "Semua" : getDept(d)?.label ?? d}
              </button>
            ))}
          </div>
        )}

        {/* Sub-tab Kategori: satu baris pilihan cakupan. Menggantikan
            keharusan berpindah tab untuk mengurus kategori tiap modul. */}
        {tab === "kategori" && (
          <div className="bg-[#242c29] border-b border-white/[0.07] px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {KATEGORI_SCOPES.map(sc => {
              const jumlah = sc.value === "departemen"
                ? depts.length
                : kategoriData.filter(k => k.scope === sc.value).length
              const aktif = katScope === sc.value
              return (
                <button
                  key={sc.value}
                  onClick={() => setKatScope(sc.value)}
                  title={sc.hint}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap flex-shrink-0 transition-all inline-flex items-center gap-1.5",
                    aktif
                      ? "bg-powder/10 text-powder ring-1 ring-powder/20"
                      : "text-white/30 bg-white/[0.03] hover:text-white/50 hover:bg-white/[0.05]"
                  )}
                >
                  {sc.label}
                  <span className={cn("text-[9.5px] font-bold px-1 py-0.5 rounded", aktif ? "bg-powder/20" : "bg-white/[0.06]")}>
                    {jumlah}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Main content */}
        <main className="p-3 sm:p-5 flex-1">
          {/* Stats */}
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-3 overflow-x-auto sm:overflow-visible scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
            <StatCard label="Total Portofolio" value={portfolioData.length} color="#f07a26" />
            <StatCard label="Total Layanan" value={layananData.length} color="#f07a26" />
            <StatCard label="Total Informasi" value={informasiData.length} color="#f07a26" />
            {depts.map(d => (
              <StatCard key={d.value} label={`Layanan ${d.label}`} value={layananData.filter(l => l.dept === d.value).length} color={d.color} />
            ))}
          </div>



          {/* Table card */}
          <div className="bg-[#242c29] border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07]">
              <p className="font-bold text-[13px] flex-1 truncate">
                {tab === "portfolio" ? "Daftar Portofolio"
                  : tab === "layanan" ? "Daftar Layanan"
                  : tab === "informasi" ? "Daftar Informasi"
                  : tab === "kategori"
                    ? (katScope === "departemen"
                        ? "Daftar Departemen"
                        : `Kategori ${KATEGORI_SCOPES.find(x => x.value === katScope)?.label ?? ""}`)
                  : tab === "berita" ? "Daftar Berita"
                  : tab === "promo" ? "Banner Carousel Beranda"
                  : "Daftar Anggota Tim"}
              </p>
              <span className="text-[10.5px] text-white/25 flex-shrink-0">
                {tab === "portfolio" ? filteredPortfolio.length : tab === "layanan" ? filteredLayanan.length : tab === "informasi" ? filteredInformasi.length : tab === "kategori" ? filteredKategori.length : tab === "berita" ? filteredBerita.length : tab === "promo" ? promoData.length : timData.length} item
              </span>
            </div>

            {tab === "portfolio" ? (
              <PortfolioTable
                data={filteredPortfolio} loading={loadingP} depts={depts}
                onEdit={p => { setPfEdit(p); setPfModal(true) }}
                onDelete={p => { const t = { table: "portfolio" as Tab, id: p.id, name: p.title }; deleteRef.current = t; setDeleteTarget(t) }}
              />
            ) : tab === "layanan" ? (
              <LayananTable
                data={filteredLayanan} loading={loadingL} depts={depts}
                onEdit={l => { setLvEdit(l); setLvModal(true) }}
                onDelete={l => { const t = { table: "layanan" as Tab, id: l.id, name: l.title }; deleteRef.current = t; setDeleteTarget(t) }}
              />
            ) : tab === "informasi" ? (
              <InformasiTable
                data={filteredInformasi} loading={loadingI} kategori={kategoriData}
                onEdit={p => { setInEdit(p); setInModal(true) }}
                onDelete={p => { const t = { table: "informasi" as Tab, id: p.id, name: p.title }; deleteRef.current = t; setDeleteTarget(t) }}
              />
            ) : tab === "kategori" ? (
              katScope === "departemen" ? (
                <DepartemenTable
                  data={depts} loading={false}
                  jumlahLayanan={v => layananData.filter(l => l.dept === v).length}
                  onEdit={d => { setDeptEdit(d); setDeptModal(true) }}
                  onDelete={d => {
                    const t = { table: "tipe" as const, id: d.value, name: d.label }
                    deleteRef.current = t
                    setDeleteTarget(t)
                  }}
                />
              ) : (
                <KategoriTable
                  data={filteredKategori} loading={loadingK}
                  scopeLabel={KATEGORI_SCOPES.find(x => x.value === katScope)?.label ?? "Kategori"}
                  onEdit={k => { setKatEdit(k); setKatModal(true) }}
                  onDelete={k => { const t = { table: "kategori" as Tab, id: k.slug, name: k.label, scope: k.scope }; deleteRef.current = t; setDeleteTarget(t) }}
                />
              )
            ) : tab === "berita" ? (
              <BeritaTable
                data={filteredBerita} loading={loadingB}
                labelKategori={kategoriLabelBerita}
                onEdit={b => { setBrEdit(b); setBrModal(true) }}
                onDelete={b => { const t = { table: "berita" as Tab, id: b.id, name: b.title }; deleteRef.current = t; setDeleteTarget(t) }}
              />
            ) : tab === "promo" ? (
              <PromoTable
                data={promoData} loading={loadingPm}
                onEdit={b => { setPmEdit(b); setPmModal(true) }}
                onDelete={b => { const t = { table: "promo" as Tab, id: b.id, name: b.alt }; deleteRef.current = t; setDeleteTarget(t) }}
              />
            ) : (
              <TimTable
                data={timData} loading={loadingT}
                onEdit={m => { setTimEdit(m); setTimModal(true) }}
                onDelete={m => { const t = { table: "tim" as Tab, id: m.id, name: m.name }; deleteRef.current = t; setDeleteTarget(t) }}
              />
            )}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ──────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#242c29] border-t border-white/[0.07] flex z-30 safe-area-pb">
        {(["portfolio", "layanan", "informasi", "kategori", "berita", "promo", "tim"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all",
              tab === t ? "text-powder" : "text-white/30"
            )}
          >
            {tabIcon(t, 16)}
            <span className="text-[8.5px] font-semibold">{tabLabel(t)}</span>
          </button>
        ))}
      </nav>

      {/* ── MODALS ─────────────────────────────────────────────── */}
      <TimModal open={timModal} initial={timEdit} onClose={() => setTimModal(false)}
        onSaved={() => { setTimModal(false); fetchTim(); showToast(timEdit ? "Anggota tim diperbarui" : "Anggota tim ditambahkan") }}
        onError={(msg, t) => showToast(msg, t)} />
      <PortfolioModal open={pfModal} initial={pfEdit} depts={depts} onClose={() => setPfModal(false)}
        onSaved={() => { setPfModal(false); fetchPortfolio(); showToast(pfEdit ? "Portofolio diperbarui" : "Portofolio ditambahkan") }}
        onError={showToast} />
      <LayananModal open={lvModal} initial={lvEdit} depts={depts} allLayanan={layananData} onClose={() => setLvModal(false)}
        onSaved={() => { setLvModal(false); fetchLayanan(); showToast(lvEdit ? "Layanan diperbarui" : "Layanan ditambahkan") }}
        onError={showToast} />
      <InformasiModal open={inModal} initial={inEdit} kategori={kategoriData} onClose={() => setInModal(false)}
        onSaved={() => { setInModal(false); fetchInformasi(); showToast(inEdit ? "Informasi diperbarui" : "Informasi ditambahkan") }}
        onError={showToast} />
      <BeritaModal open={brModal} initial={brEdit} kategori={kategoriBerita} labelKategori={kategoriLabelBerita} allBerita={beritaData} onClose={() => setBrModal(false)}
        onSaved={() => { setBrModal(false); fetchBerita(); showToast(brEdit ? "Berita diperbarui" : "Berita ditambahkan") }}
        onError={showToast} />
      <PromoModal open={pmModal} initial={pmEdit} nextOrder={promoData.length + 1} onClose={() => setPmModal(false)}
        onSaved={() => { setPmModal(false); fetchPromo(); showToast(pmEdit ? "Banner diperbarui" : "Banner ditambahkan") }}
        onError={showToast} />
      <DepartemenModal open={deptModal} initial={deptEdit}
        onClose={() => setDeptModal(false)}
        onSaved={() => { setDeptModal(false); fetchDepts(); fetchLayanan(); showToast(deptEdit ? "Departemen diperbarui" : "Departemen ditambahkan") }}
        onError={showToast} />
      <KategoriModal open={katModal} initial={katEdit}
        defaultScope={(katScope === "departemen" ? "layanan" : katScope) as KategoriScope}
        onClose={() => setKatModal(false)}
        onSaved={() => { setKatModal(false); fetchKategori(); showToast(katEdit ? "Kategori diperbarui" : "Kategori ditambahkan") }}
        onError={showToast} />

      <Modal open={!!deleteTarget} onClose={() => { deleteRef.current = null; setDeleteTarget(null) }} maxW="max-w-sm">
        <ModalHeader icon={<Trash2 size={15} className="text-red-400" />} iconBg="bg-red-500/10" title="Konfirmasi Hapus" onClose={() => { deleteRef.current = null; setDeleteTarget(null) }} />
        <div className="px-4 py-4">
          <p className="text-[13px] text-white/60 leading-relaxed">
            Yakin hapus <span className="text-white font-semibold">"{deleteTarget?.name}"</span>? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <ModalFooter>
          <button onClick={() => { deleteRef.current = null; setDeleteTarget(null) }} disabled={deleting} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20 transition-all disabled:opacity-50">Batal</button>
          <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50">
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {deleting ? "Menghapus…" : "Ya, Hapus"}
          </button>
        </ModalFooter>
      </Modal>

      {/* Toasts */}
      <div className="fixed bottom-16 lg:bottom-5 right-3 flex flex-col gap-2 z-[999] max-w-[calc(100vw-24px)]">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[12px] font-medium shadow-xl bg-[#2d3733]",
            t.type === "success" ? "border-emerald-500/25" : "border-red-500/25"
          )}>
            {t.type === "success"
              ? <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
              : <AlertCircle size={14} className="text-red-400 flex-shrink-0" />}
            <span className="truncate">{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[#242c29] border border-white/[0.07] rounded-xl p-2.5 sm:p-3 relative overflow-hidden hover:border-white/10 transition-colors min-w-[122px] flex-shrink-0 sm:min-w-0 sm:flex-shrink">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
      <p className="text-[9px] font-bold uppercase tracking-wider text-white/25 mb-1 sm:mb-1.5 leading-tight truncate">{label}</p>
      <p className="text-[21px] sm:text-[26px] font-extrabold leading-none tracking-tight" style={{ color }}>{value}</p>
    </div>
  )
}

// ── Mobile card row ────────────────────────────────────────────────────────
function CardRow({ children, actions }: { children: React.ReactNode; actions: React.ReactNode }) {
  return (
    <div className="border-b border-white/[0.04] px-4 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
      <div className="flex-1 min-w-0">{children}</div>
      <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">{actions}</div>
    </div>
  )
}

// ── Portfolio Table ────────────────────────────────────────────────────────
function PortfolioTable({ data, loading, onEdit, onDelete, depts }: {
  data: Portfolio[]; loading: boolean; depts: LayananDept[]
  onEdit: (p: Portfolio) => void; onDelete: (p: Portfolio) => void
}) {
  if (loading) return <TableLoading />
  if (!data.length) return <TableEmpty label="portofolio" />
  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["Judul & Deskripsi", "Dept", "Slug", "Status", "Aksi"].map(h => (
                <th key={h} className="text-left text-[9.5px] font-bold uppercase tracking-widest text-white/20 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(p => (
              <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3">
                  <p className="text-[13px] font-medium text-white">{p.title}</p>
                  {p.description && <p className="text-[11px] text-white/30 mt-0.5 max-w-[240px] truncate">{p.description}</p>}
                </td>
                <td className="px-4 py-3"><DeptBadge dept={p.dept} depts={depts} /></td>
                <td className="px-4 py-3"><code className="text-[10px] bg-[#2d3733] text-white/40 px-1.5 py-0.5 rounded-md">{p.slug}</code></td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(p)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={12} /></button>
                    <button onClick={() => onDelete(p)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden">
        {data.map(p => (
          <CardRow key={p.id} actions={<><button onClick={() => onEdit(p)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={13} /></button><button onClick={() => onDelete(p)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={13} /></button></>}>
            <p className="text-[13px] font-medium text-white truncate">{p.title}</p>
            {p.description && <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">{p.description}</p>}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <DeptBadge dept={p.dept} depts={depts} />
              <StatusBadge status={p.status} />
              <code className="text-[10px] text-white/25">{p.slug}</code>
            </div>
          </CardRow>
        ))}
      </div>
    </>
  )
}

// ── Layanan Table ──────────────────────────────────────────────────────────
function LayananTable({ data, loading, onEdit, onDelete, depts }: {
  data: Layanan[]; loading: boolean; depts: LayananDept[]
  onEdit: (l: Layanan) => void; onDelete: (l: Layanan) => void
}) {
  if (loading) return <TableLoading />
  if (!data.length) return <TableEmpty label="layanan" />
  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["Judul & Deskripsi", "Tipe / Sub-Kategori", "Slug", "Gambar / Icon", "Harga", "Status", "Aksi"].map(h => (
                <th key={h} className="text-left text-[9.5px] font-bold uppercase tracking-widest text-white/20 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(l => (
              <tr key={l.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-medium text-white">{l.title}</p>
                    {l.featured_order !== null && l.featured_order !== undefined && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-powder/15 text-powder text-[9px] font-bold"><Star size={9} className="inline -mt-px" aria-hidden="true" /> #{l.featured_order}</span>
                    )}
                  </div>
                  {l.description && <p className="text-[11px] text-white/30 mt-0.5 max-w-[200px] truncate">{l.description}</p>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <DeptBadge dept={l.dept} depts={depts} />
                    {l.category && <span className="inline-flex items-center gap-1 text-[10px] text-white/35"><Tag size={8} />{l.category}</span>}
                  </div>
                </td>
                <td className="px-4 py-3"><code className="text-[10px] bg-[#2d3733] text-white/40 px-1.5 py-0.5 rounded-md">/services/{l.slug}</code></td>
                <td className="px-4 py-3">
                  {(l as any).image_url ? (
                    <div className="w-14 h-10 rounded-lg overflow-hidden border border-white/[0.07] bg-[#2d3733] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={gdriveToImg((l as any).image_url)}
                        alt={l.title}
                        className="w-full object-cover"
                        style={{ height: "100%" }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                      />
                    </div>
                  ) : (
                    <code className="text-[10px] bg-powder/10 text-powder px-1.5 py-0.5 rounded-md">{l.icon || ", "}</code>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] text-white/40">
                    {l.featured_order ? `Unggulan #${l.featured_order}` : "Reguler"}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(l)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={12} /></button>
                    <button onClick={() => onDelete(l)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden">
        {data.map(l => (
          <CardRow key={l.id} actions={<><button onClick={() => onEdit(l)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={13} /></button><button onClick={() => onDelete(l)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={13} /></button></>}>
            <div className="flex items-center gap-1.5 truncate">
              <p className="text-[13px] font-medium text-white truncate">{l.title}</p>
              {l.featured_order !== null && l.featured_order !== undefined && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-powder/15 text-powder text-[9px] font-bold flex-shrink-0"> #{l.featured_order}</span>
              )}
            </div>
            {l.description && <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">{l.description}</p>}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <DeptBadge dept={l.dept} depts={depts} />
              <StatusBadge status={l.status} />
              {l.icon && !((l as any).image_url) && <code className="text-[10px] bg-powder/10 text-powder px-1.5 py-0.5 rounded-md">{l.icon}</code>}
              {(l as any).image_url && (
                <div className="w-10 h-7 rounded-md overflow-hidden border border-white/[0.07] bg-[#2d3733] flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gdriveToImg((l as any).image_url)} alt={l.title} className="w-full object-cover" style={{ height: "100%" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                </div>
              )}
            </div>
          </CardRow>
        ))}
      </div>
    </>
  )
}

// ── Portfolio Modal ────────────────────────────────────────────────────────
function PortfolioModal({ open, initial, onClose, onSaved, onError, depts }: {
  open: boolean; initial: Portfolio | null; depts: LayananDept[]
  onClose: () => void; onSaved: () => void; onError: (msg: string, t: "error") => void
}) {
  type PF = Omit<PortfolioInsert, "id" | "created_at" | "features" | "tech_stack" | "meta_keywords"> & { features: string; tech_stack: string; meta_keywords: string }
  const blank: PF = { title: "", slug: "", dept: (depts[0]?.value ?? "arcgis") as PF["dept"], category: "", description: "", image_url: "", result_url: "", features: "", tech_stack: "", status: "active", meta_title: "", meta_description: "", meta_keywords: "", og_image: "", canonical_url: "" }
  const [form, setForm] = useState<PF>(blank)
  const [saving, setSaving] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  // Files uploaded (or replaced) during this modal session. Only actually
  // deleted from Storage once we know the outcome, see handleSubmit/handleClose.
  const stagedUploads = useRef<Set<string>>(new Set())
  const replacedUrls = useRef<Set<string>>(new Set())
  const trackImageChange = (oldUrl: string, newUrl: string) => {
    if (oldUrl) replacedUrls.current.add(oldUrl)
    if (newUrl) stagedUploads.current.add(newUrl)
  }

  useEffect(() => {
    if (!open) return
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    if (initial) {
      const i = initial as any
      setForm({ title: initial.title, slug: initial.slug, dept: initial.dept, category: initial.category ?? "", description: initial.description ?? "", image_url: initial.image_url ?? "", result_url: initial.result_url ?? "", features: Array.isArray(initial.features) ? initial.features.join("\n") : "", tech_stack: Array.isArray(initial.tech_stack) ? initial.tech_stack.join("\n") : "", status: initial.status,
        meta_title: i.meta_title ?? "", meta_description: i.meta_description ?? "", meta_keywords: Array.isArray(i.meta_keywords) ? i.meta_keywords.join("\n") : "", og_image: i.og_image ?? "", canonical_url: i.canonical_url ?? "" })
      setSlugManual(true)
    } else { setForm(blank); setSlugManual(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const handleTitle = (v: string) => { set("title", v); if (!slugManual) set("slug", slugify(v)) }

  const handleClose = () => {
    stagedUploads.current.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.title || !form.slug) { onError("Judul dan slug wajib diisi", "error"); return }
    setSaving(true)
    const payload = { ...form, category: form.category || null, description: form.description || null, image_url: form.image_url || null, result_url: form.result_url || null, features: form.features ? form.features.split("\n").map(s => s.trim()).filter(Boolean) : null, tech_stack: form.tech_stack ? form.tech_stack.split("\n").map(s => s.trim()).filter(Boolean) : null,
      meta_title: form.meta_title || null, meta_description: form.meta_description || null,
      meta_keywords: form.meta_keywords ? form.meta_keywords.split("\n").map(s => s.trim()).filter(Boolean) : null,
      og_image: form.og_image || null, canonical_url: form.canonical_url || null }
    const res = initial
      ? await fetch(`/api/admin/portfolio?id=${initial.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSaving(false)
    if (!res.ok) { onError((await res.json()).error ?? "Save failed", "error"); return }
    const finalUrls = new Set([payload.image_url, payload.og_image].filter(Boolean) as string[])
    const toDelete = [...replacedUrls.current, ...stagedUploads.current].filter(u => !finalUrls.has(u))
    toDelete.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onSaved()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalHeader icon={<LayoutGrid size={15} className="text-powder" />} iconBg="bg-powder/10" title={initial ? "Edit Portofolio" : "Tambah Portofolio"} onClose={handleClose} />
      <div className="px-4 py-4 space-y-3.5 overflow-y-auto max-h-[75vh]">
        <Field label="Judul Proyek" required><Input value={form.title} onChange={handleTitle} placeholder="Sistem Pemetaan Tata Ruang" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug" required><Input value={form.slug} onChange={v => { setSlugManual(true); set("slug", v) }} placeholder="sistem-pemetaan" /></Field>
          <Field label="Departemen" required><Select value={form.dept} onChange={v => set("dept", v)} options={depts.map(d => ({ value: d.value, label: d.label }))} /></Field>
        </div>
        <Field label="Deskripsi"><Textarea value={form.description ?? ""} onChange={v => set("description", v)} placeholder="Deskripsi singkat proyek…" /></Field>

        {/* Bagian yang jarang diubah dikelompokkan supaya form tetap ringkas. */}
        <BagianLipat
          label="Tampilan & Hasil"
          ringkas={`${form.category || "tanpa kategori"} · ${form.status}${form.result_url ? " · ada tautan hasil" : ""}`}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kategori" hint="Teks bebas untuk pengelompokan internal."><Input value={form.category ?? ""} onChange={v => set("category", v)} placeholder="Web GIS…" /></Field>
            <Field label="Status" hint="Draft disembunyikan dari publik."><Select value={form.status} onChange={v => set("status", v)} options={[{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }]} /></Field>
          </div>

          <Field label="URL Hasil Proyek" hint="Tautan ke hasil atau demo proyek (opsional)."><Input value={form.result_url ?? ""} onChange={v => set("result_url", v)} placeholder="https://link-hasil.com" /></Field>

          <ImageUploadField value={form.image_url ?? ""} onChange={v => set("image_url", v)} onTrackChange={trackImageChange} folder="portfolio" label="Gambar Utama" />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fitur (1 per baris)" hint="Poin-poin fitur utama proyek."><Textarea value={form.features} onChange={v => set("features", v)} placeholder={"Login\nDashboard\nExport PDF"} /></Field>
            <Field label="Tech Stack (1 per baris)" hint="Teknologi yang dipakai."><Textarea value={form.tech_stack} onChange={v => set("tech_stack", v)} placeholder={"Next.js\nPrisma\nPostgreSQL"} /></Field>
          </div>
        </BagianLipat>

        <SeoFields
          metaTitle={form.meta_title ?? ""} onMetaTitle={v => set("meta_title", v)}
          metaDescription={form.meta_description ?? ""} onMetaDescription={v => set("meta_description", v)}
          metaKeywords={form.meta_keywords} onMetaKeywords={v => set("meta_keywords", v)}
          canonicalUrl={form.canonical_url ?? ""} onCanonicalUrl={v => set("canonical_url", v)}
          ogImage={form.og_image ?? ""} onOgImage={v => set("og_image", v)}
          onTrackChange={trackImageChange}
          ogFolder="portfolio"
          titleFallback="Judul Proyek"
          descFallback="Deskripsi"
          slugPlaceholder="https://sayba.id/portfolio/slug-lain"
        />

      </div>
      <ModalFooter>
        <button onClick={handleClose} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20 transition-all disabled:opacity-50">Batal</button>
        <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-powder text-carbon hover:bg-steel transition-all disabled:opacity-50">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </ModalFooter>
    </Modal>
  )
}


// ── Editor galeri multi-foto ────────────────────────────────────────────────
function GalleryEditor({ items, onChange, onTrackChange }: {
  items: string[]; onChange: (v: string[]) => void
  onTrackChange: (oldUrl: string, newUrl: string) => void
}) {
  const inputId = useId()
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState("")

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return
    setErr(""); setUploading(true)
    const added: string[] = []
    for (const file of Array.from(files)) {
      if (!isAllowedImageFile(file)) { setErr("Hanya gambar JPG, PNG, WebP, GIF, atau SVG yang diizinkan"); continue }
      if (file.size > 4.5 * 1024 * 1024) { setErr("Ukuran tiap file maksimal 4,5MB"); continue }
      const fd = new FormData(); fd.append("file", file); fd.append("folder", "layanan")
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      if (!res.ok) { setErr((await res.json()).error ?? "Upload gagal"); continue }
      const data = await res.json()
      onTrackChange("", data.url)
      added.push(data.url)
    }
    setUploading(false)
    if (added.length) onChange([...items, ...added])
  }

  const remove = (i: number) => { onTrackChange(items[i], ""); onChange(items.filter((_, idx) => idx !== i)) }
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items];[next[i], next[j]] = [next[j], next[i]]; onChange(next)
  }

  return (
    <Field label="Galeri Foto" hint="Beberapa gambar sekaligus. Tampil sebagai grid di halaman layanan; urutan mengikuti daftar ini (foto #1 paling atas).">
      <input id={inputId} type="file" multiple accept={IMAGE_ACCEPT} className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = "" }} />
      <label htmlFor={inputId} aria-disabled={uploading}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold bg-[#2d3733] border border-white/[0.07] text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer aria-disabled:opacity-50 aria-disabled:pointer-events-none">
        {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
        {uploading ? "Mengunggah…" : "Tambah Foto"}
      </label>
      {err && <p className="text-[10px] text-red-400 mt-1">{err}</p>}
      {items.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
          {items.map((url, i) => (
            <div key={`${url}-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-white/[0.07] bg-[#2d3733]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Galeri ${i + 1}`} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.25" }} />
              <span className="absolute top-1 left-1 text-[9px] font-bold text-white/80 bg-black/50 px-1 rounded">{i + 1}</span>
              <button type="button" onClick={() => remove(i)} className="absolute top-1 right-1 w-5 h-5 rounded-md bg-black/60 text-white/70 hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={11} /></button>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-1.5 py-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-white/70 hover:text-white disabled:opacity-25"><ChevronUp size={12} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-white/70 hover:text-white disabled:opacity-25"><ChevronDown size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Field>
  )
}

// ── Editor blok isi (sub-judul / paragraf / daftar / gambar) ────────────────
const BLOCK_TYPES: { type: ContentBlock["type"]; label: string; icon: React.ReactNode }[] = [
  { type: "heading", label: "Sub-judul", icon: <Heading size={11} /> },
  { type: "paragraph", label: "Paragraf", icon: <AlignLeft size={11} /> },
  { type: "list", label: "Daftar", icon: <ListOrdered size={11} /> },
  { type: "image", label: "Gambar", icon: <ImagePlus size={11} /> },
]

function ContentBlocksEditor({ blocks, onChange, onTrackChange }: {
  blocks: ContentBlock[]; onChange: (v: ContentBlock[]) => void
  onTrackChange: (oldUrl: string, newUrl: string) => void
}) {
  const update = (i: number, patch: Partial<ContentBlock>) => { const next = [...blocks]; next[i] = { ...next[i], ...patch }; onChange(next) }
  const add = (type: ContentBlock["type"]) => onChange([...blocks, type === "image" ? { type, image_url: "", caption: "" } : { type, text: "" }])
  const remove = (i: number) => { const b = blocks[i]; if (b.type === "image" && b.image_url) onTrackChange(b.image_url, ""); onChange(blocks.filter((_, idx) => idx !== i)) }
  const move = (i: number, dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= blocks.length) return; const next = [...blocks];[next[i], next[j]] = [next[j], next[i]]; onChange(next) }
  const meta = (t: ContentBlock["type"]) => BLOCK_TYPES.find(x => x.type === t)

  return (
    <Field label="Blok Isi Halaman" hint="Susun isi halaman layanan dari potongan-potongan: sub-judul, paragraf, daftar berbutir, atau gambar. Urutannya bebas dan bisa digeser.">
      <div className="space-y-2">
        {blocks.map((b, i) => (
          <div key={i} className="rounded-lg border border-white/[0.07] bg-[#2d3733] p-2.5 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-powder bg-powder/10 px-1.5 py-0.5 rounded">
                {meta(b.type)?.icon}{meta(b.type)?.label ?? b.type}
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-white/30 hover:text-white disabled:opacity-20"><ChevronUp size={12} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className="text-white/30 hover:text-white disabled:opacity-20"><ChevronDown size={12} /></button>
                <button type="button" onClick={() => remove(i)} className="text-white/30 hover:text-red-400"><X size={12} /></button>
              </div>
            </div>
            {b.type === "heading" && <Input value={b.text ?? ""} onChange={v => update(i, { text: v })} placeholder="Sub-judul bagian…" />}
            {b.type === "paragraph" && <Textarea value={b.text ?? ""} onChange={v => update(i, { text: v })} placeholder="Tulis satu paragraf…" />}
            {b.type === "list" && (
              <>
                <Textarea value={b.text ?? ""} onChange={v => update(i, { text: v })} placeholder={"Butir pertama\nButir kedua\nButir ketiga"} />
                <p className="text-[10px] text-white/25">Tulis satu butir per baris.</p>
              </>
            )}
            {b.type === "image" && (
              <>
                <ImageUploadField value={b.image_url ?? ""} onChange={v => update(i, { image_url: v })} onTrackChange={onTrackChange} folder="layanan" label="Gambar Blok" />
                <Input value={b.caption ?? ""} onChange={v => update(i, { caption: v })} placeholder="Keterangan gambar (opsional)" />
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {BLOCK_TYPES.map(t => (
          <button key={t.type} type="button" onClick={() => add(t.type)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[#2d3733] border border-white/[0.07] text-white/50 hover:text-powder hover:border-powder/30 transition-all">
            <Plus size={11} />{t.label}
          </button>
        ))}
      </div>
    </Field>
  )
}

// ── Editor FAQ per layanan ──────────────────────────────────────────────────
function FaqEditor({ items, onChange }: { items: LayananFAQ[]; onChange: (v: LayananFAQ[]) => void }) {
  const update = (i: number, patch: Partial<LayananFAQ>) => { const next = [...items]; next[i] = { ...next[i], ...patch }; onChange(next) }
  const move = (i: number, dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= items.length) return; const next = [...items];[next[i], next[j]] = [next[j], next[i]]; onChange(next) }
  return (
    <Field label="FAQ (Pertanyaan Umum)" hint="Tanya-jawab yang tampil sebagai akordeon di halaman layanan. Kosongkan bila tidak diperlukan.">
      <div className="space-y-2">
        {items.map((f, i) => (
          <div key={i} className="rounded-lg border border-white/[0.07] bg-[#2d3733] p-2.5 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-white/30">#{i + 1}</span>
              <div className="ml-auto flex items-center gap-1.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-white/30 hover:text-white disabled:opacity-20"><ChevronUp size={12} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-white/30 hover:text-white disabled:opacity-20"><ChevronDown size={12} /></button>
                <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-white/30 hover:text-red-400"><X size={12} /></button>
              </div>
            </div>
            <Input value={f.question} onChange={v => update(i, { question: v })} placeholder="Pertanyaan…" />
            <Textarea value={f.answer} onChange={v => update(i, { answer: v })} placeholder="Jawaban…" />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, { question: "", answer: "" }])}
        className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[#2d3733] border border-white/[0.07] text-white/50 hover:text-powder hover:border-powder/30 transition-all">
        <Plus size={11} />Tambah FAQ
      </button>
    </Field>
  )
}

// ── Editor tahap proses kerja (diagram alir) ────────────────────────────────
function ProcessStepsEditor({ steps, onChange }: { steps: ProcessStep[]; onChange: (v: ProcessStep[]) => void }) {
  const update = (i: number, patch: Partial<ProcessStep>) => { const next = [...steps]; next[i] = { ...next[i], ...patch }; onChange(next) }
  const move = (i: number, dir: -1 | 1) => { const j = i + dir; if (j < 0 || j >= steps.length) return; const next = [...steps];[next[i], next[j]] = [next[j], next[i]]; onChange(next) }
  return (
    <Field label="Tahap Proses Kerja" hint="Tahapan yang digambar sebagai diagram alir di halaman layanan. Kosongkan untuk memakai 6 tahap bawaan (Konsultasi → SPK → Invoice DP → Review → Pelunasan → Serah Terima).">
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="rounded-lg border border-white/[0.07] bg-[#2d3733] p-2.5 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-white/30">Tahap {i + 1}</span>
              <div className="ml-auto flex items-center gap-1.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-white/30 hover:text-white disabled:opacity-20"><ChevronUp size={12} /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === steps.length - 1} className="text-white/30 hover:text-white disabled:opacity-20"><ChevronDown size={12} /></button>
                <button type="button" onClick={() => onChange(steps.filter((_, idx) => idx !== i))} className="text-white/30 hover:text-red-400"><X size={12} /></button>
              </div>
            </div>
            <Input value={s.title} onChange={v => update(i, { title: v })} placeholder="Nama tahap, mis. Konsultasi" />
            <Textarea value={s.description ?? ""} onChange={v => update(i, { description: v })} placeholder="Penjelasan singkat tahap ini…" />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...steps, { title: "", description: "" }])}
        className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium bg-[#2d3733] border border-white/[0.07] text-white/50 hover:text-powder hover:border-powder/30 transition-all">
        <Plus size={11} />Tambah Tahap
      </button>
    </Field>
  )
}

// ── Layanan Modal ──────────────────────────────────────────────────────────
type LayananForm = {
  title: string; slug: string; dept: string; category: string; description: string
  icon: string; image_url: string; status: Status
  gallery: string[]; content_blocks: ContentBlock[]; faqs: LayananFAQ[]; process_steps: ProcessStep[]
  featured_order: number | null
  meta_title: string; meta_description: string; meta_keywords: string; og_image: string; canonical_url: string
}

function LayananModal({ open, initial, onClose, onSaved, onError, depts, allLayanan }: {
  open: boolean; initial: Layanan | null; depts: LayananDept[]; allLayanan: Layanan[]
  onClose: () => void; onSaved: () => void; onError: (msg: string, t: "error") => void
}) {
  const blank: LayananForm = {
    title: "", slug: "", dept: depts[0]?.value ?? "it_konsulting", category: "", description: "",
    icon: "map", image_url: "", status: "active", gallery: [], content_blocks: [], faqs: [], process_steps: [],
    featured_order: null,
    meta_title: "", meta_description: "", meta_keywords: "", og_image: "", canonical_url: "",
  }
  const [form, setForm] = useState<LayananForm>(blank)
  const [saving, setSaving] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  // Files uploaded (or replaced) during this modal session. Only actually
  // deleted from Storage once we know the outcome, see handleSubmit/handleClose.
  const stagedUploads = useRef<Set<string>>(new Set())
  const replacedUrls = useRef<Set<string>>(new Set())
  const trackImageChange = (oldUrl: string, newUrl: string) => {
    if (oldUrl) replacedUrls.current.add(oldUrl)
    if (newUrl) stagedUploads.current.add(newUrl)
  }

  useEffect(() => {
    if (!open) return
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    if (initial) {
      setForm({
        title: initial.title, slug: initial.slug, dept: initial.dept, category: initial.category ?? "",
        description: initial.description ?? "", icon: initial.icon ?? "map", image_url: initial.image_url ?? "",
        status: initial.status, gallery: initial.gallery ?? [], content_blocks: initial.content_blocks ?? [],
        faqs: initial.faqs ?? [], process_steps: initial.process_steps ?? [],
        featured_order: initial.featured_order ?? null,
        meta_title: initial.meta_title ?? "", meta_description: initial.meta_description ?? "",
        meta_keywords: (initial.meta_keywords ?? []).join("\n"), og_image: initial.og_image ?? "",
        canonical_url: initial.canonical_url ?? "",
      })
      setSlugManual(true)
    } else { setForm(blank); setSlugManual(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const set = <K extends keyof LayananForm>(k: K, v: LayananForm[K]) => setForm(f => ({ ...f, [k]: v }))
  const handleTitle = (v: string) => { set("title", v); if (!slugManual) set("slug", slugify(v)) }

  // Modal closed/cancelled without saving, none of this session's uploads
  // ever made it into the DB, so they're all safe (and only them) to delete.
  const handleClose = () => {
    stagedUploads.current.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.title || !form.slug) { onError("Nama dan slug wajib diisi", "error"); return }
    setSaving(true)
    const payload = {
      title: form.title, slug: form.slug, dept: form.dept, category: form.category || null,
      description: form.description || null, icon: form.icon || "map", image_url: form.image_url || null,
      gallery: form.gallery, content_blocks: form.content_blocks, faqs: form.faqs, process_steps: form.process_steps,
      status: form.status, featured_order: form.featured_order,
      meta_title: form.meta_title || null, meta_description: form.meta_description || null,
      meta_keywords: form.meta_keywords ? form.meta_keywords.split("\n").map(s => s.trim()).filter(Boolean) : null,
      og_image: form.og_image || null, canonical_url: form.canonical_url || null,
    }
    const res = initial
      ? await fetch(`/api/admin/layanan?id=${initial.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/layanan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSaving(false)
    if (!res.ok) { onError((await res.json()).error ?? "Save failed", "error"); return }
    // Saved successfully: anything replaced/abandoned along the way is now
    // safe to delete, as long as it isn't one of the URLs that actually got saved.
    const finalUrls = new Set([
      payload.image_url, payload.og_image,
      ...form.gallery,
      ...form.content_blocks.filter(b => b.type === "image" && b.image_url).map(b => b.image_url),
    ].filter(Boolean) as string[])
    const toDelete = [...replacedUrls.current, ...stagedUploads.current].filter(u => !finalUrls.has(u))
    toDelete.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onSaved()
  }

  const iconOptions = ["map", "globe", "database", "layers", "smartphone", "map-pin", "code", "monitor", "server", "layout", "cloud", "headphones", "shield-check", "zap", "plug", "users"]

  return (
    <Modal open={open} onClose={handleClose} maxW="max-w-2xl">
      <ModalHeader icon={<Layers size={15} className="text-powder" />} iconBg="bg-powder/10" title={initial ? "Edit Layanan" : "Tambah Layanan"} onClose={handleClose} />
      <div className="px-4 py-4 space-y-3.5 overflow-y-auto max-h-[70vh]">
        <Field label="Nama Layanan" required hint="Judul layanan yang tampil di daftar dan halaman layanan.">
          <Input value={form.title} onChange={handleTitle} placeholder="Pengembangan Web GIS" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug / Href" required hint={`Alamat akhir: /services/${form.slug || "slug"}. Huruf kecil, pakai tanda hubung.`}>
            <Input value={form.slug} onChange={v => { setSlugManual(true); set("slug", v) }} placeholder="web-gis-development" />
          </Field>
          <Field label="Departemen" required hint="Pilih salah satu dari dua departemen tetap.">
            <Select value={form.dept} onChange={v => set("dept", v)} options={depts.map(d => ({ value: d.value, label: d.label }))} />
          </Field>
        </div>

        <Field label="Deskripsi" hint="Ringkasan singkat layanan. Dipakai di kartu daftar dan sebagai Meta Description bila kolom SEO dikosongkan.">
          <Textarea value={form.description ?? ""} onChange={v => set("description", v)} placeholder="Deskripsi layanan…" />
        </Field>

        {/* Kolom tampilan dikelompokkan supaya form ringkas. Isian yang hampir
            selalu dibiarkan apa adanya tidak ikut memakan tempat. */}
        <BagianLipat
          label="Tampilan & Media"
          ringkas={`${form.icon ? `ikon: ${form.icon}` : "tanpa ikon"} · ${form.status}${form.category ? ` · ${form.category}` : ""}`}
        >
          <Field label="Icon (Lucide)" hint="Klik salah satu untuk mengisi, atau tulis sendiri nama ikon dari lucide.dev.">
            <Input value={form.icon ?? ""} onChange={v => set("icon", v)} placeholder="map, globe, code…" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {iconOptions.map(ic => (
                <button key={ic} type="button" onClick={() => set("icon", ic)}
                  className={cn("px-2 py-0.5 rounded-lg text-[10.5px] font-mono border transition-all",
                    form.icon === ic ? "bg-powder/10 text-powder border-powder/30" : "bg-[#2d3733] text-white/30 border-white/[0.06] hover:text-white/60")}>
                  {ic}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sub-Kategori" hint="Teks bebas untuk pengelompokan internal, mis. “Web GIS”. Boleh dikosongkan.">
              <Input value={form.category} onChange={v => set("category", v)} placeholder="Contoh: Web GIS…" />
            </Field>
            <Field label="Status" hint="Draft disembunyikan dari publik.">
              <Select value={form.status} onChange={v => set("status", v as Status)} options={[{ value: "active", label: "Active: tampil" }, { value: "draft", label: "Draft: tersembunyi" }, { value: "archived", label: "Archived: arsip" }]} />
            </Field>
          </div>

          <ImageUploadField value={form.image_url} onChange={v => set("image_url", v)} onTrackChange={trackImageChange} folder="layanan" label="Gambar Utama" />
          <p className="text-[10px] text-white/25 leading-relaxed -mt-1.5">
            Bila kolom gambar pratinjau sosial (og:image) di bagian SEO dikosongkan, gambar inilah yang dipakai
            saat tautan dibagikan.
          </p>
        </BagianLipat>

        <SeoFields
          metaTitle={form.meta_title} onMetaTitle={v => set("meta_title", v)}
          metaDescription={form.meta_description} onMetaDescription={v => set("meta_description", v)}
          metaKeywords={form.meta_keywords} onMetaKeywords={v => set("meta_keywords", v)}
          canonicalUrl={form.canonical_url} onCanonicalUrl={v => set("canonical_url", v)}
          ogImage={form.og_image} onOgImage={v => set("og_image", v)}
          onTrackChange={trackImageChange}
          ogFolder="layanan"
          titleFallback="Nama Layanan"
          descFallback="Deskripsi"
          slugPlaceholder="https://sayba.id/services/slug-lain"
        />

        {/* ── Layanan Unggulan ─────────────────────────── */}
        <div className="rounded-xl border border-powder/15 bg-powder/5 p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-powder">Layanan Unggulan</span>
            <span className="text-[10px] text-white/30">, tampil di beranda (maks 3 posisi)</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {([null, 1, 2, 3] as (number | null)[]).map(v => {
              const takenBy = v !== null ? allLayanan.find(l => l.featured_order === v && l.id !== initial?.id) : null
              const isSelected = form.featured_order === v
              const isTaken = !!takenBy
              return (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => set("featured_order", v)}
                  className={cn(
                    "relative px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all text-left",
                    isSelected
                      ? "bg-powder text-carbon border-powder"
                      : isTaken
                        ? "bg-yellow-500/8 text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/15"
                        : "bg-[#2d3733] text-white/40 border-white/[0.07] hover:text-white/70"
                  )}
                >
                  <span>{v === null ? "Tidak Unggulan" : `Posisi #${v}`}</span>
                  {isTaken && !isSelected && (
                    <span className="block text-[9px] font-normal opacity-70 truncate max-w-[100px]">{takenBy!.title}</span>
                  )}
                  {isTaken && isSelected && (
                    <span className="block text-[9px] font-normal opacity-80 truncate max-w-[100px]">akan geser: {takenBy!.title}</span>
                  )}
                </button>
              )
            })}
          </div>
          {form.featured_order !== null && (
            <>
              {(() => {
                const conflict = allLayanan.find(l => l.featured_order === form.featured_order && l.id !== initial?.id)
                return conflict ? (
                  <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                    <AlertTriangle size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-[11px] text-yellow-400/90 leading-relaxed">
                      Posisi #{form.featured_order} sudah dipakai oleh <span className="font-bold">"{conflict.title}"</span>. Menyimpan akan memindahkan layanan tersebut keluar dari unggulan.
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-powder/70">
                    Layanan ini akan tampil di posisi #{form.featured_order} pada bagian Layanan Unggulan di beranda.
                  </p>
                )
              })()}
            </>
          )}
        </div>
        {/* Empat editor isi halaman dikelompokkan dalam satu bagian. Layanan
            baru membuka form dalam keadaan ringkas; bagian ini terbuka sendiri
            kalau layanan yang sedang diedit memang sudah punya isinya. */}
        <BagianLipat
          label="Isi Halaman Lanjutan"
          ringkas={`${form.gallery.length} foto · ${form.content_blocks.length} blok isi · ${form.faqs.length} FAQ · ${form.process_steps.length} tahap`}
          /* Dihitung dari `initial` (data yang sedang diedit), BUKAN dari
             `form`. Saat modal baru dibuka, `form` masih berisi data lama
             karena diisi lewat useEffect; kalau dibaca dari `form`, bagian
             ini bisa terbuka atau tertutup salah untuk item berikutnya. */
          awalBuka={!!initial && (
            (initial.gallery?.length ?? 0) > 0 ||
            (initial.content_blocks?.length ?? 0) > 0 ||
            (initial.faqs?.length ?? 0) > 0 ||
            (initial.process_steps?.length ?? 0) > 0
          )}
        >
          <GalleryEditor items={form.gallery} onChange={v => set("gallery", v)} onTrackChange={trackImageChange} />
          <ContentBlocksEditor blocks={form.content_blocks} onChange={v => set("content_blocks", v)} onTrackChange={trackImageChange} />
          <FaqEditor items={form.faqs} onChange={v => set("faqs", v)} />
          <ProcessStepsEditor steps={form.process_steps} onChange={v => set("process_steps", v)} />
        </BagianLipat>
      </div>
      <ModalFooter>
        <button onClick={handleClose} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20 transition-all disabled:opacity-50">Batal</button>
        <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-powder text-carbon hover:bg-steel transition-all disabled:opacity-50">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </ModalFooter>
    </Modal>
  )
}

// ── Informasi Table ───────────────────────────────────────────────────────────
/** Label kategori dari daftar yang dikelola admin; fallback ke slug apa adanya. */
function kategoriLabel(kategori: KategoriRow[], slug: string): string {
  return kategori.find(k => k.slug === slug)?.label ?? slug
}

function InformasiTable({ data, loading, kategori, onEdit, onDelete }: {
  data: Informasi[]; loading: boolean; kategori: KategoriRow[]
  onEdit: (b: Informasi) => void; onDelete: (b: Informasi) => void
}) {
  if (loading) return <TableLoading />
  if (!data.length) return <TableEmpty label="informasi" />
  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["Judul & Ringkasan", "Kategori", "Slug", "Gambar", "Tanggal", "Status", "Aksi"].map(h => (
                <th key={h} className="text-left text-[9.5px] font-bold uppercase tracking-widest text-white/20 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(b => (
              <tr key={b.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {b.featured && <span className="text-[8.5px] font-black uppercase tracking-widest text-powder bg-powder/10 border border-powder/25 px-1.5 py-0.5 rounded-md flex-shrink-0">Sorotan</span>}
                    <p className="text-[13px] font-medium text-white truncate max-w-[260px]">{b.title}</p>
                  </div>
                  {b.excerpt && <p className="text-[11px] text-white/30 mt-0.5 max-w-[260px] truncate">{b.excerpt}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-[10px] text-white/35"><Tag size={8} />{kategoriLabel(kategori, b.category)}</span>
                </td>
                <td className="px-4 py-3"><code className="text-[10px] bg-[#2d3733] text-white/40 px-1.5 py-0.5 rounded-md">/informasi/{b.slug}</code></td>
                <td className="px-4 py-3">
                  {b.image_url ? (
                    <div className="w-14 h-10 rounded-lg overflow-hidden border border-white/[0.07] bg-[#2d3733] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gdriveToImg(b.image_url)} alt={b.title} className="w-full object-cover" style={{ height: "100%" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                    </div>
                  ) : <span className="text-[10px] text-white/20 italic">, </span>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11.5px] text-white/50">{beritaDateLabel(b.published_at)}</span>
                  <span className="block text-[10px] text-white/25">{b.read_minutes} mnt · {b.views.toLocaleString("id-ID")} dibaca</span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={`/informasi/${b.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><ExternalLink size={12} /></a>
                    <button onClick={() => onEdit(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={12} /></button>
                    <button onClick={() => onDelete(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden">
        {data.map(b => (
          <CardRow key={b.id} actions={<><button onClick={() => onEdit(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={13} /></button><button onClick={() => onDelete(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={13} /></button></>}>
            <p className="text-[13px] font-medium text-white truncate">{b.title}</p>
            {b.excerpt && <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">{b.excerpt}</p>}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {b.featured && <span className="text-[8.5px] font-black uppercase tracking-widest text-powder bg-powder/10 border border-powder/25 px-1.5 py-0.5 rounded-md">Sorotan</span>}
              <span className="text-[10px] text-white/35">{kategoriLabel(kategori, b.category)}</span>
              <StatusBadge status={b.status} />
              <span className="text-[10px] text-white/40">{beritaDateLabel(b.published_at)}</span>
            </div>
          </CardRow>
        ))}
      </div>
    </>
  )
}

// ── Informasi Modal ───────────────────────────────────────────────────────────
function InformasiModal({ open, initial, kategori, onClose, onSaved, onError }: {
  open: boolean; initial: Informasi | null; kategori: KategoriRow[]
  onClose: () => void; onSaved: () => void; onError: (msg: string, t: "error") => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const blank = {
    title: "", slug: "", excerpt: "", category: kategori[0]?.slug ?? "", image_url: "",
    author: "Tim SAYBA ARC", body: "", published_at: today, read_minutes: 3, views: 0,
    featured: false, tags: "", status: "active" as Status,
    meta_title: "", meta_description: "", meta_keywords: "", og_image: "", canonical_url: "",
  }
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  const stagedUploads = useRef<Set<string>>(new Set())
  const replacedUrls = useRef<Set<string>>(new Set())
  const trackImageChange = (oldUrl: string, newUrl: string) => {
    if (oldUrl) replacedUrls.current.add(oldUrl)
    if (newUrl) stagedUploads.current.add(newUrl)
  }

  useEffect(() => {
    if (!open) return
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    if (initial) {
      setForm({
        title: initial.title, slug: initial.slug, excerpt: initial.excerpt ?? "", category: initial.category,
        image_url: initial.image_url ?? "", author: initial.author, body: initial.body ?? "",
        published_at: initial.published_at.slice(0, 10), read_minutes: initial.read_minutes, views: initial.views,
        featured: initial.featured, tags: (initial.tags ?? []).join("\n"), status: initial.status,
        meta_title: initial.meta_title ?? "", meta_description: initial.meta_description ?? "",
        meta_keywords: (initial.meta_keywords ?? []).join("\n"), og_image: initial.og_image ?? "",
        canonical_url: initial.canonical_url ?? "",
      })
      setSlugManual(true)
    } else { setForm(blank); setSlugManual(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const handleTitle = (v: string) => { set("title", v); if (!slugManual) set("slug", slugifyTitle(v)) }

  const handleClose = () => {
    stagedUploads.current.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.title || !form.slug) { onError("Judul dan slug wajib diisi", "error"); return }
    if (!form.category) { onError("Pilih kategori informasi (kelola dulu di tab Kategori Informasi)", "error"); return }
    setSaving(true)
    const payload = {
      title: form.title, slug: form.slug, excerpt: form.excerpt || null, category: form.category,
      image_url: form.image_url || null, author: form.author || "Tim SAYBA ARC", body: form.body || null,
      published_at: form.published_at || today,
      read_minutes: Number(form.read_minutes) || 1,
      views: Number(form.views) || 0,
      featured: form.featured, status: form.status,
      tags: form.tags ? form.tags.split("\n").map(s => s.trim()).filter(Boolean) : null,
      meta_title: form.meta_title || null, meta_description: form.meta_description || null,
      meta_keywords: form.meta_keywords ? form.meta_keywords.split("\n").map(s => s.trim()).filter(Boolean) : null,
      og_image: form.og_image || null, canonical_url: form.canonical_url || null,
    }
    const res = initial
      ? await fetch(`/api/admin/informasi?id=${initial.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/informasi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSaving(false)
    if (!res.ok) { onError((await res.json()).error ?? "Save failed", "error"); return }
    const finalUrls = new Set([payload.image_url, payload.og_image].filter(Boolean) as string[])
    const toDelete = [...replacedUrls.current, ...stagedUploads.current].filter(u => !finalUrls.has(u))
    toDelete.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onSaved()
  }

  return (
    <Modal open={open} onClose={handleClose} maxW="max-w-2xl">
      <ModalHeader icon={<Newspaper size={15} className="text-powder" />} iconBg="bg-powder/10" title={initial ? "Edit Informasi" : "Tulis Informasi"} onClose={handleClose} />
      <div className="px-4 py-4 space-y-3.5 overflow-y-auto max-h-[75vh]">
        <Field label="Judul Artikel" required hint="Tampil sebagai judul halaman dan kartu di daftar Informasi.">
          <Input value={form.title} onChange={handleTitle} placeholder="Pemetaan Partisipatif Desa di Kalimantan Barat" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug / URL" required hint={`Alamat akhir: /informasi/${form.slug || "slug"}. Huruf kecil, pakai tanda hubung.`}>
            <Input value={form.slug} onChange={v => { setSlugManual(true); set("slug", v) }} placeholder="pemetaan-partisipatif-desa" />
          </Field>
          <Field label="Kategori" required hint={kategori.length ? "Daftar ini diatur di tab Kategori Informasi." : "Belum ada kategori: buat dulu di tab Kategori Informasi."}>
            <Select value={form.category} onChange={v => set("category", v)} options={kategori.map(c => ({ value: c.slug, label: c.label }))} />
          </Field>
        </div>

        <Field label="Ringkasan" hint="Tampil di kartu daftar informasi dan otomatis dipakai sebagai Meta Description bila kolom itu dikosongkan.">
          <Textarea value={form.excerpt} onChange={v => set("excerpt", v)} placeholder="Bagaimana data lapangan yang dikumpulkan bersama warga desa diubah menjadi basis data spasial…" />
          {form.body.trim() && (
            <button
              type="button"
              onClick={() => set("excerpt", ringkasDariIsi(form.body))}
              className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-medium text-powder/70 hover:text-powder transition-colors"
            >
              <Wand2 size={11} />
              Ambil dari isi artikel
            </button>
          )}
        </Field>

        <ImageUploadField value={form.image_url} onChange={v => set("image_url", v)} onTrackChange={trackImageChange} folder="informasi" label="Gambar Artikel (JPG/PNG/WebP/GIF/SVG)" />

        <Field
          label="Isi Artikel"
          hint='Pakai tombol di atas kotak tulis untuk mengatur bentuk tulisan. Tidak perlu menulis penanda apa pun secara manual. Tab "Pratinjau" menampilkan hasilnya persis seperti yang dilihat pembaca.'
        >
          <EditorIsi
            value={form.body}
            onChange={v => set("body", v)}
            onUsulWaktuBaca={m => set("read_minutes", String(m))}
          />
        </Field>

        {/* Kolom yang jarang diubah dikelompokkan supaya form tetap ringkas. */}
        <BagianLipat
          label="Detail & Publikasi"
          ringkas={`${form.author || "tanpa penulis"} · ${form.published_at} · ${form.status}${form.tags.trim() ? " · ada tag" : ""}`}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Penulis" hint="Nama yang tampil sebagai penulis artikel."><Input value={form.author} onChange={v => set("author", v)} placeholder="Tim GIS SAYBA ARC" /></Field>
            <Field label="Tanggal Terbit" hint="Tanggal resmi artikel dipublikasikan.">
              <input type="date" value={form.published_at} onChange={e => set("published_at", e.target.value)}
                className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-powder/40 transition-colors" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Waktu Baca (mnt)" hint="Tombol di editor isi mengisi ini otomatis.">
              <input type="number" min={1} value={form.read_minutes} onChange={e => set("read_minutes", e.target.value)}
                className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-powder/40 transition-colors" />
            </Field>
            <Field label="Jumlah Dibaca" hint="Hitungan tampilan awal.">
              <input type="number" min={0} value={form.views} onChange={e => set("views", e.target.value)}
                className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-powder/40 transition-colors" />
            </Field>
            <Field label="Status" hint="Draft disembunyikan dari publik.">
              <Select value={form.status} onChange={v => set("status", v)} options={[{ value: "active", label: "Active: tampil" }, { value: "draft", label: "Draft: tersembunyi" }, { value: "archived", label: "Archived: arsip" }]} />
            </Field>
          </div>

          <Field label="Tag (1 per baris)" hint="Kata kunci internal untuk pengelompokan dan pencarian.">
            <Textarea value={form.tags} onChange={v => set("tags", v)} placeholder={"ArcGIS\nSurvei Lapangan\nTata Ruang"} />
          </Field>
        </BagianLipat>

        <button
          type="button"
          onClick={() => set("featured", !form.featured)}
          className={cn("w-full flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all",
            form.featured ? "border-powder/40 bg-powder/[0.07]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20")}
        >
          <span className={cn("mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all",
            form.featured ? "bg-powder border-powder" : "border-white/20")}>
            {form.featured && <CheckCircle size={11} className="text-carbon" />}
          </span>
          <span>
            <span className={cn("block text-[12.5px] font-semibold", form.featured ? "text-powder" : "text-white/70")}>Jadikan artikel Sorotan</span>
            <span className="block text-[10.5px] text-white/30 mt-0.5">Tampil sebagai kartu besar di atas halaman /informasi. Hanya satu artikel yang bisa jadi Sorotan: menandai ini otomatis melepas tanda dari artikel lain.</span>
          </span>
        </button>

        <SeoFields
          metaTitle={form.meta_title} onMetaTitle={v => set("meta_title", v)}
          metaDescription={form.meta_description} onMetaDescription={v => set("meta_description", v)}
          metaKeywords={form.meta_keywords} onMetaKeywords={v => set("meta_keywords", v)}
          canonicalUrl={form.canonical_url} onCanonicalUrl={v => set("canonical_url", v)}
          ogImage={form.og_image} onOgImage={v => set("og_image", v)}
          onTrackChange={trackImageChange}
          ogFolder="informasi"
          titleFallback="Judul"
          descFallback="Ringkasan"
          slugPlaceholder="https://sayba.id/informasi/slug-lain"
        />
      </div>
      <ModalFooter>
        <button onClick={handleClose} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20 transition-all disabled:opacity-50">Batal</button>
        <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-powder text-carbon hover:bg-steel transition-all disabled:opacity-50">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </ModalFooter>
    </Modal>
  )
}



// ── Reusable UI ────────────────────────────────────────────────────────────
function Modal({ open, onClose, maxW = "max-w-lg", children }: { open: boolean; onClose: () => void; maxW?: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={cn("bg-[#242c29] border border-white/[0.07] w-full sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl", maxW)}>{children}</div>
    </div>
  )
}

function ModalHeader({ icon, iconBg, title, onClose }: { icon: React.ReactNode; iconBg: string; title: string; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>{icon}</div>
      <h2 className="font-bold text-[14px] flex-1">{title}</h2>
      <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors p-1 rounded-lg hover:bg-white/[0.06]"><X size={16} /></button>
    </div>
  )
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-white/[0.07]">{children}</div>
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-white/50 mb-1.5">{label}{required && <span className="text-powder ml-0.5">*</span>}</label>
      {children}
      {hint && <p className="text-[10px] text-white/25 mt-1">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-powder/40 transition-colors" />
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-powder/40 transition-colors resize-y" />
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full appearance-none bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-powder/40 transition-colors pr-8">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  )
}

// Public URL prefix for objects in the "media" bucket, used to recognize
// (and clean up) our own uploads while leaving old Google Drive links alone.
const MEDIA_URL_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/media/`

function mediaPathFromUrl(url: string): string | null {
  if (!url.startsWith(MEDIA_URL_PREFIX)) return null
  return url.slice(MEDIA_URL_PREFIX.length)
}

async function deleteMediaFile(url: string) {
  const path = mediaPathFromUrl(url)
  if (!path) return
  try {
    await fetch(`/api/admin/upload?path=${encodeURIComponent(path)}`, { method: "DELETE" })
  } catch {
    // best-effort cleanup, a failed delete just leaves an orphaned file, not a broken UI
  }
}

function ImageUploadField({ value, onChange, folder, label = "Gambar (JPG/PNG/WebP/GIF/SVG)", onTrackChange }: {
  value: string; onChange: (v: string) => void; folder: "informasi" | "layanan" | "portfolio" | "tim" | "berita" | "promo"; label?: string
  // Reports (oldUrl, newUrl) whenever the field's value changes, so the
  // parent modal can decide when it's actually safe to delete the old file
  // (only after the record is saved, never on a cancelled edit).
  onTrackChange?: (oldUrl: string, newUrl: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState("")
  const inputId = useId()

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setErr("")
    if (!isAllowedImageFile(file)) { setErr("Hanya gambar JPG, PNG, WebP, GIF, atau SVG yang diizinkan"); return }
    if (file.size > 4.5 * 1024 * 1024) { setErr("Ukuran file maksimal 4,5MB: batas request Vercel"); return }

    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", folder)
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
    setUploading(false)
    if (!res.ok) { setErr((await res.json()).error ?? "Upload gagal"); return }
    const data = await res.json()
    onTrackChange?.(value, data.url)
    onChange(data.url)
  }

  const handleClear = () => {
    onTrackChange?.(value, "")
    onChange("")
  }

  return (
    <Field label={label} hint="JPG, PNG, WebP, GIF, atau SVG: maksimal 4,5MB. Setiap gambar otomatis dikonversi ke WebP dan dikompres di bawah 100KB; gambar besar ikut dikecilkan.">
      <input id={inputId} type="file" accept={IMAGE_ACCEPT} className="hidden"
        onChange={e => { handleFile(e.target.files?.[0]); e.target.value = "" }} />
      <div className="flex items-center gap-2">
        <label htmlFor={inputId} aria-disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold bg-[#2d3733] border border-white/[0.07] text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer aria-disabled:opacity-50 aria-disabled:pointer-events-none">
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
          {uploading ? "Mengunggah…" : "Upload Gambar"}
        </label>
        {value && (
          <button type="button" onClick={handleClear} className="text-[11px] text-white/30 hover:text-red-400 transition-colors">Hapus</button>
        )}
      </div>
      {err && <p className="text-[10px] text-red-400 mt-1">{err}</p>}
      {value && (
        <div className="mt-2 h-24 rounded-lg overflow-hidden border border-white/[0.07] bg-[#2d3733] relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="w-full object-contain" style={{ height: "100%" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
        </div>
      )}
    </Field>
  )
}

function TableLoading() {
  return <div className="flex items-center justify-center gap-2 py-10 text-white/30 text-[13px]"><Loader2 size={15} className="animate-spin" /> Memuat data…</div>
}

function TableEmpty({ label }: { label: string }) {
  return <div className="py-10 text-center text-white/25 text-[13px]"><LayoutGrid size={22} className="mx-auto mb-3 opacity-20" />Belum ada data {label}</div>
}

// ── SEO & Meta Tag (dipakai ulang oleh semua modal) ─────────────────────────
// Setiap kolom diberi penjelasan singkat + penghitung karakter supaya admin tahu
// batas aman sebelum Google memotong teksnya. Penghitung berubah warna saat
// melewati batas ideal, bukan memblokir, karena melewati batas itu tidak fatal.
function CharCount({ value, ideal }: { value: string; ideal: number }) {
  const n = value.length
  const over = n > ideal
  const near = !over && n > ideal * 0.9
  return (
    <span className={cn("text-[10px] font-medium tabular-nums", over ? "text-red-400" : near ? "text-amber-400" : "text-white/30")}>
      {n}/{ideal}
    </span>
  )
}


function SeoFields({
  metaTitle, onMetaTitle, metaDescription, onMetaDescription,
  metaKeywords, onMetaKeywords, canonicalUrl, onCanonicalUrl,
  ogImage, onOgImage, onTrackChange, ogFolder,
  titleFallback, descFallback, slugPlaceholder,
}: {
  metaTitle: string; onMetaTitle: (v: string) => void
  metaDescription: string; onMetaDescription: (v: string) => void
  metaKeywords: string; onMetaKeywords: (v: string) => void
  canonicalUrl: string; onCanonicalUrl: (v: string) => void
  ogImage: string; onOgImage: (v: string) => void
  onTrackChange: (oldUrl: string, newUrl: string) => void
  ogFolder: "informasi" | "layanan" | "portfolio" | "berita"
  titleFallback: string
  descFallback: string
  slugPlaceholder: string
}) {
  // Terbuka otomatis hanya kalau salah satu kolom SEO memang sudah terisi.
  // Halaman baru membuka panel ini dalam keadaan tertutup: SEO-nya sudah
  // diurus otomatis dari judul, deskripsi, dan gambar konten.
  const [buka, setBuka] = useState(
    Boolean(metaTitle || metaDescription || metaKeywords || canonicalUrl || ogImage)
  )
  const adaIsi = Boolean(metaTitle || metaDescription || metaKeywords || canonicalUrl || ogImage)

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-expanded={buka}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors"
      >
        <Info size={12} className="text-powder flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">SEO & Meta Tag</span>
        {adaIsi && !buka && (
          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-powder/15 text-powder">terisi</span>
        )}
        <span className="ml-auto text-[10.5px] text-white/30">{buka ? "Sembunyikan" : "Atur manual"}</span>
        {buka ? <ChevronUp size={13} className="text-white/30" /> : <ChevronDown size={13} className="text-white/30" />}
      </button>

      {buka && (
      <div className="px-4 pb-4 space-y-3.5 border-t border-white/[0.06] pt-3.5">
      <p className="text-[10.5px] text-white/30 leading-relaxed">
        <span className="text-white/50">SEO halaman ini sudah terisi otomatis</span> dari judul, deskripsi,
        dan gambar konten di atas: judul pencarian, cuplikan deskripsi, kata kunci, gambar pratinjau
        sosial, dan alamat kanonik semuanya diambil dari data itu. Panel ini hanya untuk
        <span className="text-white/50"> menimpa </span> hasil otomatis bila Anda punya alasan khusus,
        misalnya ingin judul pencarian yang berbeda dari judul halaman.
      </p>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-white/50">Meta Title</span>
          <CharCount value={metaTitle} ideal={60} />
        </div>
        <Input value={metaTitle} onChange={onMetaTitle} placeholder="Kosongkan = pakai judul konten + SAYBA ARC" />
        <p className="text-[10px] text-white/25 leading-relaxed">
          Judul biru yang tampil di Google. Kosongkan untuk memakai {titleFallback} + “SAYBA ARC”.
          Idealnya 50–60 karakter; lebih panjang akan dipotong dengan “…”.
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-white/50">Meta Description</span>
          <CharCount value={metaDescription} ideal={160} />
        </div>
        <Textarea value={metaDescription} onChange={onMetaDescription} placeholder="Kosongkan = pakai ringkasan/deskripsi konten" />
        <p className="text-[10px] text-white/25 leading-relaxed">
          Cuplikan abu-abu di bawah judul Google. Kosongkan untuk memakai {descFallback}.
          Idealnya 150–160 karakter; terlalu panjang akan terpotong.
        </p>
      </div>

      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-white/50">Meta Keywords (1 per baris)</span>
        <Textarea value={metaKeywords} onChange={onMetaKeywords} placeholder={"Kosongkan = kata kunci disusun otomatis\ndari kategori, departemen, dan judul"} />
        <p className="text-[10px] text-white/25 leading-relaxed">
          Daftar kata kunci yang relevan, satu per baris. Google tidak lagi memakai ini untuk
          peringkat, tetapi berguna untuk pencarian internal dan konsistensi topik.
        </p>
      </div>

      <div className="space-y-1">
        <span className="text-[11px] font-semibold text-white/50">Canonical URL</span>
        <Input value={canonicalUrl} onChange={onCanonicalUrl} placeholder={slugPlaceholder} />
        <p className="text-[10px] text-white/25 leading-relaxed">
          Alamat asli halaman ini. <span className="text-white/40">Kosongkan pada kondisi normal.</span> Isi
          hanya bila isi halaman ini sama persis dengan halaman lain, supaya Google tidak dianggap
          menemukan konten ganda.
        </p>
      </div>

      <ImageUploadField
        value={ogImage}
        onChange={onOgImage}
        onTrackChange={onTrackChange}
        folder={ogFolder}
        label="Gambar Pratinjau Sosial (og:image)"
      />
      <p className="text-[10px] text-white/25 leading-relaxed -mt-1.5">
        Gambar yang muncul saat tautan dibagikan ke WhatsApp, Facebook, atau X.
        <span className="text-white/40"> Kosongkan untuk memakai gambar utama halaman ini.</span> Rasio
        disarankan 1200 × 630 px.
      </p>
      </div>
      )}
    </div>
  )
}

// ── Kategori Informasi Table ────────────────────────────────────────────────
function KategoriTable({ data, loading, onEdit, onDelete, scopeLabel }: {
  data: KategoriRow[]; loading: boolean
  onEdit: (k: KategoriRow) => void; onDelete: (k: KategoriRow) => void
  /** Nama cakupan yang sedang dibuka, dipakai di keadaan kosong. */
  scopeLabel: string
}) {
  if (loading) return <TableLoading />
  if (!data.length) return <TableEmpty label={`kategori ${scopeLabel.toLowerCase()}`} />
  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["Nama & Deskripsi", "Slug", "Warna", "Urutan", "Status", "Aksi"].map(h => (
                <th key={h} className="text-left text-[9.5px] font-bold uppercase tracking-widest text-white/20 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(k => (
              <tr key={k.slug} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3">
                  <p className="text-[13px] font-medium text-white">{k.label}</p>
                  {k.description && <p className="text-[11px] text-white/30 mt-0.5 max-w-[260px] truncate">{k.description}</p>}
                </td>
                <td className="px-4 py-3"><code className="text-[10px] bg-[#2d3733] text-white/40 px-1.5 py-0.5 rounded-md">{k.slug}</code></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-white/15 flex-shrink-0" style={{ backgroundColor: k.color }} />
                    <code className="text-[10px] text-white/35">{k.color}</code>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-[12px] text-white/40 font-mono">{k.sort_order}</span></td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1",
                    k.status === "active" ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20")}>
                    {k.status === "active" ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(k)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={12} /></button>
                    <button onClick={() => onDelete(k)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden">
        {data.map(k => (
          <CardRow key={k.slug} actions={<><button onClick={() => onEdit(k)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={13} /></button><button onClick={() => onDelete(k)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={13} /></button></>}>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-white/15 flex-shrink-0" style={{ backgroundColor: k.color }} />
              <p className="text-[13px] font-medium text-white truncate">{k.label}</p>
            </div>
            {k.description && <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">{k.description}</p>}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <code className="text-[10px] text-white/25">{k.slug}</code>
              <span className="text-[10px] text-white/40">Urutan {k.sort_order}</span>
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1",
                k.status === "active" ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20")}>
                {k.status === "active" ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </CardRow>
        ))}
      </div>
    </>
  )
}

// ── Kategori Informasi Modal ────────────────────────────────────────────────
/**
 * Warna penanda kategori, diambil dari palet situs.
 *
 * Warna-warna ini dipakai sebagai GARIS tepi dan tint tipis, bukan sebagai
 * warna teks: sebagian di antaranya (orange) gagal kontras bila dipakai
 * menulis di latar terang. Teks label selalu memakai warna palet yang aman.
 */
/**
 * Empat cakupan kategori yang bisa dikelola dari satu tab.
 *
 * Dulu hanya tiga (layanan, berita, informasi) dan admin harus berpindah tab
 * untuk mengurusinya. Sekarang keempatnya ada di satu tempat dengan sub-tab,
 * termasuk departemen, karena departemen juga berfungsi sebagai pengelompok
 * di halaman Layanan dan Portofolio.
 */
/**
 * Sub-tab di dalam tab Kategori.
 *
 * Tiga pertama adalah cakupan pada tabel `kategori`. Yang keempat, Departemen,
 * dibaca dari tabel `layanan_depts` karena kolom `layanan.dept` mengacu ke
 * sana. Dari sisi Anda keduanya satu tempat: pilih sub-tab, kelola, selesai.
 */
const KATEGORI_SCOPES: { value: KategoriScope | "departemen"; label: string; hint: string }[] = [
  { value: "layanan",    label: "Layanan",    hint: "Pengelompokan pekerjaan di halaman Layanan." },
  { value: "berita",     label: "Berita",     hint: "Pengelompokan artikel di halaman Berita." },
  { value: "informasi",  label: "Informasi",  hint: "Pengelompokan dokumen di halaman Informasi." },
  { value: "departemen", label: "Departemen", hint: "Departemen perusahaan. Dipakai untuk mengelompokkan Layanan dan Portofolio." },
]

const KATEGORI_COLORS = [
  { color: "#112a46", label: "Navy" },
  { color: "#1b3e6b", label: "Navy Terang" },
  { color: "#2a4a6e", label: "Navy Sedang" },
  { color: "#5a5c62", label: "Slate" },
  { color: "#f07a26", label: "Orange" },
  { color: "#b45610", label: "Orange Tua" },
]

function KategoriModal({ open, initial, defaultScope, onClose, onSaved, onError }: {
  open: boolean; initial: KategoriRow | null
  /** Cakupan yang sedang dibuka di sub-tab, dipakai untuk kategori baru. */
  defaultScope: KategoriScope
  onClose: () => void; onSaved: () => void; onError: (msg: string, t: "error") => void
}) {
  const blank: KategoriRow = { id: "", scope: defaultScope, slug: "", label: "", description: "", color: KATEGORI_COLORS[0].color, sort_order: 0, status: "active" }
  const [form, setForm] = useState<KategoriRow>(blank)
  const [saving, setSaving] = useState(false)
  const [slugManual, setSlugManual] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) { setForm({ ...initial, description: initial.description ?? "" }); setSlugManual(true) }
    else {
      // Kategori baru selalu masuk ke cakupan yang sedang dibuka.
      setForm({ id: "", scope: defaultScope, slug: "", label: "", description: "", color: KATEGORI_COLORS[0].color, sort_order: 0, status: "active" })
      setSlugManual(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, defaultScope])

  const set = <K extends keyof KategoriRow>(k: K, v: KategoriRow[K]) => setForm(f => ({ ...f, [k]: v }))
  const handleLabel = (v: string) => {
    set("label", v)
    if (!slugManual) set("slug", v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40))
  }

  const handleSubmit = async () => {
    if (!form.label.trim()) { onError("Nama kategori wajib diisi", "error"); return }
    if (!form.slug.trim()) { onError("Slug wajib diisi", "error"); return }
    setSaving(true)
    const payload = {
      label: form.label.trim(),
      description: form.description || null,
      color: form.color || "#5a5c62",
      sort_order: Number(form.sort_order) || 0,
      status: form.status,
    }
    // Slug hanya dikirim saat membuat baru; mengubah slug akan memutus kaitan
    // dengan artikel lama yang memakai slug tersebut.
    const res = initial
      ? await fetch(`/api/admin/kategori?scope=${encodeURIComponent(initial.scope ?? form.scope ?? "informasi")}&slug=${encodeURIComponent(initial.slug)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/kategori", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, scope: form.scope, slug: form.slug.trim() }) })
    setSaving(false)
    if (!res.ok) { onError((await res.json()).error ?? "Gagal menyimpan", "error"); return }
    onSaved()
  }

  return (
    <Modal open={open} onClose={onClose} maxW="max-w-lg">
      <ModalHeader icon={<Tag size={15} className="text-powder" />} iconBg="bg-powder/10"
        title={`${initial ? "Edit" : "Tambah"} Kategori ${KATEGORI_SCOPES.find(x => x.value === (initial?.scope ?? defaultScope))?.label ?? ""}`}
        onClose={onClose} />
      <div className="px-4 py-4 space-y-3.5 overflow-y-auto max-h-[75vh]">
        {/* Cakupan kategori. Saat mengedit, cakupan dikunci: memindahkannya
            akan memutus kaitan dengan artikel lama yang memakai slug ini. */}
        <Field label="Dipakai untuk" hint={initial ? "Cakupan tidak bisa dipindah setelah kategori dibuat." : "Pilih modul yang memakai kategori ini."}>
          {initial ? (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2d3733] border border-white/[0.07]">
              <Tag size={12} className="text-powder" />
              <span className="text-[12.5px] text-white/70">
                {KATEGORI_SCOPES.find(x => x.value === initial.scope)?.label ?? initial.scope}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {/* Hanya tiga cakupan tabel kategori. Departemen dikelola di
                  modalnya sendiri karena tabelnya berbeda. */}
              {KATEGORI_SCOPES.filter(sc => sc.value !== "departemen").map(sc => (
                <button
                  key={sc.value}
                  type="button"
                  onClick={() => set("scope", sc.value as KategoriScope)}
                  title={sc.hint}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all",
                    form.scope === sc.value
                      ? "bg-powder/10 text-powder border-powder/30"
                      : "bg-[#2d3733] text-white/40 border-white/[0.07] hover:text-white/70 hover:border-white/20"
                  )}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          )}
        </Field>

        <Field label="Nama Kategori" required hint="Label yang tampil ke pengunjung, mis. “Pengumuman”.">
          <Input value={form.label} onChange={handleLabel} placeholder="Pengumuman" />
        </Field>
        <Field label="Slug" required hint="Kode unik tanpa spasi (huruf kecil & tanda hubung). Dipakai artikel untuk menandai kategorinya. Slug tidak bisa diubah setelah dibuat.">
          <Input value={form.slug} onChange={v => { setSlugManual(true); set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "")) }} placeholder="pengumuman" />
        </Field>
        <Field label="Deskripsi" hint="Penjelasan singkat isi kategori ini (opsional).">
          <Input value={form.description ?? ""} onChange={v => set("description", v)} placeholder="Kabar resmi dan pemberitahuan layanan" />
        </Field>
        <Field label="Warna Penanda" hint="Warna aksen dari palet situs, dipakai pada label kategori.">
          <div className="flex flex-wrap gap-2 mt-1">
            {KATEGORI_COLORS.map(c => (
              <button key={c.color} type="button" onClick={() => set("color", c.color)} title={c.label}
                className={cn("w-7 h-7 rounded-full border-2 transition-all", form.color === c.color ? "border-white scale-110" : "border-transparent hover:scale-105")}
                style={{ backgroundColor: c.color }} />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-white/15 flex-shrink-0" style={{ backgroundColor: form.color }} />
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ color: form.color, backgroundColor: `${form.color}1a`, boxShadow: `inset 0 0 0 1px ${form.color}33` }}>
              {form.label || "Preview Kategori"}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-white/30">Hex</span>
            <input
              value={form.color}
              onChange={e => set("color", e.target.value)}
              onBlur={e => { const v = e.target.value.trim(); if (!/^#[0-9a-fA-F]{6}$/.test(v)) set("color", "#5a5c62") }}
              placeholder="#5a5c62"
              className="w-28 bg-[#2d3733] border border-white/[0.07] rounded-lg px-2 py-1 text-[12px] font-mono text-white placeholder:text-white/20 outline-none focus:border-powder/40 transition-colors"
            />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Urutan Tampil" hint="Angka kecil tampil lebih dulu.">
            <input type="number" value={form.sort_order} onChange={e => set("sort_order", Number(e.target.value))}
              className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-powder/40 transition-colors" />
          </Field>
          <Field label="Status" hint="Nonaktif menyembunyikan kategori dari pilihan.">
            <Select value={form.status} onChange={v => set("status", v as "active" | "draft")} options={[{ value: "active", label: "Aktif" }, { value: "draft", label: "Nonaktif" }]} />
          </Field>
        </div>
      </div>
      <ModalFooter>
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20 transition-all disabled:opacity-50">Batal</button>
        <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-powder text-carbon hover:bg-steel transition-all disabled:opacity-50">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </ModalFooter>
    </Modal>
  )
}


// ── Departemen Table ───────────────────────────────────────────────────────
/**
 * Daftar departemen layanan.
 *
 * Berbeda dari KategoriTable karena datanya di tabel `layanan_depts`, dan
 * karena satu departemen bisa dipakai banyak layanan: kolom "Dipakai" memberi
 * tahu berapa, supaya Anda tahu departemen mana yang aman dihapus.
 */
function DepartemenTable({ data, loading, jumlahLayanan, onEdit, onDelete }: {
  data: LayananDept[]
  loading: boolean
  /** Berapa layanan yang memakai departemen ini. */
  jumlahLayanan: (value: string) => number
  onEdit: (d: LayananDept) => void
  onDelete: (d: LayananDept) => void
}) {
  if (loading) return <TableLoading />
  if (!data.length) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-white/50 text-[13px] font-medium mb-1.5">Belum ada departemen</p>
        <p className="text-white/25 text-[11.5px] max-w-sm mx-auto leading-relaxed">
          Tekan tombol Tambah Departemen untuk membuat yang pertama. Departemen dipakai
          untuk mengelompokkan layanan dan portofolio.
        </p>
      </div>
    )
  }
  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["Departemen", "Kode", "Lingkup Kerja", "Dipakai", "Warna", "Aksi"].map(h => (
                <th key={h} className="text-left text-[9.5px] font-bold uppercase tracking-widest text-white/20 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(d => {
              const dipakai = jumlahLayanan(d.value)
              return (
                <tr key={d.value} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-white">{d.label}</p>
                    {d.description && <p className="text-[11px] text-white/30 mt-0.5 max-w-[300px] truncate">{d.description}</p>}
                  </td>
                  <td className="px-4 py-3"><code className="text-[10px] bg-[#2d3733] text-white/40 px-1.5 py-0.5 rounded-md">{d.value}</code></td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-white/40">{d.scope?.length ?? 0} butir</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1",
                      dipakai > 0 ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-white/[0.04] text-white/30 ring-white/[0.06]")}>
                      {dipakai} layanan
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-white/15 flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <code className="text-[10px] text-white/35">{d.color}</code>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(d)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={12} /></button>
                      <button onClick={() => onDelete(d)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Kartu untuk layar kecil */}
      <div className="lg:hidden divide-y divide-white/[0.05]">
        {data.map(d => {
          const dipakai = jumlahLayanan(d.value)
          return (
            <div key={d.value} className="p-3.5">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg flex-shrink-0 mt-0.5" style={{ backgroundColor: `${d.color}22`, boxShadow: `inset 0 0 0 1.5px ${d.color}` }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-white truncate">{d.label}</p>
                  <code className="text-[10px] text-white/30">{d.value}</code>
                  {d.description && <p className="text-[11.5px] text-white/35 mt-1 line-clamp-2">{d.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1",
                      dipakai > 0 ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-white/[0.04] text-white/30 ring-white/[0.06]")}>
                      {dipakai} layanan
                    </span>
                    <span className="text-[10px] text-white/25">{d.scope?.length ?? 0} lingkup</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => onEdit(d)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/30 border border-white/[0.07]"><Pencil size={13} /></button>
                  <button onClick={() => onDelete(d)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/30 border border-white/[0.07]"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}


// ── Departemen Modal ───────────────────────────────────────────────────────
/**
 * Form tambah/edit departemen.
 *
 * Kode (value) dikunci saat mengedit: kolom `layanan.dept` menyimpan nilai itu,
 * jadi mengubahnya akan memutus kaitan dengan layanan yang sudah ada. Saat
 * membuat baru, kode diturunkan otomatis dari nama dan masih bisa disesuaikan.
 */
function DepartemenModal({ open, initial, onClose, onSaved, onError }: {
  open: boolean; initial: LayananDept | null
  onClose: () => void; onSaved: () => void; onError: (msg: string, t: "error") => void
}) {
  const [label, setLabel] = useState("")
  const [value, setValue] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState(KATEGORI_COLORS[0].color)
  const [scope, setScope] = useState("")
  const [sortOrder, setSortOrder] = useState(1)
  const [kodeManual, setKodeManual] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setLabel(initial.label); setValue(initial.value)
      setDescription(initial.description ?? ""); setColor(initial.color)
      setScope((initial.scope ?? []).join("\n")); setSortOrder(initial.sort_order ?? 1)
      setKodeManual(true)
    } else {
      setLabel(""); setValue(""); setDescription("")
      setColor(KATEGORI_COLORS[0].color); setScope(""); setSortOrder(1)
      setKodeManual(false)
    }
  }, [open, initial])

  const handleLabel = (v: string) => {
    setLabel(v)
    if (!kodeManual) {
      setValue(v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40))
    }
  }

  const handleSubmit = async () => {
    if (!label.trim()) { onError("Nama departemen wajib diisi", "error"); return }
    if (!value.trim()) { onError("Kode departemen wajib diisi", "error"); return }
    setSaving(true)
    const payload = {
      label: label.trim(),
      value: value.trim(),
      description: description.trim() || null,
      color,
      scope,
      sort_order: Number(sortOrder) || 0,
    }
    const res = initial
      ? await fetch(`/api/admin/tipe?value=${encodeURIComponent(initial.value)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/tipe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSaving(false)
    if (!res.ok) { onError((await res.json()).error ?? "Gagal menyimpan", "error"); return }
    onSaved()
  }

  return (
    <Modal open={open} onClose={onClose} maxW="max-w-lg">
      <ModalHeader icon={<Layers size={15} className="text-powder" />} iconBg="bg-powder/10"
        title={initial ? "Edit Departemen" : "Tambah Departemen"} onClose={onClose} />
      <div className="px-4 py-4 space-y-3.5 overflow-y-auto max-h-[75vh]">
        <Field label="Nama Departemen" required hint="Tampil sebagai judul kartu di halaman Layanan, mis. “IT Consultant”.">
          <Input value={label} onChange={handleLabel} placeholder="IT Consultant" />
        </Field>

        <Field label="Kode" required
          hint={initial
            ? "Kode tidak bisa diubah: layanan yang sudah ada menyimpan kode ini."
            : "Dipakai di dalam sistem. Diturunkan dari nama, bisa disesuaikan. Huruf kecil, angka, garis bawah."}>
          <Input value={value} onChange={v => { setKodeManual(true); setValue(v.toLowerCase().replace(/[^a-z0-9_]/g, "")) }}
            placeholder="it_konsulting" />
        </Field>

        <Field label="Deskripsi" hint="Penjelasan singkat yang tampil di bawah nama departemen (opsional).">
          <Input value={description} onChange={setDescription} placeholder="Pengembangan perangkat lunak dan sistem informasi." />
        </Field>

        <Field label="Lingkup Kerja" hint="Satu butir per baris. Tampil sebagai daftar bercentang di kartu departemen. Boleh dikosongkan.">
          <textarea
            value={scope}
            onChange={e => setScope(e.target.value)}
            rows={5}
            placeholder={"Website & aplikasi web\nAplikasi mobile & desktop\nBackend, API, dan basis data"}
            className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[12.5px] text-white placeholder:text-white/20 outline-none focus:border-powder/40 transition-colors resize-y leading-relaxed"
          />
        </Field>

        <Field label="Warna Penanda" hint="Warna aksen dari palet situs, dipakai pada kartu departemen.">
          <div className="flex flex-wrap gap-2 mt-1">
            {KATEGORI_COLORS.map(c => (
              <button key={c.color} type="button" onClick={() => setColor(c.color)} title={c.label}
                className={cn("w-7 h-7 rounded-full border-2 transition-all", color === c.color ? "border-white scale-110" : "border-transparent hover:scale-105")}
                style={{ backgroundColor: c.color }} />
            ))}
          </div>
        </Field>

        <Field label="Urutan Tampil" hint="Angka kecil tampil lebih dulu di halaman Layanan.">
          <input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))}
            className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-powder/40 transition-colors" />
        </Field>
      </div>
      <ModalFooter>
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20 transition-all">Batal</button>
        <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-powder text-carbon hover:bg-steel transition-all disabled:opacity-50">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </ModalFooter>
    </Modal>
  )
}


// ── Tim Table ──────────────────────────────────────────────────────────────
function TimTable({ data, loading, onEdit, onDelete }: {
  data: TimMember[]; loading: boolean
  onEdit: (m: TimMember) => void; onDelete: (m: TimMember) => void
}) {
  if (loading) return <TableLoading />
  if (!data.length) return <TableEmpty label="anggota tim" />
  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["Foto & Nama", "Jabatan", "Bio", "Urutan", "Status", "Aksi"].map(h => (
                <th key={h} className="text-left text-[9.5px] font-bold uppercase tracking-widest text-white/20 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(m => {
              const photoSrc = m.photo_url ? gdriveToImg(m.photo_url) : null
              return (
                <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl overflow-hidden bg-[#2d3733] border border-white/[0.07] flex-shrink-0 flex items-center justify-center">
                        {photoSrc
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={photoSrc} alt={m.name} className="w-full object-cover" style={{ height: "100%" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                          : <span className="text-sm font-bold text-powder">{m.name.charAt(0)}</span>}
                      </div>
                      <p className="text-[13px] font-medium text-white">{m.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><p className="text-[12px] text-powder font-medium">{m.role}</p></td>
                  <td className="px-4 py-3 max-w-[200px]"><p className="text-[11px] text-white/35 line-clamp-2">{m.bio ?? ", "}</p></td>
                  <td className="px-4 py-3"><span className="text-[12px] text-white/40 font-mono">{m.order_num}</span></td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1", m.status === "active" ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20")}>
                      {m.status === "active" ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEdit(m)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={12} /></button>
                      <button onClick={() => onDelete(m)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden">
        {data.map(m => {
          const photoSrc = m.photo_url ? gdriveToImg(m.photo_url) : null
          return (
            <CardRow key={m.id} actions={<><button onClick={() => onEdit(m)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={13} /></button><button onClick={() => onDelete(m)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={13} /></button></>}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#2d3733] border border-white/[0.07] flex-shrink-0 flex items-center justify-center">
                  {photoSrc
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={photoSrc} alt={m.name} className="w-full object-cover" style={{ height: "100%" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                    : <span className="font-bold text-powder">{m.name.charAt(0)}</span>}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{m.name}</p>
                  <p className="text-[11px] text-powder">{m.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1", m.status === "active" ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20")}>
                  {m.status === "active" ? "Active" : "Draft"}
                </span>
                <span className="text-[10px] text-white/30">#{m.order_num}</span>
              </div>
              {m.bio && <p className="text-[11px] text-white/30 mt-1 line-clamp-1">{m.bio}</p>}
            </CardRow>
          )
        })}
      </div>
    </>
  )
}

// ── Tim Modal ──────────────────────────────────────────────────────────────
function TimModal({ open, initial, onClose, onSaved, onError }: {
  open: boolean; initial: TimMember | null
  onClose: () => void; onSaved: () => void; onError: (msg: string, t: "error") => void
}) {
  const blank = { name: "", role: "", bio: "", photo_url: "", github_url: "", linkedin_url: "", instagram_url: "", order_num: 0, status: "active" as "active" | "draft" }
  const [form, setForm] = useState({ ...blank })
  const [saving, setSaving] = useState(false)
  // Files uploaded (or replaced) during this modal session. Only actually
  // deleted from Storage once we know the outcome, see handleSubmit/handleClose.
  const stagedUploads = useRef<Set<string>>(new Set())
  const replacedUrls = useRef<Set<string>>(new Set())
  const trackImageChange = (oldUrl: string, newUrl: string) => {
    if (oldUrl) replacedUrls.current.add(oldUrl)
    if (newUrl) stagedUploads.current.add(newUrl)
  }

  useEffect(() => {
    if (!open) return
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    if (initial) {
      setForm({ name: initial.name, role: initial.role, bio: initial.bio ?? "", photo_url: initial.photo_url ?? "", github_url: initial.github_url ?? "", linkedin_url: initial.linkedin_url ?? "", instagram_url: initial.instagram_url ?? "", order_num: initial.order_num, status: initial.status })
    } else { setForm({ ...blank }) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const handleClose = () => {
    stagedUploads.current.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { onError("Nama wajib diisi", "error"); return }
    if (!form.role.trim()) { onError("Jabatan wajib diisi", "error"); return }
    setSaving(true)
    const payload = { name: form.name, role: form.role, bio: form.bio || null, photo_url: form.photo_url || null, github_url: form.github_url || null, linkedin_url: form.linkedin_url || null, instagram_url: form.instagram_url || null, order_num: form.order_num, status: form.status }
    const res = initial
      ? await fetch(`/api/admin/tim?id=${initial.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/tim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSaving(false)
    if (!res.ok) { onError((await res.json()).error ?? "Save failed", "error"); return }
    const finalUrls = new Set([payload.photo_url].filter(Boolean) as string[])
    const toDelete = [...replacedUrls.current, ...stagedUploads.current].filter(u => !finalUrls.has(u))
    toDelete.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onSaved()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalHeader icon={<Users size={15} className="text-powder" />} iconBg="bg-powder/10" title={initial ? "Edit Anggota Tim" : "Tambah Anggota Tim"} onClose={handleClose} />
      <div className="px-4 py-4 space-y-3.5 overflow-y-auto max-h-[75vh]">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nama Lengkap" required><Input value={form.name} onChange={v => set("name", v)} placeholder="Budi Santoso" /></Field>
          <Field label="Jabatan / Role" required><Input value={form.role} onChange={v => set("role", v)} placeholder="Lead Developer" /></Field>
        </div>
        <Field label="Bio / Deskripsi Singkat">
          <Textarea value={form.bio} onChange={v => set("bio", v)} placeholder="Menangani pengembangan web dan mobile…" />
        </Field>

        {/* Foto, tautan sosial, dan pengaturan tampil dikelompokkan supaya
            form tetap ringkas. Yang hampir selalu diisi hanya nama, jabatan,
            dan bio. */}
        <BagianLipat
          label="Foto, Sosial & Tampilan"
          ringkas={`${form.photo_url ? "ada foto" : "tanpa foto"}${form.github_url || form.linkedin_url || form.instagram_url ? " · ada tautan sosial" : ""} · ${form.status} · urutan ${form.order_num}`}
        >
          <ImageUploadField value={form.photo_url} onChange={v => set("photo_url", v)} onTrackChange={trackImageChange} folder="tim" label="Foto Profil (JPG/PNG/WebP/GIF/SVG)" />

          <div className="space-y-3">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-white/25">Tautan Sosial (opsional)</p>
            <Field label="GitHub URL"><Input value={form.github_url} onChange={v => set("github_url", v)} placeholder="https://github.com/username" /></Field>
            <Field label="LinkedIn URL"><Input value={form.linkedin_url} onChange={v => set("linkedin_url", v)} placeholder="https://linkedin.com/in/username" /></Field>
            <Field label="Instagram URL"><Input value={form.instagram_url} onChange={v => set("instagram_url", v)} placeholder="https://instagram.com/username" /></Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Hierarki / Urutan Tampil" hint="Angka 1 = posisi teratas (pemimpin), angka lebih besar di bawahnya">
              <input type="number" value={form.order_num} onChange={e => set("order_num", Number(e.target.value))}
                className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-powder/40 transition-colors" />
            </Field>
            <Field label="Status" hint="Draft disembunyikan dari halaman tim.">
              <Select value={form.status} onChange={v => set("status", v)} options={[{ value: "active", label: "Active: tampil" }, { value: "draft", label: "Draft: tersembunyi" }]} />
            </Field>
          </div>
        </BagianLipat>
      </div>
      <ModalFooter>
        <button onClick={handleClose} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20 transition-all disabled:opacity-50">Batal</button>
        <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-powder text-carbon hover:bg-steel transition-all disabled:opacity-50">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </ModalFooter>
    </Modal>
  )
}

// ── Berita Table ───────────────────────────────────────────────────────────
function beritaDateLabel(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

function BeritaTable({ data, loading, labelKategori, onEdit, onDelete }: {
  data: Berita[]; loading: boolean
  onEdit: (b: Berita) => void; labelKategori: (slug: string) => string
  onDelete: (b: Berita) => void
}) {
  if (loading) return <TableLoading />
  if (!data.length) return <TableEmpty label="berita" />
  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["Judul & Ringkasan", "Kategori", "Slug", "Gambar", "Tanggal", "Status", "Aksi"].map(h => (
                <th key={h} className="text-left text-[9.5px] font-bold uppercase tracking-widest text-white/20 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(b => (
              <tr key={b.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {b.featured && <span className="text-[8.5px] font-black uppercase tracking-widest text-powder bg-powder/10 border border-powder/25 px-1.5 py-0.5 rounded-md flex-shrink-0">Sorotan</span>}
                    <p className="text-[13px] font-medium text-white truncate max-w-[260px]">{b.title}</p>
                  </div>
                  {b.excerpt && <p className="text-[11px] text-white/30 mt-0.5 max-w-[260px] truncate">{b.excerpt}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-[10px] text-white/35"><Tag size={8} />{labelKategori(b.category)}</span>
                </td>
                <td className="px-4 py-3"><code className="text-[10px] bg-[#2d3733] text-white/40 px-1.5 py-0.5 rounded-md">/berita/{b.slug}</code></td>
                <td className="px-4 py-3">
                  {b.image_url ? (
                    <div className="w-14 h-10 rounded-lg overflow-hidden border border-white/[0.07] bg-[#2d3733] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gdriveToImg(b.image_url)} alt={b.title} className="w-full object-cover" style={{ height: "100%" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                    </div>
                  ) : <span className="text-[10px] text-white/20 italic">, </span>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11.5px] text-white/50">{beritaDateLabel(b.published_at)}</span>
                  <span className="block text-[10px] text-white/25">{b.read_minutes} mnt · {b.views.toLocaleString("id-ID")} dibaca</span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={`/berita/${b.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><ExternalLink size={12} /></a>
                    <button onClick={() => onEdit(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={12} /></button>
                    <button onClick={() => onDelete(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden">
        {data.map(b => (
          <CardRow key={b.id} actions={<><button onClick={() => onEdit(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={13} /></button><button onClick={() => onDelete(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={13} /></button></>}>
            <p className="text-[13px] font-medium text-white truncate">{b.title}</p>
            {b.excerpt && <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">{b.excerpt}</p>}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {b.featured && <span className="text-[8.5px] font-black uppercase tracking-widest text-powder bg-powder/10 border border-powder/25 px-1.5 py-0.5 rounded-md">Sorotan</span>}
              <span className="text-[10px] text-white/35">{labelKategori(b.category)}</span>
              <StatusBadge status={b.status} />
              <span className="text-[10px] text-white/40">{beritaDateLabel(b.published_at)}</span>
            </div>
          </CardRow>
        ))}
      </div>
    </>
  )
}

// ── Berita Modal ───────────────────────────────────────────────────────────
function BeritaModal({ open, initial, kategori, labelKategori, allBerita, onClose, onSaved, onError }: {
  open: boolean; initial: Berita | null
  /** Kategori scope "berita" dari tabel `kategori` */
  kategori: KategoriRow[]
  /** Ubah slug kategori jadi label yang terbaca */
  labelKategori: (slug: string) => string
  /** Semua berita, dipakai untuk memeriksa posisi sorotan yang sudah terpakai. */
  allBerita: Berita[]
  onClose: () => void; onSaved: () => void; onError: (msg: string, t: "error") => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const blank = {
    title: "", slug: "", excerpt: "", category: kategori[0]?.slug ?? "", image_url: "",
    author: "Redaksi SAYBA ARC", body: "", published_at: today, read_minutes: 3, views: 0,
    featured: false, featured_order: null as number | null, tags: "", status: "active" as Status,
    meta_title: "", meta_description: "", meta_keywords: "", og_image: "", canonical_url: "",
  }
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  const stagedUploads = useRef<Set<string>>(new Set())
  const replacedUrls = useRef<Set<string>>(new Set())
  const trackImageChange = (oldUrl: string, newUrl: string) => {
    if (oldUrl) replacedUrls.current.add(oldUrl)
    if (newUrl) stagedUploads.current.add(newUrl)
  }

  useEffect(() => {
    if (!open) return
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    if (initial) {
      setForm({
        title: initial.title, slug: initial.slug, excerpt: initial.excerpt ?? "", category: initial.category,
        image_url: initial.image_url ?? "", author: initial.author, body: initial.body ?? "",
        published_at: initial.published_at.slice(0, 10), read_minutes: initial.read_minutes, views: initial.views,
        featured: initial.featured, featured_order: initial.featured_order ?? null,
        tags: (initial.tags ?? []).join("\n"), status: initial.status,
        meta_title: initial.meta_title ?? "", meta_description: initial.meta_description ?? "",
        meta_keywords: (initial.meta_keywords ?? []).join("\n"), og_image: initial.og_image ?? "",
        canonical_url: initial.canonical_url ?? "",
      })
      setSlugManual(true)
    } else { setForm(blank); setSlugManual(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const handleTitle = (v: string) => { set("title", v); if (!slugManual) set("slug", slugifyTitle(v)) }

  const handleClose = () => {
    stagedUploads.current.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.title || !form.slug) { onError("Judul dan slug wajib diisi", "error"); return }
    setSaving(true)
    const payload = {
      title: form.title, slug: form.slug, excerpt: form.excerpt || null, category: form.category,
      image_url: form.image_url || null, author: form.author || "Redaksi SAYBA ARC", body: form.body || null,
      published_at: form.published_at || today,
      read_minutes: Number(form.read_minutes) || 1,
      views: Number(form.views) || 0,
      // `featured` disimpan sebagai cermin `featured_order` supaya kolom lama
      // tetap benar dan berita yang sudah ditandai sorotan sebelum migrasi
      // tidak kehilangan tandanya.
      featured: form.featured_order !== null, featured_order: form.featured_order,
      status: form.status,
      tags: form.tags ? form.tags.split("\n").map(s => s.trim()).filter(Boolean) : null,
      meta_title: form.meta_title || null, meta_description: form.meta_description || null,
      meta_keywords: form.meta_keywords ? form.meta_keywords.split("\n").map(s => s.trim()).filter(Boolean) : null,
      og_image: form.og_image || null, canonical_url: form.canonical_url || null,
    }
    const res = initial
      ? await fetch(`/api/admin/berita?id=${initial.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/berita", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSaving(false)
    if (!res.ok) { onError((await res.json()).error ?? "Save failed", "error"); return }
    const finalUrls = new Set([payload.image_url, payload.og_image].filter(Boolean) as string[])
    const toDelete = [...replacedUrls.current, ...stagedUploads.current].filter(u => !finalUrls.has(u))
    toDelete.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onSaved()
  }

  return (
    <Modal open={open} onClose={handleClose} maxW="max-w-2xl">
      <ModalHeader icon={<Newspaper size={15} className="text-powder" />} iconBg="bg-powder/10" title={initial ? "Edit Berita" : "Tulis Berita"} onClose={handleClose} />
      <div className="px-4 py-4 space-y-3.5 overflow-y-auto max-h-[75vh]">
        <Field label="Judul Artikel" required>
          <Input value={form.title} onChange={handleTitle} placeholder="Pemetaan Partisipatif Desa di Kalimantan Barat" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug / URL" required hint={`URL: /berita/${form.slug || "slug"}`}>
            <Input value={form.slug} onChange={v => { setSlugManual(true); set("slug", v) }} placeholder="pemetaan-partisipatif-desa" />
          </Field>
          <Field label="Kategori" required>
            <Select value={form.category} onChange={v => set("category", v)} options={kategori.map((c) => ({ value: c.slug, label: c.label }))} />
          </Field>
        </div>

        <Field label="Ringkasan" hint="Tampil di kartu daftar berita dan dipakai sebagai meta description bila kosong">
          <Textarea value={form.excerpt} onChange={v => set("excerpt", v)} placeholder="Bagaimana data lapangan yang dikumpulkan bersama warga desa diubah menjadi basis data spasial…" />
          {form.body.trim() && (
            <button
              type="button"
              onClick={() => set("excerpt", ringkasDariIsi(form.body))}
              className="mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-medium text-powder/70 hover:text-powder transition-colors"
            >
              <Wand2 size={11} />
              Ambil dari isi artikel
            </button>
          )}
        </Field>

        <ImageUploadField value={form.image_url} onChange={v => set("image_url", v)} onTrackChange={trackImageChange} folder="berita" label="Gambar Artikel (JPG/PNG/WebP/GIF/SVG)" />

        <Field
          label="Isi Artikel"
          hint='Pakai tombol di atas kotak tulis untuk mengatur bentuk tulisan. Tidak perlu menulis penanda apa pun secara manual. Tab "Pratinjau" menampilkan hasilnya persis seperti yang dilihat pembaca.'
        >
          <EditorIsi
            value={form.body}
            onChange={v => set("body", v)}
            onUsulWaktuBaca={m => set("read_minutes", String(m))}
          />
        </Field>

        {/* Kolom yang jarang diubah dikelompokkan supaya form tetap ringkas.
            Waktu baca bisa diisi sekali klik dari tombol di editor isi. */}
        <BagianLipat
          label="Detail & Publikasi"
          ringkas={`${form.author || "tanpa penulis"} · ${form.published_at} · ${form.status}${form.tags.trim() ? " · ada tag" : ""}`}
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Penulis"><Input value={form.author} onChange={v => set("author", v)} placeholder="Tim GIS SAYBA ARC" /></Field>
            <Field label="Tanggal Terbit">
              <input type="date" value={form.published_at} onChange={e => set("published_at", e.target.value)}
                className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-powder/40 transition-colors" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Waktu Baca (mnt)" hint="Tombol di editor isi mengisi ini otomatis.">
              <input type="number" min={1} value={form.read_minutes} onChange={e => set("read_minutes", e.target.value)}
                className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-powder/40 transition-colors" />
            </Field>
            <Field label="Jumlah Dibaca">
              <input type="number" min={0} value={form.views} onChange={e => set("views", e.target.value)}
                className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-powder/40 transition-colors" />
            </Field>
            <Field label="Status" hint="Draft disembunyikan dari publik.">
              <Select value={form.status} onChange={v => set("status", v)} options={[{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }]} />
            </Field>
          </div>

          <Field label="Tag (1 per baris)" hint="Kata kunci internal untuk pengelompokan dan pencarian.">
            <Textarea value={form.tags} onChange={v => set("tags", v)} placeholder={"ArcGIS\nSurvei Lapangan\nTata Ruang"} />
          </Field>
        </BagianLipat>

        {/* ── Sorotan Berita (nomor 1, 2, 3) ──
            Nomor 1 tampil sebagai kartu besar paling atas di halaman /berita
            dan ikut muncul di beranda; nomor 2 dan 3 jadi kartu kecil di
            bawahnya. Angka kecil tampil lebih dulu. */}
        <div className="rounded-xl border border-powder/15 bg-powder/5 p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-powder">Sorotan Berita</span>
            <span className="text-[10px] text-white/30">, tampil di beranda &amp; atas halaman berita (maks 3 posisi)</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {([null, 1, 2, 3] as (number | null)[]).map(v => {
              const takenBy = v !== null ? allBerita.find(b => b.featured_order === v && b.id !== initial?.id) : null
              const isSelected = form.featured_order === v
              const isTaken = !!takenBy
              return (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => set("featured_order", v)}
                  className={cn(
                    "relative px-3 py-1.5 rounded-lg text-[11.5px] font-semibold border transition-all text-left",
                    isSelected
                      ? "bg-powder text-carbon border-powder"
                      : isTaken
                        ? "bg-yellow-500/8 text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/15"
                        : "bg-[#2d3733] text-white/40 border-white/[0.07] hover:text-white/70"
                  )}
                >
                  <span>{v === null ? "Bukan Sorotan" : `Sorotan #${v}`}</span>
                  {isTaken && !isSelected && (
                    <span className="block text-[9px] font-normal opacity-70 truncate max-w-[110px]">{takenBy!.title}</span>
                  )}
                  {isTaken && isSelected && (
                    <span className="block text-[9px] font-normal opacity-80 truncate max-w-[110px]">akan geser: {takenBy!.title}</span>
                  )}
                </button>
              )
            })}
          </div>
          {form.featured_order !== null && (
            (() => {
              const conflict = allBerita.find(b => b.featured_order === form.featured_order && b.id !== initial?.id)
              return conflict ? (
                <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                  <AlertTriangle size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[11px] text-yellow-400/90 leading-relaxed">
                    Posisi #{form.featured_order} sudah dipakai oleh <span className="font-bold">"{conflict.title}"</span>. Menyimpan akan memindahkan berita tersebut keluar dari sorotan.
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-powder/70">
                  Berita ini akan tampil di posisi sorotan #{form.featured_order}
                  {form.featured_order === 1 ? " sebagai kartu utama di paling atas halaman berita." : " sebagai kartu pendamping."}
                </p>
              )
            })()
          )}
        </div>

        <SeoFields
          metaTitle={form.meta_title} onMetaTitle={v => set("meta_title", v)}
          metaDescription={form.meta_description} onMetaDescription={v => set("meta_description", v)}
          metaKeywords={form.meta_keywords} onMetaKeywords={v => set("meta_keywords", v)}
          canonicalUrl={form.canonical_url} onCanonicalUrl={v => set("canonical_url", v)}
          ogImage={form.og_image} onOgImage={v => set("og_image", v)}
          onTrackChange={trackImageChange}
          ogFolder="berita"
          titleFallback="Judul"
          descFallback="Ringkasan"
          slugPlaceholder="https://sayba.id/berita/slug-lain"
        />
      </div>
      <ModalFooter>
        <button onClick={handleClose} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20 transition-all disabled:opacity-50">Batal</button>
        <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-powder text-carbon hover:bg-steel transition-all disabled:opacity-50">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </ModalFooter>
    </Modal>
  )
}

// ── Promo Banner Table ─────────────────────────────────────────────────────
function PromoTable({ data, loading, onEdit, onDelete }: {
  data: PromoBanner[]; loading: boolean
  onEdit: (b: PromoBanner) => void; onDelete: (b: PromoBanner) => void
}) {
  if (loading) return <TableLoading />
  if (!data.length) return <TableEmpty label="banner" />
  return (
    <>
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {["Urutan", "Gambar", "Keterangan", "Link Banner", "Status", "Aksi"].map(h => (
                <th key={h} className="text-left text-[9.5px] font-bold uppercase tracking-widest text-white/20 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(b => (
              <tr key={b.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                <td className="px-4 py-3"><span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#2d3733] border border-white/[0.07] text-[11px] font-bold text-white/50">{b.sort_order}</span></td>
                <td className="px-4 py-3">
                  <div className="w-20 h-8 rounded-lg overflow-hidden border border-white/[0.07] bg-[#2d3733] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gdriveToImg(b.image_url)} alt={b.alt} className="w-full object-cover" style={{ height: "100%" }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[13px] font-medium text-white truncate max-w-[220px]">
                    {b.alt || <span className="text-white/25 italic">Tanpa keterangan</span>}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">Gambar penuh, tanpa teks di atasnya</p>
                </td>
                <td className="px-4 py-3">
                  {b.cta_href
                    ? <code className="block text-[10.5px] text-white/50 max-w-[200px] truncate">{b.cta_href}</code>
                    : <span className="text-[10.5px] text-white/25 italic">Gambar tidak bisa diklik</span>}
                </td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={12} /></button>
                    <button onClick={() => onDelete(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lg:hidden">
        {data.map(b => (
          <CardRow key={b.id} actions={<><button onClick={() => onEdit(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-white/80 hover:bg-white/[0.06] transition-all flex-shrink-0"><Pencil size={13} /></button><button onClick={() => onDelete(b)} className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-white/30 border border-white/[0.07] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all flex-shrink-0"><Trash2 size={13} /></button></>}>
            <p className="text-[13px] font-medium text-white truncate">{b.alt || "Tanpa keterangan"}</p>
            <p className="text-[10.5px] text-white/30 mt-0.5 line-clamp-1">
              {b.cta_href ? `Link: ${b.cta_href}` : "Gambar tidak bisa diklik"}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[10px] text-white/40">Urutan {b.sort_order}</span>
              <StatusBadge status={b.status} />
            </div>
          </CardRow>
        ))}
      </div>
    </>
  )
}

// ── Promo Banner Modal ─────────────────────────────────────────────────────
function PromoModal({ open, initial, nextOrder, onClose, onSaved, onError }: {
  open: boolean; initial: PromoBanner | null; nextOrder: number
  onClose: () => void; onSaved: () => void; onError: (msg: string, t: "error") => void
}) {
  const blank = {
    image_url: "", alt: "Banner promosi SAYBA ARC", href: "",
    sort_order: nextOrder, status: "active" as "active" | "draft",
  }
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const stagedUploads = useRef<Set<string>>(new Set())
  const replacedUrls = useRef<Set<string>>(new Set())
  const trackImageChange = (oldUrl: string, newUrl: string) => {
    if (oldUrl) replacedUrls.current.add(oldUrl)
    if (newUrl) stagedUploads.current.add(newUrl)
  }

  useEffect(() => {
    if (!open) return
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    if (initial) {
      setForm({
        image_url: initial.image_url, alt: initial.alt,
        href: initial.cta_href ?? "",
        sort_order: initial.sort_order, status: initial.status,
      })
    } else { setForm({ ...blank, sort_order: nextOrder }) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, nextOrder])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleClose = () => {
    stagedUploads.current.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.image_url) { onError("Gambar banner wajib diisi", "error"); return }
    const href = form.href.trim()
    if (href && !/^(https?:\/\/|\/)/i.test(href)) {
      onError("Link harus alamat lengkap (https://...) atau halaman dalam situs (/services)", "error"); return
    }
    setSaving(true)
    // Kolom teks (eyebrow, title, subtitle, cta_text) dikosongkan secara
    // sengaja: bannernya sekarang tampil sebagai gambar penuh tanpa teks dan
    // tanpa tombol, jadi tidak ada yang dirender dari kolom itu. Nilai lama
    // dari banner versi sebelumnya ikut dibersihkan di sini.
    const payload = {
      image_url: form.image_url, alt: form.alt || "Banner promosi SAYBA ARC",
      eyebrow: null, title: null, subtitle: null,
      cta_text: null, cta_href: href || null,
      sort_order: Number(form.sort_order) || 1, status: form.status,
    }
    const res = initial
      ? await fetch(`/api/admin/promo?id=${initial.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/promo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSaving(false)
    if (!res.ok) { onError((await res.json()).error ?? "Save failed", "error"); return }
    const toDelete = [...replacedUrls.current, ...stagedUploads.current].filter(u => u !== payload.image_url)
    toDelete.forEach(deleteMediaFile)
    stagedUploads.current.clear()
    replacedUrls.current.clear()
    onSaved()
  }

  return (
    <Modal open={open} onClose={handleClose} maxW="max-w-lg">
      <ModalHeader icon={<GalleryHorizontalEnd size={15} className="text-powder" />} iconBg="bg-powder/10" title={initial ? "Edit Banner" : "Tambah Banner"} onClose={handleClose} />
      <div className="px-4 py-4 space-y-3.5 overflow-y-auto max-h-[75vh]">
        <ImageUploadField value={form.image_url} onChange={v => set("image_url", v)} onTrackChange={trackImageChange} folder="promo" label="Gambar Banner (JPG/PNG/WebP/GIF/SVG)" />
        <p className="text-[10.5px] text-white/30 -mt-1.5 leading-relaxed">
          Rasio <span className="text-white/50">3 : 1</span> (contoh 2400 × 800 px). Rasio ini dipakai sama persis di ponsel dan desktop, jadi tampilannya tidak berubah. Gambar tampil utuh tanpa lapisan gelap, tanpa teks, dan tanpa tombol di atasnya: pastikan teksnya sudah ada di dalam gambar. Unggah gambar yang rasionya memang 3 : 1 supaya tidak terpotong di bagian tepi.
        </p>

        <Field label="Teks Alternatif (alt)" hint="Deskripsi gambar untuk pembaca layar dan SEO">
          <Input value={form.alt} onChange={v => set("alt", v)} placeholder="Promo layanan GIS & pemetaan SAYBA ARC" />
        </Field>

        <Field label="Link Banner" hint="Boleh dikosongkan. Halaman dalam situs (/services) atau alamat luar (https://...)">
          <Input value={form.href} onChange={v => set("href", v)} placeholder="/services" />
        </Field>
        <p className="text-[10.5px] text-white/30 -mt-1.5 leading-relaxed">
          Kalau diisi, <span className="text-white/50">seluruh gambar bisa diklik</span> dan mengarah ke tautan ini. Tautan luar dibuka di tab baru. Kalau dikosongkan, banner tetap tampil sebagai gambar saja.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Urutan Tampil" hint="Angka kecil tampil lebih dulu">
            <input type="number" min={1} value={form.sort_order} onChange={e => set("sort_order", e.target.value)}
              className="w-full bg-[#2d3733] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-powder/40 transition-colors" />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={v => set("status", v)} options={[{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }]} />
          </Field>
        </div>
      </div>
      <ModalFooter>
        <button onClick={handleClose} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20 transition-all disabled:opacity-50">Batal</button>
        <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold bg-powder text-carbon hover:bg-steel transition-all disabled:opacity-50">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </ModalFooter>
    </Modal>
  )
}
