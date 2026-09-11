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

## `/banners` — Hero banner tiap halaman

Disimpan sebagai **WebP** — ukurannya 88% lebih kecil dari PNG dengan tampilan
setara (total 1.135KB menjadi 132KB). Kalau menimpa dengan berkas sendiri,
simpan juga sebagai `.webp` agar namanya tetap cocok.

Dua ukuran per halaman: **1920 × 600** untuk desktop dan **900 × 450** untuk
ponsel (rasio 2:1, supaya tidak terpotong di layar sempit).

Diganti dengan **menimpa file**, pertahankan nama filenya.

| File | Dipakai di |
|---|---|
| `services-1920x600.webp` | `/services` — Layanan |
| `products-1920x600.webp` | `/products` — Produk |
| `portfolio-1920x600.webp` | `/portfolio` — Portofolio |
| `berita-1920x600.webp` | `/berita` — Berita |
| `about-1920x600.webp` | `/about` — Tentang Kami |
| `contact-1920x600.webp` | `/contact` — Kontak |

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

Format yang diterima: **SVG, PNG, WebP** — maksimal **4,5MB** per file.

Batas 4,5MB itu berasal dari Vercel (batas body request serverless function),
bukan dari aplikasi. File di atas itu tidak akan pernah sampai ke server.

JPG tidak diterima; ubah dulu ke PNG atau WebP sebelum diunggah.

### Apa yang terjadi pada gambar Anda

**Semua foto disimpan sebagai WebP**, apa pun format yang Anda unggah.
Transparansi tetap terjaga.

- Gambar yang sudah di bawah 500KB dan tidak lebih dari 2000px: satu kali
  konversi ke WebP dengan kualitas 90.
- Gambar yang lebih besar: dikecilkan ke maksimal **2000px** pada sisi
  terpanjangnya, lalu disimpan sebagai WebP kualitas 82, turun bertahap sampai
  paling rendah 60 bila masih di atas 500KB.
- Berkas yang sudah berformat WebP dan ukurannya aman disimpan apa adanya,
  karena encode ulang hanya akan membuang kualitas tanpa menghemat apa pun.

**SVG tidak dikonversi.** SVG adalah vektor, bukan foto — menjadikannya raster
akan menghilangkan kemampuannya diperbesar tanpa pecah, yang justru jadi alasan
utama sebuah logo disimpan sebagai SVG.

Perbandingan yang diukur pada aset situs ini:

| Berkas | PNG asli | WebP |
|---|---|---|
| Logo transparan 256×256 | 25,7KB | **4,8KB** |
| Banner 1600×600 | 156,5KB | **19,2KB** |
| Foto 600×400 | 704,8KB | **197,7KB** |

Kenapa dikonversi ke WebP: PNG tidak bisa memampatkan foto. Pada pengujian,
foto 5MB butuh sekitar 105 detik untuk di-encode ulang sebagai PNG dan hasilnya
tetap ~2MB — cukup lama untuk membuat upload gagal. WebP menyelesaikannya dalam
sekitar 1,5 detik pada ukuran 476KB.

Hasil pengujian ukuran akhir:

| Masukan | Hasil | Dimensi | Waktu |
|---|---|---|---|
| Foto PNG 3000×2000 | 476KB WebP | 2000×1333 | 1,5 dtk |
| Foto WebP 3000×2000 | 381KB WebP | 2000×1333 | 2,4 dtk |
| Banner PNG 1600×600 | 366KB WebP | 1600×600 | 0,3 dtk |
| PNG transparan 1200×800 | 365KB WebP | 1200×800 | 0,3 dtk |
| Ikon PNG 128×128 | tidak diubah | 128×128 | — |
