# SAYBA ARC: Arah Desain & Sistem Warna

Sumber kebenaran tunggal untuk warna dan arah visual situs. Setiap keputusan
warna harus bisa dijelaskan dalam satu baris.

## Arah

**Dibaca sebagai:** situs konsultan IT & engineering untuk klien bisnis dan
instansi di Kalimantan Barat, dengan bahasa visual *technical drafting*, presisi, tenang, tanpa dekorasi berlebih.

**Design Read:** B2B konsultan teknik untuk pengambil keputusan instansi, gaya
*drafting board* (meja gambar), dial **ENERGY 2 / RHYTHM 2 / MOTION 2**.

| Dial | Nilai | Artinya di situs ini |
|---|---|---|
| **ENERGY** | 2 | Hero tegas, sisanya tenang. Bukan halaman yang berteriak. |
| **RHYTHM** | 2 | Komposisi konsisten dengan 2-3 jeda yang sengaja dibedakan bentuknya. |
| **MOTION** | 2 | Reveal saat masuk viewport + transisi hover. Tanpa gerakan berjalan terus. |

## Palet: Executive Navy

Navy sebagai warna otoritas, orange sebagai aksen terbatas, netral dingin
sebagai latar. Rasio pemakaian yang dituju: **navy dan netral mendominasi,
orange maksimal 10% dari tampilan.**

| Nama | Hex | Peran | Alasan |
|---|---|---|---|
| **Executive Navy** | `#112a46` | Header, banner, blok penting, latar gelap | Biru gelap memberi kesan mapan dan tepercaya, sesuai konteks konsultan B2B |
| **Vivid Orange** | `#f07a26` | Aksen: tombol utama, garis penanda, ikon indikator | Satu-satunya warna hangat, jadi mata langsung menemukan titik aksi |
| **Dark Gray** | `#2a2b2e` | Teks paragraf | Diambil dari warna gelap logo, lebih lembut dari hitam pekat untuk bacaan panjang |
| **Ice White** | `#f4f6f9` | Latar netral utama | Putih kebiruan yang lebih dingin dari putih biasa, menyatu dengan navy |

### Turunan

| Nama | Hex | Peran |
|---|---|---|
| Navy 800 | `#16345a` | Permukaan terangkat di atas navy |
| Navy 700 | `#1b3e6b` | Kartu di dalam section gelap |
| Ice Dim | `#ebeff5` | Section pembeda di latar terang |
| Ice Line | `#d8e0ea` | Garis pemisah dan batas kartu |
| Blue Slate | `#5a5c62` | Teks sekunder di latar terang |
| Orange Text | `#b45610` | Orange sebagai teks di latar terang |
| Orange Soft | `#f5a76c` | Aksen sekunder di latar gelap |

### Aturan pakai warna

1. **Orange hanya untuk aksen, maksimal 10% tampilan.** Jangan pakai orange
   sebagai latar section besar atau warna teks paragraf.
2. **Orange dilarang sebagai teks di latar terang** (2.58:1, gagal WCAG).
   Untuk teks gunakan `#b45610` (4.53:1 di Ice White).
3. **Tombol ber-fill orange wajib berteks navy** (5.21:1). Jangan teks putih
   di atas orange (2.79:1, gagal).
4. **Warna kategori hanya untuk border dan tint latar** (maksimal 30%
   opasitas), bukan warna teks. Semua teks memakai navy, ink, atau slate.
5. **Opacity teks minimal /75.** `/50` dan `/40` gagal kontras.
6. Semua pasangan teks/latar diverifikasi dengan `contrast-check.py`, bukan
   dikira-kira.

## Tipografi

**Geist** untuk seluruh teks. Alasan: satu keluarga huruf dengan bentuk angka
yang jelas dan tabular, berguna karena situs ini banyak menampilkan ukuran,
tanggal, dan nomor dokumen.

Skala ukuran (dari audit, bukan tebakan):

| Peran | Ukuran |
|---|---|
| Judul halaman | 24-28px mobile, 36-46px desktop |
| Judul section | 22px mobile, 36px desktop |
| Judul kartu | 15-18px |
| Badan teks | 14-16px, line-height 1.75, lebar maksimal 70ch |
| Meta / label | 11-12px |

## Motif: Meja Potong Arsitek

Motif identitas situs. Terinspirasi meja potong self-healing yang dipakai
drafter: kisi ukur, tanda registrasi di sudut, garis skala.

**Pemasangan:** motif ini dipasang sebagai **latar halaman penuh** lewat
`.board-page` di `app/layout.tsx`, bukan per section. Efeknya meja potong
terlihat konsisten dari atas sampai bawah halaman, dan section di atasnya
mengambang sebagai panel (`.board-panel`) sehingga tepi meja tetap tampak di
sela-sela section.

Alasan: latar yang konsisten membuat halaman terasa satu ruang kerja, bukan
tumpukan section yang masing-masing punya gaya sendiri.

Batasnya: opasitas garis di bawah 0.09 supaya tidak pernah bersaing dengan
teks, dan tidak ada orb, glow berwarna, atau gambar ilustrasi.

## Prinsip komposisi

1. **Satu fokus per layar.** Hero punya satu tombol utama, sisanya mendukung.
2. **Bentuk section dibedakan sesuai isinya.** Berita memakai kartu bergambar
   karena dibaca karena ketertarikan visual. Informasi memakai daftar bernomor
   karena dokumen dibaca karena judulnya. Perbedaan bentuk ini disengaja.
3. **Tanpa paket harga.** Layanan bersifat terpusat: lingkup, biaya, dan
   jadwal disusun per proyek dalam Kerangka Acuan Kerja.
4. **Tanpa klaim tanpa bukti.** Tidak ada angka statistik, testimoni, atau
   logo klien yang tidak bisa diverifikasi.

## Larangan

Tidak ada orb, lingkaran berputar, glow berwarna, atau partikel 3D. Tidak ada
animasi berjalan terus kecuali penanda tahap aktif pada diagram alir. Tidak ada
teks di bawah 11px. Tidak ada emoji di teks antarmuka.
