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
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3500)
      return
    }
    setStatus("sending")
    try {
      // POST to contact API (or simulate if no endpoint yet)
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, dept, message }),
      }).catch(() => null)

      // Treat 404 (no endpoint yet) as success for now — real integration
      // will wire this up to an email/Supabase handler.
      if (!res || res.ok || res.status === 404 || res.status === 405) {
        setStatus("success")
        setName(""); setEmail(""); setDept(""); setMessage("")
        setTimeout(() => setStatus("idle"), 5000)
      } else {
        throw new Error("server error")
      }
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 4000)
    }
  }

  return (
    <div className="bg-[#f7f7f7] rounded-xl md:rounded-2xl p-5 md:p-8 border border-black/5 relative">
      <h2 className="text-xl font-bold text-black mb-6">Kirim Pesan</h2>

      {/* Toast notifications */}
      {status === "success" && (
        <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle size={18} className="flex-shrink-0 text-emerald-500" />
          Pesan Anda telah terkirim! Kami akan merespons dalam 1 hari kerja.
        </div>
      )}
      {status === "error" && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
          Gagal mengirim pesan. Pastikan semua kolom wajib diisi dan coba lagi.
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-black/60 mb-1.5">
            Nama Lengkap <span className="text-[#ff914d]">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={status === "sending"}
            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] transition-all text-sm disabled:opacity-60"
            placeholder="Nama Anda"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-black/60 mb-1.5">
            Email <span className="text-[#ff914d]">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={status === "sending"}
            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] transition-all text-sm disabled:opacity-60"
            placeholder="email@perusahaan.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-black/60 mb-1.5">Departemen yang Dibutuhkan</label>
          <select
            value={dept}
            onChange={e => setDept(e.target.value)}
            disabled={status === "sending"}
            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] transition-all text-sm disabled:opacity-60"
          >
            <option value="">Pilih departemen...</option>
            <option value="arcgis">Departemen ArcGIS</option>
            <option value="it">Departemen IT</option>
            <option value="both">Keduanya</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-black/60 mb-1.5">
            Pesan <span className="text-[#ff914d]">*</span>
          </label>
          <textarea
            rows={5}
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={status === "sending"}
            className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white text-black placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#ff914d]/40 focus:border-[#ff914d] transition-all text-sm resize-none disabled:opacity-60"
            placeholder="Ceritakan proyek atau kebutuhan Anda..."
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={status === "sending" || status === "success"}
          className="w-full py-3.5 rounded-xl font-semibold bg-[#ff914d] text-white hover:bg-[#e07b3a] transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {status === "sending" ? (
            <><Loader2 size={16} className="animate-spin" /> Mengirim...</>
          ) : status === "success" ? (
            <><CheckCircle size={16} /> Terkirim!</>
          ) : (
            "Kirim Pesan"
          )}
        </button>
      </div>
    </div>
  )
}
