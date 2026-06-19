"use client"

import { useState } from "react"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"

export default function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [dept, setDept] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("error"); setTimeout(() => setStatus("idle"), 3500); return
    }
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, dept, message }),
      }).catch(() => null)
      if (!res || res.ok || res.status === 404 || res.status === 405) {
        setStatus("success"); setName(""); setEmail(""); setDept(""); setMessage("")
        setTimeout(() => setStatus("idle"), 5000)
      } else throw new Error("server error")
    } catch {
      setStatus("error"); setTimeout(() => setStatus("idle"), 4000)
    }
  }

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] transition-all text-[13px] disabled:opacity-60"
  const labelCls = "block text-[11px] font-semibold text-black/55 mb-1 uppercase tracking-wide"

  return (
    <div className="bg-[#f7f7f7] rounded-xl p-4 md:p-8 border border-black/5">
      <h2 className="text-[16px] md:text-xl font-bold text-black mb-4 md:mb-6">Kirim Pesan</h2>

      {status === "success" && (
        <div className="mb-3 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-3.5 py-2.5 text-[12px] font-medium">
          <CheckCircle size={15} className="flex-shrink-0 text-emerald-500" />
          Pesan terkirim! Kami akan merespons dalam 1 hari kerja.
        </div>
      )}
      {status === "error" && (
        <div className="mb-3 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3.5 py-2.5 text-[12px] font-medium">
          <AlertCircle size={15} className="flex-shrink-0 text-red-500" />
          Gagal mengirim. Pastikan semua kolom wajib diisi.
        </div>
      )}

      <div className="space-y-3 md:space-y-4">
        <div>
          <label className={labelCls}>Nama Lengkap <span className="text-[#ff914d]">*</span></label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} disabled={status === "sending"} className={inputCls} placeholder="Nama Anda" />
        </div>
        <div>
          <label className={labelCls}>Email <span className="text-[#ff914d]">*</span></label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={status === "sending"} className={inputCls} placeholder="email@perusahaan.com" />
        </div>
        <div>
          <label className={labelCls}>Jenis Layanan</label>
          <select value={dept} onChange={e => setDept(e.target.value)} disabled={status === "sending"} className={inputCls}>
            <option value="">Pilih layanan...</option>
            <option value="gis">GIS & Pemetaan</option>
            <option value="web">Pengembangan Web & Mobile</option>
            <option value="ml">Machine Learning & Data Science</option>
            <option value="kapal">Desain Kapal</option>
            <option value="other">Lainnya / Tidak Yakin</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Pesan <span className="text-[#ff914d]">*</span></label>
          <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} disabled={status === "sending"}
            className={`${inputCls} resize-none`} placeholder="Ceritakan proyek atau kebutuhan Anda..." />
        </div>
        <button onClick={handleSubmit} disabled={status === "sending" || status === "success"}
          className="w-full py-3 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-[13px]">
          {status === "sending" ? <><Loader2 size={14} className="animate-spin" /> Mengirim...</>
            : status === "success" ? <><CheckCircle size={14} /> Terkirim!</>
            : "Kirim Pesan"}
        </button>
      </div>
    </div>
  )
}
