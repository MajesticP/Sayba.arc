# Gambar Placeholder — SAYBA ARC

File di folder `banners/`, `promo/`, dan `berita/` adalah **placeholder** bergaya tema situs
(hitam + oranye `#ff914d`).

> Logo (`logo.png`, `Sayba Arc.png`, dll.) di root `public/` bukan placeholder — jangan diganti.

## Mana yang diganti lewat Admin, mana yang diganti lewat file

| Gambar | Cara mengganti |
|---|---|
| Banner carousel beranda | **Admin Dashboard → Banner** (upload langsung) |
| Gambar artikel berita | **Admin Dashboard → Berita** (upload langsung) |
| Hero banner tiap halaman | **Timpa file** di `banners/` (belum ada tab admin) |

Gambar yang diunggah lewat admin disimpan di Supabase Storage, bukan di folder ini. File di
`promo/` dan `berita/` hanya dipakai sebagai isi awal (seed) saat migrasi dijalankan pertama kali.

---

## `/banners` — Hero banner tiap halaman (1920 × 600 px)

Diganti dengan **menimpa file**, pertahankan nama filenya.

| File | Dipakai di |
|---|---|
| `services-1920x600.png` | `/services` — Layanan |
| `products-1920x600.png` | `/products` — Produk |
| `portfolio-1920x600.png` | `/portfolio` — Portofolio |
| `berita-1920x600.png` | `/berita` — Berita |
| `about-1920x600.png` | `/about` — Tentang Kami |
| `contact-1920x600.png` | `/contact` — Kontak |

Beranda (`/`) sengaja **tidak** memakai banner — hero-nya dibiarkan seperti semula.

Di atas gambar dipasang scrim gelap otomatis, jadi teks tetap terbaca dengan gambar apa pun.
Bagian tengah tertutup judul — letakkan objek utama di sisi kiri atau kanan.

## `/promo` — Banner carousel beranda (1600 × 600 px)

Sekarang dikelola dari **Admin Dashboard → Banner**: upload gambar, atur judul, subjudul,
tombol CTA, urutan, dan status aktif/draft. File di folder ini hanya isi awal.

Kalau gambar Anda sudah memuat teks sendiri (seperti banner NexShop), kosongkan kolom
Label Kecil, Judul, dan Subjudul di admin — overlay teks otomatis hilang dan gambar tampil penuh.

Sisi **kiri** banner tertutup gradient gelap untuk teks. Taruh visual utama di sisi kanan.

## `/berita` — Gambar artikel

Sekarang dikelola dari **Admin Dashboard → Berita**. File di folder ini hanya isi awal.

| File | Ukuran | Dipakai untuk |
|---|---|---|
| `berita-featured-1200x675.png` | 1200 × 675 | artikel sorotan (rasio 16:9) |
| `berita-1-800x500.png` … `berita-6-800x500.png` | 800 × 500 | kartu artikel (rasio 8:5) |

## Catatan upload di admin

Format yang diterima: **SVG, PNG, WebP** — maksimal 4MB, otomatis dikompres ke sekitar 50KB.
JPG tidak diterima; ubah dulu ke PNG atau WebP sebelum diunggah.
