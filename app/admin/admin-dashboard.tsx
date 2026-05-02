"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import type { Portfolio, PortfolioInsert, Layanan, LayananInsert, PriceTier } from "@/lib/database.types"
import { LAYANAN_DEPTS as DEFAULT_DEPTS, type LayananDept, getDept as getDefaultDept } from "@/lib/layanan-config"
import {
  LayoutGrid, Layers, Settings, Plus, Pencil, Trash2,
  RefreshCw, Search, X, Save, ChevronDown, ExternalLink,
  Map, CheckCircle, AlertCircle, Loader2, Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"

const LS_KEY = "sayba_layanan_depts"

function loadDepts(): LayananDept[] {
  if (typeof window === "undefined") return DEFAULT_DEPTS
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as LayananDept[]
  } catch {}
  return DEFAULT_DEPTS
}

function saveDepts(depts: LayananDept[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(depts)) } catch {}
}


// ── Types ──────────────────────────────────────────────────────────────────
type Tab = "portfolio" | "layanan" | "tipe"
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
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1", STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function DeptBadge({ dept, depts }: { dept: string; depts: LayananDept[] }) {
  const cfg = depts.find(d => d.value === dept)
  if (!cfg) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/5 text-white/40 ring-1 ring-white/10">
      {dept}
    </span>
  )
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ring-1", cfg.badgeClass)}>
      {cfg.label}
    </span>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [depts, setDepts] = useState<LayananDept[]>(DEFAULT_DEPTS)
  const [tab, setTab] = useState<Tab>("portfolio")
  const [deptFilter, setDeptFilter] = useState<DeptFilter>("semua")

  // Load depts from localStorage on mount
  useEffect(() => { setDepts(loadDepts()) }, [])

  const getDept = (value: string) => depts.find(d => d.value === value)
  const updateDepts = (newDepts: LayananDept[]) => { setDepts(newDepts); saveDepts(newDepts) }

  const [tipeModal, setTipeModal] = useState(false)
  const [tipeEdit, setTipeEdit] = useState<LayananDept | null>(null)
  const [search, setSearch] = useState("")

  const [portfolioData, setPortfolioData] = useState<Portfolio[]>([])
  const [layananData, setLayananData] = useState<Layanan[]>([])
  const [loadingP, setLoadingP] = useState(true)
  const [loadingL, setLoadingL] = useState(true)

  const [toasts, setToasts] = useState<Toast[]>([])
  const toastCounter = useRef(0)

  const [pfModal, setPfModal] = useState(false)
  const [pfEdit, setPfEdit] = useState<Portfolio | null>(null)
  const [lvModal, setLvModal] = useState(false)
  const [lvEdit, setLvEdit] = useState<Layanan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ table: Tab; id: string; name: string } | null>(null)

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

  useEffect(() => { fetchPortfolio(); fetchLayanan() }, [fetchPortfolio, fetchLayanan])

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

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/${deleteTarget.table}?id=${deleteTarget.id}`, { method: "DELETE" })
    if (!res.ok) { showToast((await res.json()).error ?? "Delete failed", "error"); return }
    showToast("Data berhasil dihapus")
    setDeleteTarget(null)
    if (deleteTarget.table === "portfolio") fetchPortfolio()
    else fetchLayanan()
  }

  const switchTab = (t: Tab) => { setTab(t); setDeptFilter("semua"); setSearch("") }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex">

      {/* SIDEBAR */}
      <aside className="w-[220px] min-h-screen bg-[#111] border-r border-white/[0.07] flex flex-col fixed top-0 left-0 bottom-0 z-40">
        <div className="px-5 py-5 border-b border-white/[0.07] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ff914d] flex items-center justify-center flex-shrink-0">
            <Map size={15} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-[13.5px] tracking-tight leading-none">SAYBA ARC</p>
            <p className="text-[10px] text-white/30 mt-0.5">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-white/20 px-2 mb-2">Menu</p>
          {(["portfolio", "layanan", "tipe"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all",
                tab === t ? "bg-[#ff914d]/10 text-[#ff914d]" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              )}
            >
              {t === "portfolio" ? <LayoutGrid size={14} /> : t === "layanan" ? <Layers size={14} /> : <Settings size={14} />}
              {t === "portfolio" ? "Portofolio" : t === "layanan" ? "Layanan" : "Tipe Layanan"}
              <span className={cn("ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-md", tab === t ? "bg-[#ff914d]/20 text-[#ff914d]" : "bg-white/[0.06] text-white/30")}>
                {t === "portfolio" ? portfolioData.length : t === "layanan" ? layananData.length : depts.length}
              </span>
            </button>
          ))}

          {/* Per-dept breakdown (layanan tab only) */}
          {tab === "layanan" && (
            <div className="pt-2 pb-1 border-t border-white/[0.05] mt-2">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-white/20 px-2 mb-1.5 mt-2">Per Tipe</p>
              {depts.map(d => (
                <div key={d.value} className="flex items-center justify-between px-3 py-0.5">
                  <span className="text-[11.5px] text-white/30">{d.label}</span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white/[0.04] text-white/25">
                    {layananData.filter(l => l.dept === d.value).length}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-white/20 px-2 mb-2">Info</p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
            >
              <Settings size={14} />
              Supabase
              <ExternalLink size={11} className="ml-auto opacity-50" />
            </a>
          </div>
        </nav>

        <div className="px-3 pb-4">
          <div className="bg-[#181818] border border-white/[0.06] rounded-lg px-3 py-2.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-[11.5px] font-medium text-white/60">Supabase</p>
              <p className="text-[10px] text-white/25">Connected</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-[220px] flex-1 flex flex-col min-h-screen">
        <header className="h-14 bg-[#111] border-b border-white/[0.07] flex items-center px-7 gap-4 sticky top-0 z-30">
          <h1 className="font-bold text-[15px] flex-1 capitalize">{tab}</h1>
          <button
            onClick={() => tab === "portfolio" ? fetchPortfolio() : fetchLayanan()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-white/40 border border-white/[0.07] hover:text-white/70 hover:border-white/15 transition-all"
          >
            <RefreshCw size={13} className={cn(loadingP || loadingL ? "animate-spin" : "")} />
            Refresh
          </button>
          {tab !== "tipe" && (
          <button
            onClick={() => { if (tab === "portfolio") { setPfEdit(null); setPfModal(true) } else { setLvEdit(null); setLvModal(true) } }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold bg-[#ff914d] text-white hover:bg-[#ff7a28] transition-all"
          >
            <Plus size={14} />
            Tambah
          </button>
          )}
          {tab === "tipe" && (
          <button
            onClick={() => { setTipeEdit(null); setTipeModal(true) }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold bg-[#ff914d] text-white hover:bg-[#ff7a28] transition-all"
          >
            <Plus size={14} />
            Tambah Tipe
          </button>
          )}
        </header>

        <main className="p-7 flex-1">
          {/* Stats — 2 fixed + dynamic per dept */}
          {tab !== "tipe" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 mb-7">
            <StatCard label="Total Portofolio" value={portfolioData.length} color="#ff914d" />
            <StatCard label="Total Layanan" value={layananData.length} color="#34d399" />
            {depts.map(d => (
              <StatCard
                key={d.value}
                label={`Layanan ${d.label}`}
                value={layananData.filter(l => l.dept === d.value).length}
                color={d.color}
              />
            ))}
          </div>
          )}
          {tab === "tipe" && (
          <div className="bg-[#ff914d]/5 border border-[#ff914d]/15 rounded-xl px-5 py-3.5 mb-7 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ff914d] flex-shrink-0" />
            <p className="text-[12px] text-white/50 leading-relaxed">
              Tipe layanan disimpan di browser (localStorage). Tambah, edit, atau hapus tipe — perubahan langsung berlaku di semua form.
            </p>
          </div>
          )}

          <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07]">
              <p className="font-bold text-[14px] flex-1">
                {tab === "portfolio" ? "Daftar Portofolio" : tab === "layanan" ? "Daftar Layanan" : "Kelola Tipe Layanan"}
              </p>

              {tab !== "tipe" && <>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={`Cari ${tab}…`}
                    className="bg-[#181818] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-[12.5px] w-44 outline-none focus:border-[#ff914d]/40 placeholder:text-white/20 text-white transition-colors"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(["semua", ...depts.map(d => d.value)] as DeptFilter[]).map(d => (
                    <button
                      key={d}
                      onClick={() => setDeptFilter(d)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[11.5px] font-semibold transition-all",
                        deptFilter === d
                          ? "bg-[#ff914d]/10 text-[#ff914d] ring-1 ring-[#ff914d]/20"
                          : "text-white/30 hover:text-white/50 hover:bg-white/[0.04]"
                      )}
                    >
                      {d === "semua" ? "Semua" : getDept(d)?.label ?? d}
                    </button>
                  ))}
                </div>
              </>}
            </div>

            {tab === "portfolio" ? (
              <PortfolioTable
                data={filteredPortfolio}
                loading={loadingP}
                depts={depts}
                onEdit={p => { setPfEdit(p); setPfModal(true) }}
                onDelete={p => setDeleteTarget({ table: "portfolio", id: p.id, name: p.title })}
              />
            ) : tab === "layanan" ? (
              <LayananTable
                data={filteredLayanan}
                loading={loadingL}
                depts={depts}
                onEdit={l => { setLvEdit(l); setLvModal(true) }}
                onDelete={l => setDeleteTarget({ table: "layanan", id: l.id, name: l.title })}
              />
            ) : (
              <TipeTable
                depts={depts}
                onEdit={d => { setTipeEdit(d); setTipeModal(true) }}
                onDelete={d => updateDepts(depts.filter(x => x.value !== d.value))}
              />
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      <PortfolioModal
        open={pfModal}
        initial={pfEdit}
        depts={depts}
        onClose={() => setPfModal(false)}
        onSaved={() => { setPfModal(false); fetchPortfolio(); showToast(pfEdit ? "Portofolio diperbarui" : "Portofolio ditambahkan") }}
        onError={showToast}
      />
      <LayananModal
        open={lvModal}
        initial={lvEdit}
        depts={depts}
        onClose={() => setLvModal(false)}
        onSaved={() => { setLvModal(false); fetchLayanan(); showToast(lvEdit ? "Layanan diperbarui" : "Layanan ditambahkan") }}
        onError={showToast}
      />

      <TipeModal
        open={tipeModal}
        initial={tipeEdit}
        onClose={() => setTipeModal(false)}
        onSaved={(dept) => {
          if (tipeEdit) {
            updateDepts(depts.map(d => d.value === tipeEdit.value ? dept : d))
          } else {
            updateDepts([...depts, dept])
          }
          setTipeModal(false)
          showToast(tipeEdit ? "Tipe diperbarui" : "Tipe ditambahkan")
        }}
        onError={showToast}
        existingValues={depts.map(d => d.value)}
      />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxW="max-w-sm">
        <ModalHeader icon={<Trash2 size={16} className="text-red-400" />} iconBg="bg-red-500/10" title="Konfirmasi Hapus" onClose={() => setDeleteTarget(null)} />
        <div className="px-6 py-5">
          <p className="text-[13.5px] text-white/60 leading-relaxed">
            Yakin hapus <span className="text-white font-semibold">"{deleteTarget?.name}"</span>? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <ModalFooter>
          <button onClick={() => setDeleteTarget(null)} className="btn-ghost">Batal</button>
          <button onClick={handleDelete} className="btn-danger"><Trash2 size={13} /> Ya, Hapus</button>
        </ModalFooter>
      </Modal>

      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[999]">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            "flex items-center gap-2.5 px-4 py-3 rounded-xl border text-[13px] font-medium shadow-xl bg-[#181818]",
            t.type === "success" ? "border-emerald-500/25" : "border-red-500/25"
          )}>
            {t.type === "success"
              ? <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
              : <AlertCircle size={15} className="text-red-400 flex-shrink-0" />}
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[#111] border border-white/[0.07] rounded-xl p-5 relative overflow-hidden hover:border-white/10 transition-colors">
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: color }} />
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/25 mb-2.5">{label}</p>
      <p className="text-[34px] font-extrabold leading-none tracking-tight" style={{ color }}>{value}</p>
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.05]">
            {["Judul & Deskripsi", "Dept / Kategori", "Slug", "Status", "Aksi"].map(h => (
              <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-widest text-white/20 px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(p => (
            <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
              <td className="px-5 py-3.5">
                <p className="text-[13.5px] font-medium text-white">{p.title}</p>
                {p.description && <p className="text-[11.5px] text-white/30 mt-0.5 max-w-[280px] truncate">{p.description}</p>}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <DeptBadge dept={p.dept} depts={depts} />
                  {p.category && <span className="text-[11px] text-white/25">{p.category}</span>}
                </div>
              </td>
              <td className="px-5 py-3.5">
                <code className="text-[11px] bg-[#181818] text-white/40 px-2 py-0.5 rounded-md">{p.slug}</code>
              </td>
              <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(p)} className="btn-icon"><Pencil size={13} /></button>
                  <button onClick={() => onDelete(p)} className="btn-icon-danger"><Trash2 size={13} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.05]">
            {["Judul & Deskripsi", "Tipe / Sub-Kategori", "Slug", "Icon", "Harga", "Status", "Aksi"].map(h => (
              <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-widest text-white/20 px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(l => (
            <tr key={l.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
              <td className="px-5 py-3.5">
                <p className="text-[13.5px] font-medium text-white">{l.title}</p>
                {l.description && <p className="text-[11.5px] text-white/30 mt-0.5 max-w-[280px] truncate">{l.description}</p>}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex flex-col gap-1">
                  <DeptBadge dept={l.dept} depts={depts} />
                  {l.category && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] text-white/35">
                      <Tag size={9} className="opacity-50" />
                      {l.category}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-5 py-3.5">
                <code className="text-[11px] bg-[#181818] text-white/40 px-2 py-0.5 rounded-md">/services/{l.slug}</code>
              </td>
              <td className="px-5 py-3.5">
                <code className="text-[11px] bg-[#ff914d]/10 text-[#ff914d] px-2 py-0.5 rounded-md">{l.icon || "—"}</code>
              </td>
              <td className="px-5 py-3.5">
                {l.prices && l.prices.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {(l.prices as PriceTier[]).map((t, i) => (
                      <span key={i} className="text-[10.5px] text-white/40">
                        <span className="text-white/60 font-medium">{t.name}</span> — {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(t.price)}
                      </span>
                    ))}
                  </div>
                ) : <span className="text-[11px] text-white/20 italic">Belum ada</span>}
              </td>
              <td className="px-5 py-3.5"><StatusBadge status={l.status} /></td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(l)} className="btn-icon"><Pencil size={13} /></button>
                  <button onClick={() => onDelete(l)} className="btn-icon-danger"><Trash2 size={13} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Portfolio Modal ────────────────────────────────────────────────────────
function PortfolioModal({ open, initial, onClose, onSaved, onError, depts }: {
  open: boolean; initial: Portfolio | null; depts: LayananDept[]
  onClose: () => void; onSaved: () => void; onError: (msg: string, t: "error") => void
}) {
  type PF = Omit<PortfolioInsert, "id" | "created_at" | "features" | "tech_stack"> & { features: string; tech_stack: string }
  const blank: PF = { title: "", slug: "", dept: (depts[0]?.value ?? "arcgis") as PF["dept"], category: "", description: "", image_url: "", result_url: "", features: "", tech_stack: "", status: "active" }
  const [form, setForm] = useState<PF>(blank)
  const [saving, setSaving] = useState(false)
  const [slugManual, setSlugManual] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({ title: initial.title, slug: initial.slug, dept: initial.dept, category: initial.category ?? "", description: initial.description ?? "", image_url: initial.image_url ?? "", result_url: initial.result_url ?? "", features: Array.isArray(initial.features) ? initial.features.join("\n") : "", tech_stack: Array.isArray(initial.tech_stack) ? initial.tech_stack.join("\n") : "", status: initial.status })
      setSlugManual(true)
    } else { setForm(blank); setSlugManual(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const handleTitle = (v: string) => { set("title", v); if (!slugManual) set("slug", slugify(v)) }

  const handleSubmit = async () => {
    if (!form.title || !form.slug) { onError("Judul dan slug wajib diisi", "error"); return }
    setSaving(true)
    const payload = { ...form, category: form.category || null, description: form.description || null, image_url: form.image_url || null, result_url: form.result_url || null, features: form.features ? form.features.split("\n").map(s => s.trim()).filter(Boolean) : null, tech_stack: form.tech_stack ? form.tech_stack.split("\n").map(s => s.trim()).filter(Boolean) : null }
    const res = initial
      ? await fetch(`/api/admin/portfolio?id=${initial.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSaving(false)
    if (!res.ok) { onError((await res.json()).error ?? "Save failed", "error"); return }
    onSaved()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader icon={<LayoutGrid size={16} className="text-[#ff914d]" />} iconBg="bg-[#ff914d]/10" title={initial ? "Edit Portofolio" : "Tambah Portofolio"} onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
        <Field label="Judul Proyek" required><Input value={form.title} onChange={handleTitle} placeholder="Sistem Pemetaan Tata Ruang" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Slug" required><Input value={form.slug} onChange={v => { setSlugManual(true); set("slug", v) }} placeholder="sistem-pemetaan" /></Field>
          <Field label="Departemen" required><Select value={form.dept} onChange={v => set("dept", v)} options={depts.map(d => ({ value: d.value, label: d.label }))} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Kategori"><Input value={form.category ?? ""} onChange={v => set("category", v)} placeholder="Web GIS, Mobile…" /></Field>
          <Field label="Status"><Select value={form.status} onChange={v => set("status", v)} options={[{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }]} /></Field>
        </div>
        <Field label="Deskripsi"><Textarea value={form.description ?? ""} onChange={v => set("description", v)} placeholder="Deskripsi singkat proyek…" /></Field>
        <Field label="URL Gambar">
          <Input value={form.image_url ?? ""} onChange={v => set("image_url", v)} placeholder="https://…" />
          {form.image_url && (
            <div className="mt-2 h-28 rounded-lg overflow-hidden border border-white/[0.07] bg-[#181818]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image_url} alt="preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
            </div>
          )}
        </Field>
        <Field label="URL Hasil Proyek"><Input value={form.result_url ?? ""} onChange={v => set("result_url", v)} placeholder="https://link-hasil.com" /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fitur (1 per baris)"><Textarea value={form.features} onChange={v => set("features", v)} placeholder={"Login\nDashboard\nExport PDF"} /></Field>
          <Field label="Tech Stack (1 per baris)"><Textarea value={form.tech_stack} onChange={v => set("tech_stack", v)} placeholder={"Next.js\nPrisma\nPostgreSQL"} /></Field>
        </div>
      </div>
      <ModalFooter>
        <button onClick={onClose} className="btn-ghost">Batal</button>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </ModalFooter>
    </Modal>
  )
}

