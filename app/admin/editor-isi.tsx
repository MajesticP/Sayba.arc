"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bold, Italic, Code, Link2, List, ListOrdered, Quote, Table2,
  ImagePlus, Minus, Heading1, Heading2, Heading3, Eye, PenLine,
  ChevronDown, Wand2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import IsiArtikel from "@/components/isi-artikel"
import { PANDUAN_TULIS } from "@/lib/markdown"

/**
 * EditorIsi: editor isi artikel untuk admin.
 *
 * Penulis TIDAK perlu menghafal penanda penulisan. Setiap penanda punya
 * tombolnya sendiri, dan hasilnya bisa dilihat langsung lewat tab Pratinjau.
 *
 * Cara kerja tombolnya:
 *  - Kalau ada teks yang disorot, teks itu langsung dibungkus penanda.
 *  - Kalau tidak ada, penanda disisipkan beserta contoh isi yang sudah
 *    tersorot, jadi tinggal diketik penggantinya.
 *  - Tombol yang sama diklik dua kali akan melepas penandanya (jadi sakelar).
 *
 * Pintasan papan tunjuk: Ctrl/Cmd+B (tebal), I (miring), E (kode), K (tautan).
 *
 * Pratinjau memakai komponen yang sama dengan halaman publik (IsiArtikel),
 * jadi yang terlihat di sini benar-benar sama dengan yang dilihat pembaca.
 * Karena itu pratinjau diberi latar putih: halaman artikel berlatar terang,
 * sedangkan panel admin berlatar gelap.
 */

interface Props {
  value: string
  onChange: (v: string) => void
  /** Dipanggil saat penulis menekan "Pakai" pada usulan waktu baca. */
  onUsulWaktuBaca?: (menit: number) => void
}

/** Kata per menit untuk bacaan teknis berbahasa Indonesia. */
const KATA_PER_MENIT = 200

