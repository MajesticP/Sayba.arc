/**
 * ── DEPARTEMEN LAYANAN: NILAI BAWAAN ─────────────────────────────────────────
 *
 * Daftar ini adalah NILAI BAWAAN, bukan daftar tertutup. Departemen
 * sesungguhnya disimpan di tabel `layanan_depts` dan bisa ditambah, diubah,
 * atau dihapus dari admin (tab Kategori, sub-tab Departemen).
 *
 * Daftar di berkas ini dipakai untuk dua hal:
 *   1. Mengisi tabel saat pertama kali dibuat (lihat SUPABASE_SETUP.sql).
 *   2. Menjadi cadangan bila tabel belum ada, sehingga situs tetap tampil
 *      benar sebelum migrasi dijalankan.
 *
 * Nilai `value` disimpan di kolom `dept` tabel `layanan`, jadi mengubahnya
 * pada departemen yang sudah dipakai akan memutus kaitan dengan layanan lama.
 * Admin menangani hal ini dengan mengunci `value` saat mengedit.
 */

export interface LayananDept {
  /** Disimpan di DB: harus cocok dengan kolom `dept` */
  value: string
  /** Label yang tampil di UI */
  label: string
  /** Penjelasan singkat departemen */
  description: string
  /** Warna aksen dari palet (lihat DESIGN.md) */
  color: string
  /** Ringkasan lingkup kerja. Boleh kosong; kartu departemen tetap tampil. */
  scope: string[]
  /** Urutan tampil di halaman publik. */
  sort_order?: number
}

export const LAYANAN_DEPTS: LayananDept[] = [
  {
    value: "it_konsulting",
    label: "IT Consultant",
    description:
      "Pengembangan perangkat lunak, sistem informasi, dan infrastruktur digital yang dipakai sehari-hari oleh tim Anda.",
    color: "#f07a26",
    scope: [
      "Website & aplikasi web",
      "Aplikasi mobile & desktop",
      "Backend, API, dan basis data",
      "Machine learning & analisis data",
      "Cloud, deployment, dan pemeliharaan",
    ],
  },
  {
    value: "engineering_konsulting",
    label: "Engineering Consultant",
    description:
      "Pemetaan spasial, rancang bangun, dan dokumen teknik yang siap dipakai untuk perizinan maupun pelaksanaan lapangan.",
    color: "#5a5c62",
    scope: [
      "Pemetaan & analisis spasial (GIS)",
      "Gambar teknik 2D & 3D (AutoCAD)",
      "Desain rancang bangun",
      "Survey dan pengolahan data lapangan",
      "Dokumen teknis & laporan",
    ],
  },
]

/** Cari departemen berdasarkan value */
export const getDept = (value: string): LayananDept | undefined =>
  LAYANAN_DEPTS.find((d) => d.value === value)

/** Label departemen; fallback: ubah "foo_bar" jadi "Foo Bar" */
export const getDeptLabel = (value: string): string =>
  getDept(value)?.label ??
  value
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

/** Warna aksen departemen */
export const getDeptColor = (value: string): string =>
  getDept(value)?.color ?? "#5a5c62"


/**
 * Baca departemen dari database, dengan cadangan konfigurasi kode.
 *
 * Dipakai halaman publik supaya departemen yang ditambah dari admin langsung
 * tampil, tanpa perlu deploy. Kalau tabelnya belum ada atau belum diisi,
 * daftar bawaan di atas yang dipakai sehingga situs tetap benar.
 *
 * Hasilnya selalu berurutan menurut `sort_order`.
 */
export async function getDepts(): Promise<LayananDept[]> {
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if (!url || !key) return LAYANAN_DEPTS

    const supabase = createClient(url, key)
    const { data, error } = await supabase
      .from("layanan_depts")
      .select("value, label, description, color, sub_categories, sort_order")
      .order("sort_order", { ascending: true })

    if (error || !data?.length) return LAYANAN_DEPTS

    const rows = data as Array<{
      value: string
      label: string
      description: string | null
      color: string | null
      sub_categories: string[] | null
      sort_order: number | null
    }>

    // Departemen dari database dipakai apa adanya. Lingkup kerja yang kosong
    // diisi dari konfigurasi kode bila kodenya sama, supaya kartu departemen
    // lama tidak mendadak kosong setelah migrasi.
    return rows.map((r) => {
      const bawaan = LAYANAN_DEPTS.find((d) => d.value === r.value)
      return {
        value: r.value,
        label: r.label,
        description: r.description ?? bawaan?.description ?? "",
        color: r.color ?? bawaan?.color ?? "#5a5c62",
        scope: r.sub_categories?.length ? r.sub_categories : (bawaan?.scope ?? []),
        sort_order: r.sort_order ?? bawaan?.sort_order ?? 0,
      }
    })
  } catch {
    return LAYANAN_DEPTS
  }
}


/**
 * Cari departemen di dalam daftar yang diberikan.
 *
 * Dipakai halaman yang sudah punya daftar departemen dari database, supaya
 * departemen yang ditambah dari admin ikut dikenali. Versi `getDept` di atas
 * hanya membaca daftar bawaan di berkas ini, jadi ia tidak tahu departemen
 * baru; versi ini menerima daftarnya sebagai argumen.
 */
export const findDept = (depts: LayananDept[], value: string): LayananDept | undefined =>
  depts.find((d) => d.value === value)

/** Label departemen dari daftar yang diberikan; cadangan: ubah "foo_bar". */
export const findDeptLabel = (depts: LayananDept[], value: string): string =>
  findDept(depts, value)?.label ??
  value
    .split(/[_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

/** Warna departemen dari daftar yang diberikan. */
export const findDeptColor = (depts: LayananDept[], value: string): string =>
  findDept(depts, value)?.color ?? "#5a5c62"