// ── Layanan Modal ──────────────────────────────────────────────────────────
const DEFAULT_TIERS: PriceTier[] = [
  { name: "Starter", price: 3000000, bio: "Cocok untuk kebutuhan dasar dan organisasi kecil.", features: [""] },
  { name: "Standard", price: 7500000, bio: "Solusi lengkap untuk kebutuhan profesional.", features: [""] },
  { name: "Premium", price: 15000000, bio: "Paket terlengkap dengan dukungan penuh.", features: [""] },
]

function PriceTierEditor({ tier, index, onChange }: { tier: PriceTier; index: number; onChange: (t: PriceTier) => void }) {
  const COLORS = ["bg-white/5 border-white/[0.08]", "bg-[#ff914d]/5 border-[#ff914d]/20", "bg-white/5 border-white/[0.08]"]
  const LABELS = ["Paket 1 — Terendah", "Paket 2 — Tengah (Populer)", "Paket 3 — Tertinggi"]
  const setFeat = (fi: number, val: string) => { const f = [...tier.features]; f[fi] = val; onChange({ ...tier, features: f }) }
  return (
    <div className={cn("rounded-xl border p-4 space-y-3", COLORS[index])}>
      <p className="text-[10.5px] font-bold uppercase tracking-widest text-white/30">{LABELS[index]}</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nama Paket"><Input value={tier.name} onChange={v => onChange({ ...tier, name: v })} placeholder="Starter" /></Field>
        <Field label="Harga (IDR)">
          <input type="number" value={tier.price} onChange={e => onChange({ ...tier, price: Number(e.target.value) })} placeholder="3000000"
            className="w-full bg-[#181818] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#ff914d]/40 transition-colors" />
        </Field>
      </div>
      <Field label="Bio / Tagline"><Input value={tier.bio} onChange={v => onChange({ ...tier, bio: v })} placeholder="Cocok untuk…" /></Field>
      <Field label="Fitur yang Didapat">
        <div className="space-y-2">
          {tier.features.map((f, fi) => (
            <div key={fi} className="flex gap-2">
              <input value={f} onChange={e => setFeat(fi, e.target.value)} placeholder={`Fitur ${fi + 1}…`}
                className="flex-1 bg-[#181818] border border-white/[0.07] rounded-lg px-3 py-1.5 text-[12px] text-white placeholder:text-white/20 outline-none focus:border-[#ff914d]/40 transition-colors" />
              {tier.features.length > 1 && (
                <button onClick={() => onChange({ ...tier, features: tier.features.filter((_, i) => i !== fi) })} className="text-white/20 hover:text-red-400 transition-colors px-1"><X size={13} /></button>
              )}
            </div>
          ))}
          <button onClick={() => onChange({ ...tier, features: [...tier.features, ""] })} className="text-[11px] text-white/30 hover:text-[#ff914d] flex items-center gap-1 transition-colors mt-1">
            <Plus size={11} /> Tambah fitur
          </button>
        </div>
      </Field>
    </div>
  )
}

