# Gambar Placeholder — SAYBA ARC

File di folder `banners/`, `promo/`, dan `berita/` adalah **placeholder** bergaya tema situs
(hitam + oranye `#ff914d`). Ganti isinya dengan gambar asli, **pertahankan nama file dan
ukurannya** agar tidak perlu mengubah kode sama sekali.

> Logo (`logo.png`, `Sayba Arc.png`, dll.) di root `public/` bukan placeholder — jangan diganti.

## `/banners` — Hero banner tiap halaman (1920 × 600 px)

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

| File | Slide |
|---|---|
| `promo-1-1600x600.png` | GIS & Pemetaan |
| `promo-2-1600x600.png` | Web & Aplikasi |
| `promo-3-1600x600.png` | Dokumen Siap Pakai |

Teks slide diatur di `lib/data.ts` → `promoBanners`. Kalau gambar Anda sudah memuat teks
sendiri (seperti banner NexShop), kosongkan `eyebrow`, `title`, dan `subtitle` — overlay teks
otomatis hilang dan gambar tampil penuh.

Sisi **kiri** banner tertutup gradient gelap untuk teks. Taruh visual utama di sisi kanan.

## `/berita` — Gambar artikel

| File | Ukuran | Dipakai untuk |
|---|---|---|
| `berita-featured-1200x675.png` | 1200 × 675 | artikel sorotan (rasio 16:9) |
| `berita-1-800x500.png` … `berita-6-800x500.png` | 800 × 500 | kartu artikel (rasio 8:5) |

Pemetaan gambar ke artikel diatur di `lib/news-data.ts` pada field `image`.

## Menambah gambar baru

1. Simpan file di salah satu folder di atas.
2. Rujuk dengan path absolut dari root, contoh: `/berita/berita-7-800x500.png`.
3. Format bebas (`.png`, `.jpg`, `.webp`) — cukup sesuaikan nama di kode.