export default function EditorIsi({ value, onChange, onUsulWaktuBaca }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [mode, setMode] = useState<"tulis" | "pratinjau">("tulis")
  const [dialogTabel, setDialogTabel] = useState(false)
  const [dialogGambar, setDialogGambar] = useState(false)
  const [tautanGambar, setTautanGambar] = useState("")
  const [keteranganGambar, setKeteranganGambar] = useState("")
  const [kolomTabel, setKolomTabel] = useState(3)
  const [barisTabel, setBarisTabel] = useState(3)
  const [panduanBuka, setPanduanBuka] = useState(false)

  // Posisi sorotan yang harus dipasang setelah React selesai menggambar ulang
  // kotak tulis. Tanpa ini, sorotan hilang setiap kali tombol diklik.
  const posisiRef = useRef<{ awal: number; akhir: number } | null>(null)

  useEffect(() => {
    const el = ref.current
    const posisi = posisiRef.current
    if (!el || !posisi) return
    posisiRef.current = null
    el.focus()
    el.setSelectionRange(posisi.awal, posisi.akhir)
  }, [value])

  const jumlahKata = value.trim() ? value.trim().split(/\s+/).length : 0
  const perkiraanMenit = Math.max(1, Math.round(jumlahKata / KATA_PER_MENIT))

  // ── Penyisipan ──────────────────────────────────────────────────────────────
  //
  // mode "inline": penanda dibungkuskan pada teks yang disorot (mis. **tebal**).
  // mode "baris" : penanda ditaruh di awal setiap baris yang tersentuh sorotan
  //                (mis. "- " untuk daftar). Diklik dua kali akan melepasnya.
  const sisip = (pre: string, post: string, contoh: string, mode: "inline" | "baris" = "inline") => {
    const el = ref.current
    if (!el) return
    const mulai = el.selectionStart ?? 0
    const akhir = el.selectionEnd ?? 0
    const teks = value

    if (mode === "baris") {
      const awalBaris = teks.lastIndexOf("\n", Math.max(0, mulai - 1)) + 1
      let akhirBaris = teks.indexOf("\n", akhir)
      if (akhirBaris === -1) akhirBaris = teks.length

      const asli = teks.slice(awalBaris, akhirBaris)
      const baris = (asli || contoh).split("\n")
      const sudahSemua = baris.every((b) => b.startsWith(pre))
      const hasil = baris
        .map((b) => (sudahSemua ? b.slice(pre.length) : pre + b))
        .join("\n")

      onChange(teks.slice(0, awalBaris) + hasil + teks.slice(akhirBaris))
      posisiRef.current = { awal: awalBaris, akhir: awalBaris + hasil.length }
      return
    }

    const terpilih = teks.slice(mulai, akhir)
    const isi = terpilih || contoh
    onChange(teks.slice(0, mulai) + pre + isi + post + teks.slice(akhir))
    posisiRef.current = { awal: mulai + pre.length, akhir: mulai + pre.length + isi.length }
  }

  // Tautan diperlakukan khusus: kalau teksnya sudah disorot, yang disorot
  // berikutnya adalah bagian alamatnya, supaya penulis bisa langsung menempel
  // URL tanpa menyentuh tetikus.
  const sisipTautan = () => {
    const el = ref.current
    if (!el) return
    const mulai = el.selectionStart ?? 0
    const akhir = el.selectionEnd ?? 0
    const teks = value
    const terpilih = teks.slice(mulai, akhir)
    const teksTautan = terpilih || "teks tautan"

    onChange(teks.slice(0, mulai) + `[${teksTautan}](https://)` + teks.slice(akhir))
    posisiRef.current = terpilih
      ? { awal: mulai + teksTautan.length + 3, akhir: mulai + teksTautan.length + 3 + 8 }
      : { awal: mulai + 1, akhir: mulai + 1 + teksTautan.length }
  }

  // Menempel tautan gambar: penulis membuka kotak kecil, menempelkan alamat,
  // lalu gambar langsung tersisip. Ini menggantikan cara lama yang meminta
  // penulis menulis penanda ![alt](url) sendiri — dan itu sebabnya tautan yang
  // ditempel apa adanya dulu tampil sebagai teks panjang, bukan gambar.
  const sisipGambar = () => {
    const tautan = tautanGambar.trim()
    if (!tautan) return
    const el = ref.current
    const mulai = el?.selectionStart ?? value.length
    const teks = value
    const perluBarisBaru = mulai > 0 && teks[mulai - 1] !== "\n"
    const alt = keteranganGambar.trim()
    const sisipan = `${perluBarisBaru ? "\n\n" : ""}![${alt}](${tautan})\n\n`

    onChange(teks.slice(0, mulai) + sisipan + teks.slice(mulai))
    posisiRef.current = { awal: mulai + sisipan.length, akhir: mulai + sisipan.length }
    setDialogGambar(false)
    setTautanGambar("")
    setKeteranganGambar("")
  }

  const sisipGaris = () => {
    const el = ref.current
    if (!el) return
    const mulai = el.selectionStart ?? 0
    const teks = value
    const perluBarisBaru = mulai > 0 && teks[mulai - 1] !== "\n"
    const sisipan = (perluBarisBaru ? "\n\n" : "") + "---\n\n"
    onChange(teks.slice(0, mulai) + sisipan + teks.slice(mulai))
    posisiRef.current = { awal: mulai + sisipan.length, akhir: mulai + sisipan.length }
  }

  const sisipTabel = () => {
    const el = ref.current
    if (!el) return
    const kolom = Math.min(8, Math.max(2, kolomTabel))
    const baris = Math.min(20, Math.max(1, barisTabel))

    const kepala = "| " + Array.from({ length: kolom }, (_, i) => `Kolom ${i + 1}`).join(" | ") + " |"
    const pemisah = "| " + Array.from({ length: kolom }, () => "---").join(" | ") + " |"
    const isiBaris = Array.from(
      { length: baris },
      () => "| " + Array.from({ length: kolom }, () => "Isi").join(" | ") + " |"
    )
    const tabel = [kepala, pemisah, ...isiBaris].join("\n")

    const mulai = el.selectionStart ?? 0
    const teks = value
    const perluBarisBaru = mulai > 0 && teks[mulai - 1] !== "\n"
    const sisipan = (perluBarisBaru ? "\n\n" : "") + tabel + "\n\n"

    onChange(teks.slice(0, mulai) + sisipan + teks.slice(mulai))
    setDialogTabel(false)
    posisiRef.current = { awal: mulai + sisipan.length, akhir: mulai + sisipan.length }
  }

  const papanTunjuk = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return
    const k = e.key.toLowerCase()
    if (k === "b") { e.preventDefault(); sisip("**", "**", "teks tebal") }
    else if (k === "i") { e.preventDefault(); sisip("*", "*", "teks miring") }
    else if (k === "e") { e.preventDefault(); sisip("`", "`", "kode") }
    else if (k === "k") { e.preventDefault(); sisipTautan() }
  }

  const gantiMode = (m: "tulis" | "pratinjau") => {
    if (m === "pratinjau") {
      // Simpan posisi kursor supaya saat kembali ke mode tulis, penulis
      // melanjutkan tepat di tempat ia berhenti.
      const el = ref.current
      if (el) posisiRef.current = { awal: el.selectionStart ?? 0, akhir: el.selectionEnd ?? 0 }
    }
    setMode(m)
  }

  const TombolAlat = ({
    ikon, label, onClick,
  }: { ikon: React.ReactNode; label: string; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
    >
      {ikon}
      <span className="hidden sm:inline whitespace-nowrap">{label}</span>
    </button>
  )

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#2d3733] overflow-hidden">
      {/* ── Baris atas: tab Tulis/Pratinjau + jumlah kata ── */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-white/[0.07] bg-white/[0.02]">
        <div className="flex items-center gap-0.5 rounded-lg bg-black/20 p-0.5">
          {([["tulis", "Tulis", PenLine], ["pratinjau", "Pratinjau", Eye]] as const).map(([m, label, Ikon]) => (
            <button
              key={m}
              type="button"
              onClick={() => gantiMode(m)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors",
                mode === m ? "bg-powder/15 text-powder" : "text-white/40 hover:text-white/70"
              )}
            >
              <Ikon size={12} />
              {label}
            </button>
          ))}
        </div>

        <span className="text-[10.5px] text-white/30 ml-auto whitespace-nowrap">
          {jumlahKata > 0 ? `${jumlahKata.toLocaleString("id-ID")} kata` : "belum ada isi"}
        </span>

        {onUsulWaktuBaca && jumlahKata >= 50 && (
          <button
            type="button"
            onClick={() => onUsulWaktuBaca(perkiraanMenit)}
            title={`Isi kolom Waktu Baca dengan ${perkiraanMenit} menit`}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-semibold text-powder bg-powder/10 hover:bg-powder/20 transition-colors whitespace-nowrap"
          >
            <Wand2 size={11} />
            {perkiraanMenit} mnt
          </button>
        )}
      </div>

      {/* ── Bilah tombol: hanya di mode tulis ── */}
      {mode === "tulis" && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-white/[0.07]">
          <TombolAlat ikon={<Heading1 size={13} />} label="Paragraf" onClick={() => sisip("# ", "", "Paragraf pembuka")} />
          <TombolAlat ikon={<Heading2 size={13} />} label="Sub-judul" onClick={() => sisip("## ", "", "Sub-judul", "baris")} />
          <TombolAlat ikon={<Heading3 size={13} />} label="Sub-sub" onClick={() => sisip("### ", "", "Sub-sub", "baris")} />

          <span className="w-px h-4 bg-white/[0.08] mx-1" />

          <TombolAlat ikon={<Bold size={13} />} label="Tebal" onClick={() => sisip("**", "**", "teks tebal")} />
          <TombolAlat ikon={<Italic size={13} />} label="Miring" onClick={() => sisip("*", "*", "teks miring")} />
          <TombolAlat ikon={<Code size={13} />} label="Kode" onClick={() => sisip("`", "`", "kode")} />
          <TombolAlat ikon={<Link2 size={13} />} label="Tautan" onClick={sisipTautan} />

          <span className="w-px h-4 bg-white/[0.08] mx-1" />

          <TombolAlat ikon={<List size={13} />} label="Daftar" onClick={() => sisip("- ", "", "Butir daftar", "baris")} />
          <TombolAlat ikon={<ListOrdered size={13} />} label="Nomor" onClick={() => sisip("1. ", "", "Butir bernomor", "baris")} />
          <TombolAlat ikon={<Quote size={13} />} label="Kutipan" onClick={() => sisip("> ", "", "Kutipan penting", "baris")} />

          <span className="w-px h-4 bg-white/[0.08] mx-1" />

          <TombolAlat
            ikon={<Table2 size={13} />}
            label="Tabel"
            onClick={() => setDialogTabel((v) => !v)}
          />
          <TombolAlat
            ikon={<ImagePlus size={13} />}
            label="Gambar"
            onClick={() => setDialogGambar((v) => !v)}
          />
          <TombolAlat ikon={<Minus size={13} />} label="Garis" onClick={sisipGaris} />
        </div>
      )}

      {/* ── Dialog tabel: muncul tepat di bawah tombolnya, bukan modal baru ── */}
      {mode === "tulis" && dialogTabel && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-white/[0.07] bg-powder/[0.06]">
          <span className="text-[11px] font-semibold text-powder">Sisipkan tabel</span>
          <label className="flex items-center gap-1.5 text-[11px] text-white/50">
            Kolom
            <input
              type="number" min={2} max={8} value={kolomTabel}
              onChange={(e) => setKolomTabel(Number(e.target.value))}
              className="w-12 bg-black/25 border border-white/[0.08] rounded-md px-1.5 py-0.5 text-[11px] text-white outline-none focus:border-powder/40"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-white/50">
            Baris isi
            <input
              type="number" min={1} max={20} value={barisTabel}
              onChange={(e) => setBarisTabel(Number(e.target.value))}
              className="w-12 bg-black/25 border border-white/[0.08] rounded-md px-1.5 py-0.5 text-[11px] text-white outline-none focus:border-powder/40"
            />
          </label>
          <button
            type="button" onClick={sisipTabel}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-powder text-carbon hover:bg-powder/90 transition-colors"
          >
            Sisipkan
          </button>
          <button
            type="button" onClick={() => setDialogTabel(false)}
            className="px-2 py-1 rounded-md text-[11px] text-white/40 hover:text-white/70 transition-colors"
          >
            Batal
          </button>
          <span className="text-[10.5px] text-white/30 w-full">
            Kerangka tabel disisipkan siap diisi. Ganti tulisan &quot;Kolom 1&quot; dan &quot;Isi&quot; dengan isi sebenarnya.
          </span>
        </div>
      )}

      {/* ── Dialog gambar: tempel tautan, langsung tersisip ── */}
      {mode === "tulis" && dialogGambar && (
        <div className="px-3 py-2.5 border-b border-white/[0.07] bg-powder/[0.06] space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-powder">Sisipkan gambar</span>
            <input
              type="url"
              value={tautanGambar}
              onChange={(e) => setTautanGambar(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sisipGambar() } }}
              placeholder="Tempel tautan gambar di sini, lalu tekan Enter"
              autoFocus
              className="flex-1 min-w-[200px] bg-black/25 border border-white/[0.08] rounded-md px-2 py-1 text-[11.5px] text-white placeholder:text-white/25 outline-none focus:border-powder/40"
            />
            <input
              type="text"
              value={keteranganGambar}
              onChange={(e) => setKeteranganGambar(e.target.value)}
              placeholder="Keterangan (opsional)"
              className="w-[170px] bg-black/25 border border-white/[0.08] rounded-md px-2 py-1 text-[11.5px] text-white placeholder:text-white/25 outline-none focus:border-powder/40"
            />
            <button
              type="button" onClick={sisipGambar} disabled={!tautanGambar.trim()}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-powder text-carbon hover:bg-powder/90 transition-colors disabled:opacity-40"
            >
              Sisipkan
            </button>
            <button
              type="button" onClick={() => { setDialogGambar(false); setTautanGambar(""); setKeteranganGambar("") }}
              className="px-2 py-1 rounded-md text-[11px] text-white/40 hover:text-white/70 transition-colors"
            >
              Batal
            </button>
          </div>
          <p className="text-[10.5px] text-white/30">
            Tautan dari mana pun bisa dipakai (Google Drive, galeri, atau tautan gambar lain). Gambarnya
            otomatis disajikan lewat situs ini, jadi tidak akan diblokir kebijakan keamanan.
          </p>
        </div>
      )}

      {/* ── Kotak tulis / pratinjau ── */}
      {mode === "tulis" ? (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={papanTunjuk}
          rows={14}
          placeholder={"Tulis isi artikel di sini, lalu pakai tombol di atas untuk mengatur bentuknya.\n\nTidak perlu menulis penanda apa pun secara manual."}
          className="w-full bg-transparent px-3 py-2.5 text-[13px] leading-relaxed text-white placeholder:text-white/20 outline-none resize-y font-mono"
        />
      ) : (
        <div className="max-h-[420px] overflow-y-auto bg-white">
          {value.trim() ? (
            <div className="px-4 py-4">
              <IsiArtikel body={value} />
            </div>
          ) : (
            <p className="px-4 py-8 text-center text-[12.5px] text-gray-400">
              Belum ada isi untuk dipratinjau.
            </p>
          )}
        </div>
      )}

      {/* ── Panduan singkat: tertutup, dibuka hanya saat dibutuhkan ── */}
      <div className="border-t border-white/[0.07]">
        <button
          type="button"
          onClick={() => setPanduanBuka((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.02] transition-colors"
        >
          <ChevronDown
            size={12}
            className={cn("text-white/30 transition-transform", panduanBuka && "rotate-180")}
          />
          <span className="text-[10.5px] font-semibold text-white/40">
            Panduan penulisan &amp; pintasan papan tunjuk
          </span>
        </button>

        {panduanBuka && (
          <div className="px-3 pb-3 space-y-2.5">
            <p className="text-[10.5px] text-white/35 leading-relaxed">
              Semua tombol di atas bekerja pada teks yang sedang disorot. Kalau tidak ada yang disorot,
              penanda disisipkan beserta contoh isi yang sudah tersorot — tinggal diketik penggantinya.
              Menekan tombol yang sama dua kali akan melepas penandanya.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[["Ctrl+B", "Tebal"], ["Ctrl+I", "Miring"], ["Ctrl+E", "Kode"], ["Ctrl+K", "Tautan"]].map(([kunci, arti]) => (
                <span key={kunci} className="flex items-center gap-1.5 text-[10px] text-white/35">
                  <code className="font-mono font-bold text-white/60 bg-black/25 px-1.5 py-0.5 rounded">{kunci}</code>
                  {arti}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-1 border-t border-white/[0.06]">
              {PANDUAN_TULIS.map((t) => (
                <div key={t.sintaks} className="flex items-baseline gap-2.5">
                  <code className="text-[10px] font-mono font-bold text-powder/70 bg-powder/10 px-1.5 py-0.5 rounded shrink-0 min-w-[6.5rem]">
                    {t.sintaks}
                  </code>
                  <span className="text-[10px] text-white/35 leading-snug">{t.arti}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