function LayananModal({ open, initial, onClose, onSaved, onError, depts }: {
  open: boolean; initial: Layanan | null; depts: LayananDept[]
  onClose: () => void; onSaved: () => void; onError: (msg: string, t: "error") => void
}) {
  const blank = { title: "", slug: "", dept: depts[0]?.value ?? "arcgis", category: "", description: "", icon: "map", status: "active" as Status, prices: DEFAULT_TIERS }
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [slugManual, setSlugManual] = useState(false)

  const getDept = (v: string) => depts.find(d => d.value === v)
  const selectedDept = getDept(form.dept) ?? depts[0]

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({ title: initial.title, slug: initial.slug, dept: initial.dept, category: initial.category ?? "", description: initial.description ?? "", icon: initial.icon ?? "map", status: initial.status, prices: (initial.prices as PriceTier[]) ?? DEFAULT_TIERS })
      setSlugManual(true)
    } else { setForm(blank); setSlugManual(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const handleTitle = (v: string) => { set("title", v); if (!slugManual) set("slug", slugify(v)) }
  const handleDeptChange = (v: string) => { set("dept", v); set("category", "") }
  const updateTier = (i: number, t: PriceTier) => { const tiers = [...form.prices]; tiers[i] = t; set("prices", tiers) }

  const handleSubmit = async () => {
    if (!form.title || !form.slug) { onError("Nama dan slug wajib diisi", "error"); return }
    setSaving(true)
    const payload = { title: form.title, slug: form.slug, dept: form.dept, category: form.category || null, description: form.description || null, icon: form.icon || "map", prices: form.prices, status: form.status }
    const res = initial
      ? await fetch(`/api/admin/layanan?id=${initial.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/admin/layanan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setSaving(false)
    if (!res.ok) { onError((await res.json()).error ?? "Save failed", "error"); return }
    onSaved()
  }

  const iconOptions = ["map", "globe", "database", "layers", "smartphone", "map-pin", "code", "monitor", "server", "layout", "cloud", "headphones", "shield-check", "zap", "plug", "users"]

  return (
    <Modal open={open} onClose={onClose} maxW="max-w-2xl">
      <ModalHeader icon={<Layers size={16} className="text-[#ff914d]" />} iconBg="bg-[#ff914d]/10" title={initial ? "Edit Layanan" : "Tambah Layanan"} onClose={onClose} />
      <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
        <Field label="Nama Layanan" required><Input value={form.title} onChange={handleTitle} placeholder="Pengembangan ArcGIS" /></Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Slug / Href" required hint={`URL: /services/${form.slug || "slug"}`}>
            <Input value={form.slug} onChange={v => { setSlugManual(true); set("slug", v) }} placeholder="arcgis-development" />
          </Field>
          {/* Tipe Layanan — dynamic from LAYANAN_DEPTS config */}
          <Field label="Tipe Layanan" required>
            <Select value={form.dept} onChange={handleDeptChange} options={depts.map(d => ({ value: d.value, label: d.label }))} />
          </Field>
        </div>

        {/* Sub-kategori with quick-pick chips */}
        <Field label="Sub-Kategori" hint="Pilih cepat di bawah, atau ketik nama sendiri">
          <Input
            value={form.category}
            onChange={v => set("category", v)}
            placeholder={selectedDept?.subCategories[0] ?? "Contoh: Web GIS, Training…"}
          />
          {selectedDept?.subCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {selectedDept.subCategories.map(sc => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => set("category", sc)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all",
                    form.category === sc
                      ? "border-[#ff914d]/40 text-[#ff914d] bg-[#ff914d]/10"
                      : "border-white/[0.07] text-white/30 bg-[#181818] hover:text-white/60 hover:border-white/15"
                  )}
                >
                  {sc}
                </button>
              ))}
              {form.category && !selectedDept.subCategories.includes(form.category) && (
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  ✓ Custom: {form.category}
                </span>
              )}
              {form.category && (
                <button onClick={() => set("category", "")} className="px-2 py-1 rounded-lg text-[11px] text-white/20 hover:text-white/50 transition-colors">
                  <X size={11} />
                </button>
              )}
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Icon (Lucide)" hint="Nama dari lucide.dev"><Input value={form.icon ?? ""} onChange={v => set("icon", v)} placeholder="map, globe, code…" /></Field>
          <Field label="Status"><Select value={form.status} onChange={v => set("status", v)} options={[{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }]} /></Field>
        </div>

        <Field label="Pilih Cepat Icon">
          <div className="flex flex-wrap gap-2 mt-1">
            {iconOptions.map(ic => (
              <button key={ic} onClick={() => set("icon", ic)}
                className={cn("px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all",
                  form.icon === ic ? "bg-[#ff914d]/10 text-[#ff914d] border-[#ff914d]/30" : "bg-[#181818] text-white/30 border-white/[0.06] hover:text-white/60")}>
                {ic}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Deskripsi"><Textarea value={form.description ?? ""} onChange={v => set("description", v)} placeholder="Deskripsi layanan…" /></Field>

        <div className="pt-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10.5px] font-bold uppercase tracking-widest text-white/30">Paket Harga (3 Tier)</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <div className="space-y-4">
            {form.prices.map((tier, i) => <PriceTierEditor key={i} tier={tier} index={i} onChange={t => updateTier(i, t)} />)}
          </div>
        </div>
      </div>
      <ModalFooter>
        <button onClick={onClose} className="btn-ghost">Batal</button>
        <button onClick={handleSubmit} disabled={saving} className="btn-primary">
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={cn("bg-[#111] border border-white/[0.07] rounded-2xl w-full overflow-hidden animate-scale-in shadow-2xl", maxW)}>{children}</div>
    </div>
  )
}

function ModalHeader({ icon, iconBg, title, onClose }: { icon: React.ReactNode; iconBg: string; title: string; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.07]">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>{icon}</div>
      <h2 className="font-bold text-[15px] flex-1">{title}</h2>
      <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors p-1 rounded-lg hover:bg-white/[0.06]"><X size={17} /></button>
    </div>
  )
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-white/[0.07]">{children}</div>
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11.5px] font-semibold text-white/50 mb-1.5">{label}{required && <span className="text-[#ff914d] ml-0.5">*</span>}</label>
      {children}
      {hint && <p className="text-[10.5px] text-white/25 mt-1">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-[#181818] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#ff914d]/40 transition-colors" />
}

function Textarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className="w-full bg-[#181818] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#ff914d]/40 transition-colors resize-y" />
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full appearance-none bg-[#181818] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#ff914d]/40 transition-colors pr-8">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  )
}

function TableLoading() {
  return <div className="flex items-center justify-center gap-2 py-14 text-white/30 text-[13px]"><Loader2 size={16} className="animate-spin" /> Memuat data…</div>
}

function TableEmpty({ label }: { label: string }) {
  return <div className="py-14 text-center text-white/25 text-[13px]"><LayoutGrid size={28} className="mx-auto mb-3 opacity-20" />Belum ada data {label}</div>
}
// ── Tipe Table ─────────────────────────────────────────────────────────────
function TipeTable({ depts, onEdit, onDelete }: {
  depts: LayananDept[]
  onEdit: (d: LayananDept) => void
  onDelete: (d: LayananDept) => void
}) {
  if (!depts.length) return <TableEmpty label="tipe layanan" />
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.05]">
            {["Nama & Deskripsi", "Value (Slug)", "Warna / Badge", "Sub-Kategori", "Aksi"].map(h => (
              <th key={h} className="text-left text-[10.5px] font-bold uppercase tracking-widest text-white/20 px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {depts.map(d => (
            <tr key={d.value} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
              <td className="px-5 py-3.5">
                <p className="text-[13.5px] font-medium text-white">{d.label}</p>
                {d.description && <p className="text-[11.5px] text-white/30 mt-0.5">{d.description}</p>}
              </td>
              <td className="px-5 py-3.5">
                <code className="text-[11px] bg-[#181818] text-white/40 px-2 py-0.5 rounded-md">{d.value}</code>
              </td>
              <td className="px-5 py-3.5">
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ring-1", d.badgeClass)}>
                  {d.label}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <div className="flex flex-wrap gap-1">
                  {d.subCategories.slice(0, 3).map(sc => (
                    <span key={sc} className="text-[10px] text-white/35 bg-white/[0.04] px-2 py-0.5 rounded-md">{sc}</span>
                  ))}
                  {d.subCategories.length > 3 && (
                    <span className="text-[10px] text-white/20">+{d.subCategories.length - 3} lagi</span>
                  )}
                </div>
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(d)} className="btn-icon"><Pencil size={13} /></button>
                  <button onClick={() => onDelete(d)} className="btn-icon-danger"><Trash2 size={13} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Tipe Modal ─────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  { color: "#ff914d", badge: "bg-[#ff914d]/10 text-[#ff914d] ring-[#ff914d]/20" },
  { color: "#60a5fa", badge: "bg-blue-400/10 text-blue-400 ring-blue-400/20" },
  { color: "#34d399", badge: "bg-emerald-400/10 text-emerald-400 ring-emerald-400/20" },
  { color: "#a78bfa", badge: "bg-purple-400/10 text-purple-400 ring-purple-400/20" },
  { color: "#f472b6", badge: "bg-pink-400/10 text-pink-400 ring-pink-400/20" },
  { color: "#fb923c", badge: "bg-orange-400/10 text-orange-400 ring-orange-400/20" },
  { color: "#facc15", badge: "bg-yellow-400/10 text-yellow-400 ring-yellow-400/20" },
  { color: "#0a6e8a", badge: "bg-[#0a6e8a]/10 text-[#0a6e8a] ring-[#0a6e8a]/20" },
  { color: "#f87171", badge: "bg-red-400/10 text-red-400 ring-red-400/20" },
  { color: "#2dd4bf", badge: "bg-teal-400/10 text-teal-400 ring-teal-400/20" },
]

function TipeModal({ open, initial, onClose, onSaved, onError, existingValues }: {
  open: boolean; initial: LayananDept | null; existingValues: string[]
  onClose: () => void; onSaved: (d: LayananDept) => void; onError: (msg: string, t: "error") => void
}) {
  const blank: LayananDept = {
    value: "", label: "", description: "",
    color: PRESET_COLORS[0].color, badgeClass: PRESET_COLORS[0].badge,
    subCategories: []
  }
  const [form, setForm] = useState<LayananDept>(blank)
  const [newSub, setNewSub] = useState("")
  const [valueManual, setValueManual] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) { setForm({ ...initial }); setValueManual(true) }
    else { setForm(blank); setValueManual(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const set = (k: keyof LayananDept, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleLabel = (v: string) => {
    set("label", v)
    if (!valueManual) set("value", v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 20))
  }

  const selectColor = (preset: typeof PRESET_COLORS[0]) => {
    set("color", preset.color)
    set("badgeClass", preset.badge)
  }

  const addSub = () => {
    if (!newSub.trim()) return
    set("subCategories", [...form.subCategories, newSub.trim()])
    setNewSub("")
  }

  const removeSub = (i: number) => {
    set("subCategories", form.subCategories.filter((_, idx) => idx !== i))
  }

  const handleSubmit = () => {
    if (!form.label.trim()) { onError("Nama tipe wajib diisi", "error"); return }
    if (!form.value.trim()) { onError("Value / slug wajib diisi", "error"); return }
    if (!initial && existingValues.includes(form.value)) { onError("Value sudah dipakai tipe lain", "error"); return }
    onSaved(form)
  }

  return (
    <Modal open={open} onClose={onClose} maxW="max-w-lg">
      <ModalHeader
        icon={<Settings size={16} className="text-[#ff914d]" />}
        iconBg="bg-[#ff914d]/10"
        title={initial ? "Edit Tipe Layanan" : "Tambah Tipe Layanan"}
        onClose={onClose}
      />
      <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nama Tipe" required>
            <Input value={form.label} onChange={handleLabel} placeholder="Contoh: Survey & Drone" />
          </Field>
          <Field label="Value (slug unik)" required hint="Huruf kecil, tanpa spasi">
            <Input
              value={form.value}
              onChange={v => { setValueManual(true); set("value", v.toLowerCase().replace(/[^a-z0-9-]/g, "")) }}
              placeholder="survey-drone"
            />
          </Field>
        </div>

        <Field label="Deskripsi">
          <Input value={form.description ?? ""} onChange={v => set("description", v)} placeholder="Departemen Survei Lapangan…" />
        </Field>

        <Field label="Warna Tema">
          <div className="flex flex-wrap gap-2 mt-1">
            {PRESET_COLORS.map(p => (
              <button
                key={p.color}
                type="button"
                onClick={() => selectColor(p)}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition-all",
                  form.color === p.color ? "border-white scale-110" : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: p.color }}
              />
            ))}
          </div>
          <div className="mt-2">
            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ring-1", form.badgeClass)}>
              {form.label || "Preview Badge"}
            </span>
          </div>
        </Field>

        <Field label="Sub-Kategori" hint="Tekan Enter atau klik + untuk tambah">
          <div className="flex gap-2">
            <input
              value={newSub}
              onChange={e => setNewSub(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSub() } }}
              placeholder="Contoh: Web GIS, Drone Survey…"
              className="flex-1 bg-[#181818] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 outline-none focus:border-[#ff914d]/40 transition-colors"
            />
            <button
              type="button"
              onClick={addSub}
              className="px-3 py-2 bg-[#ff914d]/10 text-[#ff914d] rounded-lg hover:bg-[#ff914d]/20 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          {form.subCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.subCategories.map((sc, i) => (
                <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.05] text-white/60 border border-white/[0.08]">
                  {sc}
                  <button type="button" onClick={() => removeSub(i)} className="text-white/30 hover:text-red-400 transition-colors ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>
      </div>
      <ModalFooter>
        <button onClick={onClose} className="btn-ghost">Batal</button>
        <button onClick={handleSubmit} className="btn-primary"><Save size={13} /> Simpan</button>
      </ModalFooter>
    </Modal>
  )
}
