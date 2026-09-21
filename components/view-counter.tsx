"use client"

import { useEffect } from "react"

/**
 * Menaikkan penghitung tampilan sekali setiap halaman dibuka atau di-refresh.
 *
 * Dijalankan di klien supaya hitungannya mencerminkan kunjungan nyata, bukan
 * proses build. Dipanggil dari halaman detail informasi dan berita.
 */
export default function ViewCounter({
  table,
  slug,
}: {
  table: "informasi" | "berita"
  slug: string
}) {
  useEffect(() => {
    if (!slug) return

    let cancelled = false

    // Dijalankan setelah halaman selesai dimuat supaya tidak menambah beban
    // pada jalur kritis render.
    const send = () => {
      if (cancelled) return
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table, slug }),
        keepalive: true,
      }).catch(() => {
        // Penghitung bukan hal kritis — kegagalan diabaikan diam-diam.
      })
    }

    if (document.readyState === "complete") send()
    else window.addEventListener("load", send, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener("load", send)
    }
  }, [table, slug])

  return null
}
