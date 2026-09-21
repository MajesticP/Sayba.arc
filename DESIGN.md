# SAYBA ARC — Arah Desain & Palet Warna

Dokumen ini adalah sumber kebenaran tunggal untuk warna dan arah visual situs.
Setiap keputusan warna harus bisa dijelaskan dalam satu baris (alasan tertulis).

## Ringkasan arah

**Dibaca sebagai:** situs agensi digital & engineering untuk klien bisnis dan
instansi di Indonesia, dengan bahasa visual industrial-warm yang rapi,
dial **ENERGY 2 / RHYTHM 2 / MOTION 2**.

- **ENERGY 2 (seimbang):** hero tegas, sisanya tenang. Bukan landing page yang berteriak.
- **RHYTHM 2 (konsisten dengan beberapa jeda):** komposisi seragam, dengan 2-3 section yang sengaja dibedakan (hero, sorotan, CTA).
- **MOTION 2 (reveal saat scroll):** animasi untuk memandu perhatian, bukan mengisi halaman. Tidak ada loop tanpa akhir kecuali orb latar yang sangat halus.

## Skema harmoni

**Analog hangat untuk warna inti, aksen komplementer.**

- Inti: keluarga oranye (`#ff914d` dan turunannya). Satu hue, beberapa tingkat terang.
- Netral: hitam `#111111` / `#000000` dan putih, dengan sedikit tarikan kroma hangat.
- Semantik: hijau (`#25D366` untuk WhatsApp), merah (`#ef4444` untuk hapus).

Ini memberi satu aksen yang jelas tanpa keluarga hue kedua yang bersaing.

## Palet

### Brand orange (satu hue, beberapa tingkat)

| Token | Nilai | Peran | Alasan |
|---|---|---|---|
| `brand-400` | `#ff914d` | Fill, tombol, ikon & teks di atas gelap | Warna identitas SAYBA ARC; 9.41:1 di atas hitam |
| `brand-500` | `#e07b3a` | Hover untuk fill | Satu tingkat lebih gelap, hue dipertahankan |
| `brand-700` | `#b35418` | **Teks** orange di atas latar terang | 5.00:1 di putih, 4.79:1 di `#fafafa`, lolos WCAG AA |
| `brand-800` | `#8f400f` | Hover untuk teks orange | 7.22:1 di putih |

**Aturan pakai:**
- `#ff914d` **hanya** untuk fill, tombol, ikon, dan teks di atas latar gelap.
- `#b35418` **wajib** untuk teks orange di atas latar terang.
- Jangan pakai `#ff914d` sebagai teks di latar terang: 2.23:1, gagal WCAG AA.

### Netral

| Token | Nilai | Peran | Alasan |
|---|---|---|---|
| `ink` | `#111111` | Teks utama, latar section gelap | 18.88:1 di putih, jauh di atas AAA |
| `ink-soft` | `#000000` | Latar section paling gelap | Memberi kedalaman pada blok CTA |
| `surface` | `#ffffff` | Latar utama | Netral bersih untuk konten panjang |
| `surface-alt` | `#f7f7f7` | Latar section pembeda | Memisahkan blok tanpa menambah warna |

### Semantik

| Token | Nilai | Peran | Catatan |
|---|---|---|---|
| `success` | `#25D366` | Tombol WhatsApp | Warna resmi WhatsApp, dikenali pengguna |
| `danger` | `#ef4444` | Aksi hapus di admin | Hanya di panel admin |

## Kontras (diverifikasi)

Semua pasangan diuji dengan `contrast-check.py` (WCAG 2.x).
Ambang: 4.5:1 untuk teks normal, 3:1 untuk teks besar (18px+).

| Pasangan | Rasio | Status |
|---|---|---|
| `#111111` di `#ffffff` | 18.88:1 | Lolos AAA |
| `#b35418` di `#ffffff` | 5.00:1 | Lolos AA |
| `#b35418` di `#fafafa` | 4.79:1 | Lolos AA |
| `#b35418` di `#f7f7f7` | 4.67:1 | Lolos AA |
| `#8f400f` di `#ffffff` | 7.22:1 | Lolos AAA |
| `#111111` di `#ff914d` | 8.46:1 | Lolos AAA (teks tombol) |
| `#111111` di `#e07b3a` | 6.35:1 | Lolos AA (hover tombol) |
| `#ff914d` di `#000000` | 9.41:1 | Lolos AAA (teks di latar gelap) |
| `#ff914d` di `#ffffff` | 2.23:1 | **GAGAL** — jangan dipakai untuk teks |
| `#ffffff` di `#ff914d` | 2.23:1 | **GAGAL** — karena itu tombol pakai teks `#111111` |

Cara memverifikasi ulang:

```bash
python ~/AppData/Local/hermes/skills/design/antislop-human/contrast-check.py "#b35418" "#ffffff"
```

## Aturan yang mengikat

1. Maksimal **2-3 warna inti + 1 aksen**. Netral tidak dihitung.
2. Setiap pasangan teks/latar wajib lolos WCAG AA, diverifikasi dengan alat, bukan dikira-kira.
3. Setiap keputusan warna ditulis alasannya dalam satu baris.
4. Tombol orange selalu berteks `#111111`, bukan putih.
5. Teks orange di latar terang selalu `#b35418`, bukan `#ff914d`.

## Tipografi

Geist (via `next/font/google`) untuk seluruh situs.

Alasan: sans-serif geometris dengan terminal terbuka, netral untuk teks
Indonesia yang panjang, dan disajikan dari domain sendiri sehingga tidak ada
permintaan ke Google Fonts saat runtime.

## Radius

| Nilai | Dipakai untuk |
|---|---|
| `rounded-lg` | Tombol kecil, chip |
| `rounded-xl` | Tombol utama, input, kartu kecil |
| `rounded-2xl` | Kartu konten, panel |
| `rounded-3xl` | Blok sorotan, CTA besar |
| `rounded-full` | Hanya badge status dan avatar |

Radius bervariasi menurut hierarki, bukan seragam di semua elemen.
